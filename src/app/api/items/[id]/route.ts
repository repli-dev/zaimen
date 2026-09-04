import { NextResponse } from "next/server";
import { requireCoupleUser } from "@/lib/session-guard";
import { deleteItem, jsonError, updateItem } from "@/lib/store";
import { normalizeUrl } from "@/lib/urls";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
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

    const patch: {
      name?: string;
      url?: string;
      notes?: string;
      boughtBySelf?: boolean;
    } = {};
    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json(
          { error: "Give this wish a name." },
          { status: 400 },
        );
      }
      patch.name = name;
    }
    if (typeof body.url === "string") patch.url = normalizeUrl(body.url);
    if (typeof body.notes === "string") patch.notes = body.notes.trim();
    if (typeof body.boughtBySelf === "boolean") {
      patch.boughtBySelf = body.boughtBySelf;
    }

    const result = await updateItem(id, user.me.id, patch);
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireCoupleUser();
    if (!user) {
      return NextResponse.json({ error: "Signed out." }, { status: 401 });
    }

    const { id } = await params;
    const result = await deleteItem(id, user.me.id);
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
