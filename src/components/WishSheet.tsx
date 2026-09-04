"use client";

import { FormEvent, useState } from "react";
import type { WishItem } from "@/lib/types";
import { CloseIcon } from "./Icons";

const inputClass =
  "w-full rounded-2xl bg-cream px-4 py-3.5 text-base text-ink outline-none ring-1 ring-blush/80 placeholder:text-muted/70 focus:ring-2 focus:ring-rose";

export function WishSheet({
  title,
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  title: string;
  initial?: Pick<WishItem, "name" | "url" | "notes">;
  onClose: () => void;
  onSave: (values: { name: string; url: string; notes: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave({ name, url, notes });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this wish.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!onDelete) return;
    setBusy(true);
    setError("");
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove this wish.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-ink/35"
        aria-label="Close"
        onClick={onClose}
      />
      <form
        onSubmit={submit}
        className="sheet-in relative w-full max-w-md rounded-t-[2rem] bg-card px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl sm:rounded-[2rem] sm:pb-6"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-blush" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-cream text-muted"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-bold">What do you want?</span>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Perfume, headphones, that mug…"
            required
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1.5 block text-sm font-bold">
            Product page <span className="font-semibold text-muted">(optional)</span>
          </span>
          <input
            className={inputClass}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            inputMode="url"
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-bold">
            Notes <span className="font-semibold text-muted">(color, size, hints…)</span>
          </span>
          <textarea
            className={`${inputClass} min-h-24 resize-none`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Rose gold, size M, the quieter version…"
          />
        </label>

        {error ? <p className="mb-3 text-sm font-bold text-rose-deep">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-rose py-3.5 text-base font-extrabold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : initial ? "Save changes" : "Add to my wishlist"}
        </button>

        {onDelete ? (
          confirmDelete ? (
            <button
              type="button"
              disabled={busy}
              onClick={remove}
              className="mt-2 w-full rounded-2xl bg-rose-deep/10 py-3 text-sm font-extrabold text-rose-deep"
            >
              Yes, remove this wish
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="mt-2 w-full py-3 text-sm font-bold text-muted"
            >
              Remove from my list
            </button>
          )
        ) : null}
      </form>
    </div>
  );
}
