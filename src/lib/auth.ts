import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Session } from "./types";

const COOKIE = "zaimen_session";
const MAX_AGE = 60 * 60 * 24 * 60;

function scrypt(password: string, salt: string) {
  return scryptSync(password, salt, 64);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scrypt(password, salt).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const next = scrypt(password, salt);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

async function getSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const secretPath = path.join(process.cwd(), "data", "session-secret");
  try {
    return (await readFile(secretPath, "utf8")).trim();
  } catch {
    const secret = randomBytes(32).toString("hex");
    await mkdir(path.dirname(secretPath), { recursive: true });
    await writeFile(secretPath, secret, "utf8");
    return secret;
  }
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function createSessionToken(session: Session) {
  const secret = await getSecret();
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload, secret)}`;
}

export async function readSessionToken(
  token: string | undefined,
): Promise<Session | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const secret = await getSecret();
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Session;
    if (!session?.partnerId) return null;
    return session;
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: Session) {
  const token = await createSessionToken(session);
  const jar = await cookies();
  const proto = (await headers()).get("x-forwarded-proto") ?? "http";
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: proto === "https",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return readSessionToken(jar.get(COOKIE)?.value);
}
