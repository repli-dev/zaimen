import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "./hosting";
import type { Couple, Partner, WishItem } from "./types";

type CoupleRow = {
  password_hash: string;
  salt: string;
  partners: Partner[] | string;
};

type ItemRow = {
  id: string;
  owner_id: string;
  name: string;
  url: string;
  notes: string;
  bought_by_self: boolean;
  created_at: string | Date;
  updated_at: string | Date;
};

function sql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("Database URL is missing.");
  }
  return neon(url);
}

let schemaReady: Promise<void> | null = null;

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = sql();
      await db`
        CREATE TABLE IF NOT EXISTS couple (
          id TEXT PRIMARY KEY,
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          partners JSONB NOT NULL
        )
      `;
      await db`
        CREATE TABLE IF NOT EXISTS items (
          id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL,
          name TEXT NOT NULL,
          url TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          bought_by_self BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        )
      `;
      await db`CREATE INDEX IF NOT EXISTS items_created_at_idx ON items (created_at DESC)`;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

function parsePartners(value: CoupleRow["partners"]): [Partner, Partner] {
  const partners = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(partners) || partners.length !== 2) {
    throw new Error("Couple data is invalid.");
  }
  return partners as [Partner, Partner];
}

function mapCouple(row: CoupleRow): Couple {
  return {
    passwordHash: row.password_hash,
    salt: row.salt,
    partners: parsePartners(row.partners),
  };
}

function mapItem(row: ItemRow): WishItem {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    url: row.url,
    notes: row.notes,
    boughtBySelf: Boolean(row.bought_by_self),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function getCouple(): Promise<Couple | null> {
  await ensureSchema();
  const rows = await sql()`
    SELECT password_hash, salt, partners
    FROM couple
    WHERE id = 'default'
    LIMIT 1
  `;
  if (!rows[0]) return null;
  return mapCouple(rows[0] as CoupleRow);
}

export async function getItems(): Promise<WishItem[]> {
  await ensureSchema();
  const rows = (await sql()`
    SELECT id, owner_id, name, url, notes, bought_by_self, created_at, updated_at
    FROM items
    ORDER BY created_at DESC
  `) as ItemRow[];
  return rows.map(mapItem);
}

export async function createCouple(couple: Couple) {
  await ensureSchema();
  const rows = await sql()`
    INSERT INTO couple (id, password_hash, salt, partners)
    VALUES (
      'default',
      ${couple.passwordHash},
      ${couple.salt},
      CAST(${JSON.stringify(couple.partners)} AS JSONB)
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;
  if (!rows[0]) {
    return { error: "Your couple space is already set up. Sign in instead." };
  }
  return { ok: true as const };
}

export async function addItem(item: WishItem) {
  await ensureSchema();
  const rows = (await sql()`
    INSERT INTO items (
      id, owner_id, name, url, notes, bought_by_self, created_at, updated_at
    )
    VALUES (
      ${item.id},
      ${item.ownerId},
      ${item.name},
      ${item.url},
      ${item.notes},
      ${item.boughtBySelf},
      ${item.createdAt},
      ${item.updatedAt}
    )
    RETURNING id, owner_id, name, url, notes, bought_by_self, created_at, updated_at
  `) as ItemRow[];
  return mapItem(rows[0]);
}

export async function updateItem(
  id: string,
  ownerId: string,
  patch: Partial<Pick<WishItem, "name" | "url" | "notes" | "boughtBySelf">>,
) {
  await ensureSchema();
  const existing = (await sql()`
    SELECT id, owner_id, name, url, notes, bought_by_self, created_at, updated_at
    FROM items
    WHERE id = ${id}
    LIMIT 1
  `) as ItemRow[];
  const row = existing[0];
  if (!row) return { error: "Wish not found.", status: 404 as const };
  if (row.owner_id !== ownerId) {
    return {
      error: "You can only edit your own wishlist.",
      status: 403 as const,
    };
  }

  const name = patch.name ?? row.name;
  const url = patch.url ?? row.url;
  const notes = patch.notes ?? row.notes;
  const bought = patch.boughtBySelf ?? row.bought_by_self;
  const updatedAt = new Date().toISOString();

  const rows = (await sql()`
    UPDATE items
    SET
      name = ${name},
      url = ${url},
      notes = ${notes},
      bought_by_self = ${bought},
      updated_at = ${updatedAt}
    WHERE id = ${id} AND owner_id = ${ownerId}
    RETURNING id, owner_id, name, url, notes, bought_by_self, created_at, updated_at
  `) as ItemRow[];
  return { item: mapItem(rows[0]) };
}

export async function deleteItem(id: string, ownerId: string) {
  await ensureSchema();
  const existing = (await sql()`
    SELECT owner_id FROM items WHERE id = ${id} LIMIT 1
  `) as { owner_id: string }[];
  const row = existing[0];
  if (!row) return { error: "Wish not found.", status: 404 as const };
  if (row.owner_id !== ownerId) {
    return {
      error: "You can only remove wishes from your own list.",
      status: 403 as const,
    };
  }
  await sql()`DELETE FROM items WHERE id = ${id} AND owner_id = ${ownerId}`;
  return { ok: true as const };
}
