import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getHostingIssue } from "@/lib/hosting";
import { getCouple, jsonError } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const hostingIssue = getHostingIssue();
    const couple = hostingIssue ? null : await getCouple();
    const session = hostingIssue ? null : await getSession();
    return NextResponse.json({
      configured: Boolean(couple),
      signedIn: Boolean(
        session && couple?.partners.some((p) => p.id === session.partnerId),
      ),
      hostingIssue,
    });
  } catch (error) {
    return jsonError(error);
  }
}
