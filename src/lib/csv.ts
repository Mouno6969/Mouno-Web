export function csvEscape(value: unknown) {
  if (value === null || value === undefined) return "";
  const text = value instanceof Date ? value.toISOString() : String(value);
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  if (/[",\n\r]/.test(safeText)) return `"${safeText.replace(/"/g, '""')}"`;
  return safeText;
}

export function toCsv(rows: unknown[][]) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

export function csvResponse(filename: string, rows: unknown[][]) {
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
