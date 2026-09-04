import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { jsonError, createCouple } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      myName?: string;
      partnerName?: string;
      password?: string;
    };

    const myName = body.myName?.trim() ?? "";
    const partnerName = body.partnerName?.trim() ?? "";
    const password = body.password ?? "";

    if (myName.length < 1 || partnerName.length < 1) {
      return NextResponse.json(
        { error: "Both of you need a name." },
        { status: 400 },
      );
    }
    if (password.length < 4) {
      return NextResponse.json(
        { error: "Pick a shared password with at least 4 characters." },
        { status: 400 },
      );
    }

    const meId = randomUUID();
    const { salt, hash } = hashPassword(password);
    const result = await createCouple({
      salt,
      passwordHash: hash,
      partners: [
        { id: meId, name: myName },
        { id: randomUUID(), name: partnerName },
      ],
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    await setSessionCookie({ partnerId: meId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
