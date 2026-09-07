export type SortDirection = "asc" | "desc";

export function pageNumber(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

export function filterAndSort<T>(rows: T[], values: ((row: T) => string | number)[], search: string, sortValue?: (row: T) => string | number, direction: SortDirection = "asc") {
  const query = search.trim().toLocaleLowerCase("id-ID");
  const filtered = rows.filter(row => !query || values.some(value => String(value(row)).toLocaleLowerCase("id-ID").includes(query)));
  if (sortValue) filtered.sort((a, b) => {
    const left = sortValue(a), right = sortValue(b);
    const comparison = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right), "id", { numeric: true, sensitivity: "base" });
    return direction === "asc" ? comparison : -comparison;
  });
  return filtered;
}
