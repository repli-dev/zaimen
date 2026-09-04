import { NextResponse } from "next/server";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { getCouple } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    password?: string;
    partnerId?: string;
  };
  const couple = await getCouple();

  if (!couple) {
    return NextResponse.json(
      { error: "No couple space yet. Create one first." },
      { status: 404 },
    );
  }

  if (!verifyPassword(body.password ?? "", couple.salt, couple.passwordHash)) {
    return NextResponse.json(
      { error: "That password doesn’t match." },
      { status: 401 },
    );
  }

  const me = couple.partners.find((partner) => partner.id === body.partnerId);
  if (!me) {
    return NextResponse.json(
      { error: "Pick who you are." },
      { status: 400 },
    );
  }

  await setSessionCookie({ partnerId: me.id });
  return NextResponse.json({ ok: true });
}
