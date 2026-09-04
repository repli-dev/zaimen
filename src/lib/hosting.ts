export class AppConfigError extends Error {
  code: "NO_DATABASE" | "NO_SESSION_SECRET";

  constructor(
    code: "NO_DATABASE" | "NO_SESSION_SECRET",
    message: string,
  ) {
    super(message);
    this.name = "AppConfigError";
    this.code = code;
  }
}

export function getDatabaseUrl() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ""
  );
}

export function getHostingIssue(): "NO_DATABASE" | "NO_SESSION_SECRET" | null {
  if (!process.env.VERCEL) return null;
  if (!getDatabaseUrl()) return "NO_DATABASE";
  if (!process.env.SESSION_SECRET) return "NO_SESSION_SECRET";
  return null;
}

export function assertHostCanWrite() {
  const issue = getHostingIssue();
  if (issue === "NO_DATABASE") {
    throw new AppConfigError(
      "NO_DATABASE",
      "This hosted app needs a database. In Vercel, open Storage → Create Database → Neon, connect it to this project, then redeploy.",
    );
  }
  if (issue === "NO_SESSION_SECRET") {
    throw new AppConfigError(
      "NO_SESSION_SECRET",
      "Add a SESSION_SECRET environment variable in Vercel (a long random string), then redeploy.",
    );
  }
}

export function usesPostgres() {
  return Boolean(getDatabaseUrl());
}
