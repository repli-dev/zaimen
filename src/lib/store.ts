import { NextResponse } from "next/server";
import { AppConfigError, assertHostCanWrite, usesPostgres } from "./hosting";
import * as fileStore from "./store-file";
import * as pgStore from "./store-pg";
import type { Couple, WishItem } from "./types";

function store() {
  return usesPostgres() ? pgStore : fileStore;
}

export async function getCouple() {
  if (!usesPostgres() && process.env.VERCEL) return null;
  return store().getCouple();
}

export async function getItems() {
  if (!usesPostgres() && process.env.VERCEL) return [];
  return store().getItems();
}

export async function createCouple(couple: Couple) {
  assertHostCanWrite();
  return store().createCouple(couple);
}

export async function addItem(item: WishItem) {
  assertHostCanWrite();
  return store().addItem(item);
}

export async function updateItem(
  id: string,
  ownerId: string,
  patch: Partial<Pick<WishItem, "name" | "url" | "notes" | "boughtBySelf">>,
) {
  assertHostCanWrite();
  return store().updateItem(id, ownerId, patch);
}

export async function deleteItem(id: string, ownerId: string) {
  assertHostCanWrite();
  return store().deleteItem(id, ownerId);
}

export function jsonError(error: unknown) {
  if (error instanceof AppConfigError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 503 },
    );
  }
  console.error(error);
  return NextResponse.json(
    { error: "Something went wrong." },
    { status: 500 },
  );
}
