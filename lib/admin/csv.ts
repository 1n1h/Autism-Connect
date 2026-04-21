/** Small CSV helper. No external dep — handles quoting + embedded quotes/commas. */

export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const lines: string[] = [headers.map(escape).join(",")];
  for (const row of rows) {
    lines.push(row.map(escape).join(","));
  }
  return lines.join("\r\n");
}

function escape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function csvResponseHeaders(filename: string): HeadersInit {
  return {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}"`,
  };
}

export function todayStamp(): string {
  return new Date().toISOString().split("T")[0];
}
