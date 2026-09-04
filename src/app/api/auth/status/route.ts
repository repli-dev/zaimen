import { NextResponse } from "next/server";
import { getCouple } from "@/lib/store";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const couple = await getCouple();
  const session = await getSession();
  return NextResponse.json({
    configured: Boolean(couple),
    signedIn: Boolean(session && couple?.partners.some((p) => p.id === session.partnerId)),
  });
}
