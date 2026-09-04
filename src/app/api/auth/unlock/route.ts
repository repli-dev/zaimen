import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";
import { getCouple } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const password = body.password ?? "";
  const couple = await getCouple();

  if (!couple) {
    return NextResponse.json(
      { error: "No couple space yet. Create one first." },
      { status: 404 },
    );
  }

  if (!verifyPassword(password, couple.salt, couple.passwordHash)) {
    return NextResponse.json(
      { error: "That password doesn’t match." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    partners: couple.partners.map(({ id, name }) => ({ id, name })),
  });
}
