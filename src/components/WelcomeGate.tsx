"use client";

import { FormEvent, type ReactNode, useState } from "react";
import { api } from "@/lib/client";
import { HeartMark } from "./Icons";

type PartnerOption = { id: string; name: string };

export function WelcomeGate({
  configured,
  hostingIssue,
  onSignedIn,
}: {
  configured: boolean;
  hostingIssue?: "NO_DATABASE" | "NO_SESSION_SECRET" | null;
  onSignedIn: () => void;
}) {
  const [mode, setMode] = useState<"welcome" | "setup" | "login">(
    configured ? "login" : "welcome",
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <header className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-white/70 shadow-sm ring-1 ring-blush/70">
          <HeartMark className="heart-beat h-10 w-10" />
        </div>
        <p className="text-xs font-extrabold tracking-[0.28em] text-rose uppercase">
          for two
        </p>
        <h1 className="font-display mt-1 text-4xl font-semibold tracking-tight text-ink">
          Zaimen
        </h1>
        <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted">
          Your wishlists, together. Keep the surprises. Skip the double gifts.
        </p>
      </header>

      {hostingIssue ? <HostingHelp issue={hostingIssue} /> : null}

      {!hostingIssue && mode === "welcome" && (
        <div className="fade-in mt-auto space-y-3">
          <button
            type="button"
            onClick={() => setMode("setup")}
            className="w-full rounded-2xl bg-rose py-4 text-base font-extrabold text-white shadow-lg shadow-rose/25 active:scale-[0.99]"
          >
            Start our wishlist
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className="w-full rounded-2xl bg-white/80 py-4 text-base font-bold text-ink ring-1 ring-blush active:scale-[0.99]"
          >
            We already have a password
          </button>
        </div>
      )}

      {!hostingIssue && mode === "setup" && (
        <SetupForm
          onBack={() => setMode(configured ? "login" : "welcome")}
          onSignedIn={onSignedIn}
        />
      )}

      {!hostingIssue && mode === "login" && (
        <LoginForm
          onBack={() => setMode(configured ? "login" : "welcome")}
          showBack={!configured}
          onCreate={() => setMode("setup")}
          configured={configured}
          onSignedIn={onSignedIn}
        />
      )}
    </div>
  );
}

function HostingHelp({
  issue,
}: {
  issue: "NO_DATABASE" | "NO_SESSION_SECRET";
}) {
  return (
    <div className="paper-card fade-in rounded-3xl p-5 text-left">
      <h2 className="font-display text-2xl font-semibold">One more step</h2>
      {issue === "NO_DATABASE" ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Vercel can’t keep wishlists in a local folder. In your Vercel project,
          open <span className="font-bold text-ink">Storage</span> →{" "}
          <span className="font-bold text-ink">Create Database</span> →{" "}
          <span className="font-bold text-ink">Neon</span>, connect it, then
          redeploy.
        </p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Add a <span className="font-bold text-ink">SESSION_SECRET</span>{" "}
          environment variable in Vercel — any long random string — then
          redeploy.
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl bg-white px-4 py-3.5 text-base text-ink outline-none ring-1 ring-blush/80 placeholder:text-muted/70 focus:ring-2 focus:ring-rose";

function SetupForm({
  onBack,
  onSignedIn,
}: {
  onBack: () => void;
  onSignedIn: () => void;
}) {
  const [myName, setMyName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/setup", {
        method: "POST",
        body: JSON.stringify({ myName, partnerName, password }),
      });
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your space.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="fade-in paper-card space-y-4 rounded-3xl p-5">
      <div>
        <h2 className="font-display text-2xl font-semibold">Create your space</h2>
        <p className="mt-1 text-sm text-muted">
          One shared password. Two wishlists. That’s the whole setup.
        </p>
      </div>
      <Field label="Your name">
        <input
          className={inputClass}
          value={myName}
          onChange={(e) => setMyName(e.target.value)}
          placeholder="e.g. Zaid"
          autoComplete="name"
          required
        />
      </Field>
      <Field label="Partner’s name">
        <input
          className={inputClass}
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          placeholder="e.g. Sara"
          required
        />
      </Field>
      <Field
        label="Shared password"
        hint="You’ll both use this on your phones. Don’t make it your bank PIN."
      >
        <input
          className={inputClass}
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 4 characters"
          autoComplete="new-password"
          minLength={4}
          required
        />
      </Field>
      {error ? <p className="text-sm font-bold text-rose-deep">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-2xl bg-rose py-3.5 text-base font-extrabold text-white disabled:opacity-60"
      >
        {busy ? "Creating…" : "Open our wishlist"}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full py-2 text-sm font-bold text-muted"
      >
        Back
      </button>
    </form>
  );
}

function LoginForm({
  configured,
  showBack,
  onBack,
  onCreate,
  onSignedIn,
}: {
  configured: boolean;
  showBack: boolean;
  onBack: () => void;
  onCreate: () => void;
  onSignedIn: () => void;
}) {
  const [password, setPassword] = useState("");
  const [partners, setPartners] = useState<PartnerOption[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api<{ partners: PartnerOption[] }>("/api/auth/unlock", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setPartners(data.partners);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unlock.");
    } finally {
      setBusy(false);
    }
  }

  async function choose(partnerId: string) {
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ password, partnerId }),
      });
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  if (partners) {
    return (
      <div className="fade-in paper-card space-y-4 rounded-3xl p-5">
        <div>
          <h2 className="font-display text-2xl font-semibold">Who’s this?</h2>
          <p className="mt-1 text-sm text-muted">
            Pick yourself so your partner’s list stays a surprise.
          </p>
        </div>
        <div className="grid gap-3">
          {partners.map((person) => (
            <button
              key={person.id}
              type="button"
              disabled={busy}
              onClick={() => choose(person.id)}
              className="rounded-2xl bg-cream px-4 py-5 text-left ring-1 ring-blush transition active:scale-[0.99] disabled:opacity-60"
            >
              <span className="font-display text-xl font-semibold">{person.name}</span>
              <span className="mt-1 block text-sm text-muted">This is me</span>
            </button>
          ))}
        </div>
        {error ? <p className="text-sm font-bold text-rose-deep">{error}</p> : null}
        <button
          type="button"
          onClick={() => setPartners(null)}
          className="w-full py-2 text-sm font-bold text-muted"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={unlock} className="fade-in paper-card space-y-4 rounded-3xl p-5">
      <div>
        <h2 className="font-display text-2xl font-semibold">Welcome back</h2>
        <p className="mt-1 text-sm text-muted">
          Enter the password you share, then pick who you are.
        </p>
      </div>
      <Field label="Shared password">
        <input
          className={inputClass}
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your couple password"
          autoComplete="current-password"
          required
        />
      </Field>
      {error ? <p className="text-sm font-bold text-rose-deep">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-2xl bg-rose py-3.5 text-base font-extrabold text-white disabled:opacity-60"
      >
        {busy ? "Checking…" : "Continue"}
      </button>
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2 text-sm font-bold text-muted"
        >
          Back
        </button>
      ) : null}
      {!configured ? (
        <button
          type="button"
          onClick={onCreate}
          className="w-full py-2 text-sm font-bold text-rose"
        >
          Start a new couple space
        </button>
      ) : null}
    </form>
  );
}
