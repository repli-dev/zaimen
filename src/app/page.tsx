"use client";

import { useCallback, useEffect, useState } from "react";
import { WelcomeGate } from "@/components/WelcomeGate";
import { WishlistApp } from "@/components/WishlistApp";
import { HeartMark } from "@/components/Icons";
import { api } from "@/lib/client";
import type { Me } from "@/lib/types";

type Status = {
  configured: boolean;
  signedIn: boolean;
  hostingIssue?: "NO_DATABASE" | "NO_SESSION_SECRET" | null;
};

export default function Home() {
  const [status, setStatus] = useState<Status | null>(null);
  const [me, setMe] = useState<Me | null>(null);

  const refresh = useCallback(async () => {
    const next = await api<Status>("/api/auth/status");
    setStatus(next);
    if (next.signedIn) {
      const profile = await api<Me>("/api/auth/me");
      setMe(profile);
    } else {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setStatus({ configured: false, signedIn: false });
    });
  }, [refresh]);

  if (!status) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HeartMark className="heart-beat h-14 w-14" />
      </div>
    );
  }

  if (!me) {
    return (
      <WelcomeGate
        configured={status.configured}
        hostingIssue={status.hostingIssue}
        onSignedIn={() => {
          refresh().catch(() => undefined);
        }}
      />
    );
  }

  return (
    <WishlistApp
      me={me}
      onSignedOut={() => {
        setMe(null);
        setStatus((current) => ({
          configured: current?.configured ?? true,
          signedIn: false,
        }));
      }}
    />
  );
}
