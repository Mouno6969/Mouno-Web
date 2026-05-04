export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function cleanText(value: FormDataEntryValue | null, max = 240) {
  return String(value || "").trim().slice(0, max);
}
