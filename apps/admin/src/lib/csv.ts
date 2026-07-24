/**
 * CSV export helper (design: the "Export CSV" ghost button on every list).
 * Values are quoted per RFC 4180; dates serialize as ISO.
 */
export function csvResponse(
  filename: string,
  headers: readonly string[],
  rows: readonly (readonly unknown[])[],
): Response {
  const cell = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const text = value instanceof Date ? value.toISOString() : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const body = [headers, ...rows].map((row) => row.map(cell).join(",")).join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
