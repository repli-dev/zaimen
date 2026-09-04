import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireCoupleUser } from "@/lib/session-guard";
import { getItems, mutateStore } from "@/lib/store";
import { normalizeUrl } from "@/lib/urls";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireCoupleUser();
  if (!user) {
    return NextResponse.json({ error: "Signed out." }, { status: 401 });
  }
  const items = await getItems();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const user = await requireCoupleUser();
  if (!user) {
    return NextResponse.json({ error: "Signed out." }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    url?: string;
    notes?: string;
  };
  const name = body.name?.trim() ?? "";
  if (!name) {
    return NextResponse.json(
      { error: "Give this wish a name." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const item = await mutateStore((store) => {
    const next = {
      id: randomUUID(),
      ownerId: user.me.id,
      name,
      url: normalizeUrl(body.url ?? ""),
      notes: body.notes?.trim() ?? "",
      boughtBySelf: false,
      createdAt: now,
      updatedAt: now,
    };
    store.items.unshift(next);
    return next;
  });

  return NextResponse.json({ item });
}
