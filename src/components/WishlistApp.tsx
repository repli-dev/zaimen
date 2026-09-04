"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/client";
import type { Me, WishItem } from "@/lib/types";
import { GearIcon, HeartMark, PlusIcon } from "./Icons";
import { WishCard } from "./WishCard";
import { WishSheet } from "./WishSheet";

type Tab = "mine" | "theirs";

export function WishlistApp({
  me,
  onSignedOut,
}: {
  me: Me;
  onSignedOut: () => void;
}) {
  const [tab, setTab] = useState<Tab>("mine");
  const [items, setItems] = useState<WishItem[]>([]);
  const [sheet, setSheet] = useState<"add" | WishItem | "settings" | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const data = await api<{ items: WishItem[] }>("/api/items");
    setItems(data.items);
  }, []);

  useEffect(() => {
    load().catch((err) => {
      setError(err instanceof Error ? err.message : "Could not load wishes.");
    });
    const id = setInterval(() => {
      load().catch(() => undefined);
    }, 12000);
    return () => clearInterval(id);
  }, [load]);

  const mine = useMemo(
    () => items.filter((item) => item.ownerId === me.me.id),
    [items, me.me.id],
  );
  const theirs = useMemo(
    () => items.filter((item) => item.ownerId === me.partner.id),
    [items, me.partner.id],
  );
  const visible = tab === "mine" ? mine : theirs;

  async function toggleBought(item: WishItem) {
    const next = !item.boughtBySelf;
    setItems((current) =>
      current.map((wish) =>
        wish.id === item.id ? { ...wish, boughtBySelf: next } : wish,
      ),
    );
    try {
      await api(`/api/items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ boughtBySelf: next }),
      });
    } catch (err) {
      setItems((current) =>
        current.map((wish) =>
          wish.id === item.id ? { ...wish, boughtBySelf: item.boughtBySelf } : wish,
        ),
      );
      setError(err instanceof Error ? err.message : "Could not update that wish.");
    }
  }

  async function signOut() {
    await api("/api/auth/logout", { method: "POST" });
    onSignedOut();
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="sticky top-0 z-20 bg-cream/85 px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HeartMark className="h-8 w-8" />
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.22em] text-rose uppercase">
                Zaimen
              </p>
              <h1 className="font-display text-[1.65rem] leading-none font-semibold">
                Hey, {me.me.name}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSheet("settings")}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink ring-1 ring-blush"
            aria-label="Settings"
          >
            <GearIcon />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 rounded-full bg-white p-1 ring-1 ring-blush">
          <TabButton active={tab === "mine"} onClick={() => setTab("mine")}>
            My wishes
          </TabButton>
          <TabButton active={tab === "theirs"} onClick={() => setTab("theirs")}>
            {possessive(me.partner.name)}
          </TabButton>
        </div>
      </header>

      <main className="flex-1 px-5 pb-28">
        <p className="mb-3 text-sm text-muted">
          {tab === "mine"
            ? "Add the things you’d love. Mark anything you already bought so they don’t get it twice."
            : `Shop in secret. You can look — you just can’t mark their gifts as bought.`}
        </p>

        {error ? (
          <p className="mb-3 rounded-2xl bg-rose/10 px-3 py-2 text-sm font-bold text-rose-deep">
            {error}
          </p>
        ) : null}

        {visible.length === 0 ? (
          <EmptyState tab={tab} partnerName={me.partner.name} />
        ) : (
          <div className="space-y-3">
            {visible.map((item) => (
              <WishCard
                key={item.id}
                item={item}
                isMine={tab === "mine"}
                onEdit={() => setSheet(item)}
                onToggleBought={() => toggleBought(item)}
              />
            ))}
          </div>
        )}
      </main>

      {tab === "mine" ? (
        <button
          type="button"
          onClick={() => setSheet("add")}
          className="fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 flex h-14 items-center gap-2 rounded-full bg-rose px-5 font-extrabold text-white shadow-lg shadow-rose/30"
        >
          <PlusIcon className="h-5 w-5" />
          Add a wish
        </button>
      ) : null}

      {sheet === "add" ? (
        <WishSheet
          title="A little wish"
          onClose={() => setSheet(null)}
          onSave={async (values) => {
            await api("/api/items", {
              method: "POST",
              body: JSON.stringify(values),
            });
            await load();
            setSheet(null);
          }}
        />
      ) : null}

      {sheet && typeof sheet === "object" ? (
        <WishSheet
          title="Edit wish"
          initial={sheet}
          onClose={() => setSheet(null)}
          onSave={async (values) => {
            await api(`/api/items/${sheet.id}`, {
              method: "PATCH",
              body: JSON.stringify(values),
            });
            await load();
            setSheet(null);
          }}
          onDelete={async () => {
            await api(`/api/items/${sheet.id}`, { method: "DELETE" });
            await load();
            setSheet(null);
          }}
        />
      ) : null}

      {sheet === "settings" ? (
        <SettingsSheet
          me={me}
          onClose={() => setSheet(null)}
          onSignOut={signOut}
        />
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full py-2.5 text-sm font-extrabold ${
        active ? "bg-rose text-white shadow-sm" : "text-muted"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ tab, partnerName }: { tab: Tab; partnerName: string }) {
  return (
    <div className="paper-card mt-6 rounded-3xl px-6 py-12 text-center">
      <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-blush/50">
        <HeartMark className="h-8 w-8" />
      </div>
      {tab === "mine" ? (
        <>
          <h2 className="font-display text-2xl font-semibold">Your list is empty</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Add something you’d love — a link helps, notes like size or color help even more.
          </p>
        </>
      ) : (
        <>
          <h2 className="font-display text-2xl font-semibold">
            {partnerName} hasn’t added wishes yet
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Check back soon. This is where you’ll peek for surprise gifts.
          </p>
        </>
      )}
    </div>
  );
}

function SettingsSheet({
  me,
  onClose,
  onSignOut,
}: {
  me: Me;
  onClose: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-ink/35"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="sheet-in relative w-full max-w-md rounded-t-[2rem] bg-card px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl sm:rounded-[2rem]">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-blush" />
        <h2 className="font-display text-2xl font-semibold">Your couple space</h2>
        <p className="mt-2 text-sm text-muted">
          You’re signed in as {me.me.name}. {me.partner.name} can see your list, but they
          can’t mark your gifts as bought — that keeps the surprise.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-cream px-3 py-4">
            <p className="text-[10px] font-extrabold tracking-wider text-rose uppercase">
              You
            </p>
            <p className="font-display mt-1 text-lg font-semibold">{me.me.name}</p>
          </div>
          <div className="rounded-2xl bg-cream px-3 py-4">
            <p className="text-[10px] font-extrabold tracking-wider text-gold uppercase">
              Partner
            </p>
            <p className="font-display mt-1 text-lg font-semibold">{me.partner.name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-5 w-full rounded-2xl bg-ink py-3.5 text-sm font-extrabold text-white"
        >
          Sign out
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-3 text-sm font-bold text-muted"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function possessive(name: string) {
  return name.toLowerCase().endsWith("s") ? `${name}’ wishes` : `${name}’s wishes`;
}
