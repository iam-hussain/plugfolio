/**
 * The one client seam every feature's `api.ts` calls into (§5: components don't
 * `fetch` inline). It sends the signed device cookie (`credentials: same-origin`,
 * §6.7), serializes JSON bodies, and unwraps the API's `{ error: { message } }`
 * envelope into a thrown `Error` — so no feature re-types that boilerplate.
 */
type SendOptions = {
  /** Message thrown when the response carries no error envelope. */
  fallbackMessage?: string;
  /** Let the request outlive the page (view/tap beacons). */
  keepalive?: boolean;
};

async function readError(response: Response, fallback: string): Promise<Error> {
  const problem = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } | null;
  return new Error(problem?.error?.message ?? fallback);
}

/** Send a JSON request; resolves to the parsed body, or `undefined` if empty. */
export async function apiSend<T = void>(
  path: string,
  method: string,
  body?: unknown,
  options: SendOptions = {},
): Promise<T> {
  const hasBody = body !== undefined;
  const response = await fetch(path, {
    method,
    headers: hasBody ? { "content-type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
    keepalive: options.keepalive,
  });
  if (!response.ok) throw await readError(response, options.fallbackMessage ?? "Request failed");
  return (await response.json().catch(() => undefined)) as T;
}

export const apiPost = <T = void>(path: string, body?: unknown, options?: SendOptions) =>
  apiSend<T>(path, "POST", body, options);
export const apiPatch = <T = void>(path: string, body?: unknown, options?: SendOptions) =>
  apiSend<T>(path, "PATCH", body, options);
export const apiPut = <T = void>(path: string, body?: unknown, options?: SendOptions) =>
  apiSend<T>(path, "PUT", body, options);
export const apiDelete = <T = void>(path: string, options?: SendOptions) =>
  apiSend<T>(path, "DELETE", undefined, options);

/**
 * Multipart upload (ADR-0023) — can't ride the JSON path. The API processes the
 * file and returns a JSON body (e.g. the stored URL).
 */
export async function apiUpload<T = { url: string }>(
  path: string,
  file: File,
  options: SendOptions = {},
): Promise<T> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(path, { method: "POST", body: form, credentials: "same-origin" });
  if (!response.ok) throw await readError(response, options.fallbackMessage ?? "Upload failed");
  return (await response.json()) as T;
}
