import { NextResponse } from "next/server";
import { requireCoupleUser } from "@/lib/session-guard";
import { mutateStore } from "@/lib/store";
import { normalizeUrl } from "@/lib/urls";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await requireCoupleUser();
  if (!user) {
    return NextResponse.json({ error: "Signed out." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    name?: string;
    url?: string;
    notes?: string;
    boughtBySelf?: boolean;
  };

  const result = await mutateStore((store) => {
    const item = store.items.find((wish) => wish.id === id);
    if (!item) return { error: "Wish not found.", status: 404 as const };
    if (item.ownerId !== user.me.id) {
      return {
        error: "You can only edit your own wishlist.",
        status: 403 as const,
      };
    }

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (!name) {
        return { error: "Give this wish a name.", status: 400 as const };
      }
      item.name = name;
    }
    if (typeof body.url === "string") item.url = normalizeUrl(body.url);
    if (typeof body.notes === "string") item.notes = body.notes.trim();
    if (typeof body.boughtBySelf === "boolean") {
      item.boughtBySelf = body.boughtBySelf;
    }
    item.updatedAt = new Date().toISOString();
    return { item };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result);
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await requireCoupleUser();
  if (!user) {
    return NextResponse.json({ error: "Signed out." }, { status: 401 });
  }

  const { id } = await params;
  const result = await mutateStore((store) => {
    const item = store.items.find((wish) => wish.id === id);
    if (!item) return { error: "Wish not found.", status: 404 as const };
    if (item.ownerId !== user.me.id) {
      return {
        error: "You can only remove wishes from your own list.",
        status: 403 as const,
      };
    }
    store.items = store.items.filter((wish) => wish.id !== id);
    return { ok: true as const };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result);
}
