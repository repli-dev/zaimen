"use client";

import type { WishItem } from "@/lib/types";
import { hostnameOf } from "@/lib/urls";
import { LinkIcon } from "./Icons";

export function WishCard({
  item,
  isMine,
  onEdit,
  onToggleBought,
}: {
  item: WishItem;
  isMine: boolean;
  onEdit: () => void;
  onToggleBought: () => void;
}) {
  const bought = item.boughtBySelf;

  return (
    <article
      className={`paper-card relative overflow-hidden rounded-3xl p-4 ${
        bought ? "bg-cream-deep/80" : ""
      }`}
    >
      {bought && !isMine ? (
        <span className="stamp absolute right-3 top-3 rounded-full bg-sage px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase">
          already has this
        </span>
      ) : null}

      <h3 className="font-display pr-24 text-xl font-semibold leading-snug text-ink">
        {item.name}
      </h3>

      {item.notes ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">{item.notes}</p>
      ) : null}

      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blush/60 px-3 py-1.5 text-xs font-extrabold text-rose-deep"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          {hostnameOf(item.url)}
        </a>
      ) : null}

      {isMine ? (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-blush/70 pt-3">
          <button
            type="button"
            onClick={onToggleBought}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold ${
              bought
                ? "bg-sage text-white"
                : "bg-cream text-muted ring-1 ring-blush"
            }`}
            aria-pressed={bought}
          >
            <span
              className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${
                bought ? "bg-white text-sage" : "bg-white ring-1 ring-blush"
              }`}
            >
              {bought ? "✓" : ""}
            </span>
            I already bought this
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-extrabold text-rose"
          >
            Edit
          </button>
        </div>
      ) : bought ? (
        <p className="mt-4 text-xs font-bold text-sage">
          They got this themselves — skip it so you don’t double-buy.
        </p>
      ) : (
        <p className="mt-4 text-xs font-bold text-gold">
          Surprise material. Don’t tell them you saw this.
        </p>
      )}
    </article>
  );
}
