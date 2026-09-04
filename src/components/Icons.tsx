export function HeartMark({
  className = "h-10 w-10",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path
        fill="#C45C6A"
        d="M32 54s-18.5-11.4-24.6-21.2C3.4 25.6 6.2 14 16.1 12.2c5.3-1 10 1.6 12.9 5.8 2.9-4.2 7.6-6.8 12.9-5.8 9.9 1.8 12.7 13.4 8.7 20.6C50.5 42.6 32 54 32 54z"
      />
      <path
        fill="#fff"
        opacity="0.28"
        d="M22 18c-4.2.4-7.2 4.2-6.6 8.2.2 1.4 1.8 1.8 2.4.6 1.2-2.6 3.6-4.8 6.8-5.4 1.5-.3 1.8-2.2.4-2.8-1-.4-2-.6-3-.6z"
      />
    </svg>
  );
}

export function PlusIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M10 14a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 6.93"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 10a5 5 0 0 0-7.07 0L5.5 11.41a5 5 0 0 0 7.07 7.07L14 17.07"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GearIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 13a7.8 7.8 0 0 0 .1-2l2-1.2-2-3.4-2.3.6a8 8 0 0 0-1.7-1L15 4h-6l-.5 2.4a8 8 0 0 0-1.7 1L8.5 6.4 4.5 9.8 6.5 11a7.8 7.8 0 0 0 0 2l-2 1.2 2 3.4 2.3-.6a8 8 0 0 0 1.7 1L9 20h6l.5-2.4a8 8 0 0 0 1.7-1l2.3.6 2-3.4-2-1.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
