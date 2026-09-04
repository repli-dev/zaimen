async function parseError(res: Response) {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error || "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<T>;
}
