import { NextResponse } from "next/server";
import { requireCoupleUser } from "@/lib/session-guard";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireCoupleUser();
  if (!user) {
    return NextResponse.json({ error: "Signed out." }, { status: 401 });
  }
  return NextResponse.json({ me: user.me, partner: user.partner });
}
