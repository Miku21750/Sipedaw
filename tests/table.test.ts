import { describe, expect, it } from "vitest";
import { filterAndSort, pageNumber } from "../src/lib/table";

describe("table pagination and filtering", () => {
  it("rejects malformed pagination and caps page size", () => {
    for (const value of [null, "", "abc", "Infinity", "-1", "0", "1.5"]) expect(pageNumber(value, 20, 100)).toBe(20);
    expect(pageNumber("250", 20, 100)).toBe(100);
    expect(pageNumber("2", 1)).toBe(2);
  });
  it("searches and sorts all records before slicing pages without mutating the source", () => {
    const rows = Array.from({ length: 65 }, (_, i) => ({ name: `Warga ${i + 1}`, team: i % 2 ? "Utara" : "Selatan", count: i + 1 }));
    const filtered = filterAndSort(rows, [r => r.name, r => r.team], " UTARA ", r => r.count, "desc");
    expect(filtered).toHaveLength(32);
    expect(filtered.slice(0, 20)[0].count).toBe(64);
    expect(filtered.slice(20)).toHaveLength(12);
    expect(rows[0].count).toBe(1);
    expect(filterAndSort(rows, [r => r.name], "missing")).toEqual([]);
  });
  it("sorts text containing numbers naturally and supports either direction", () => {
    const rows = [{ value: "RT 10" }, { value: "RT 2" }, { value: "rt 1" }];
    expect(filterAndSort(rows, [r => r.value], "", r => r.value).map(r => r.value)).toEqual(["rt 1", "RT 2", "RT 10"]);
    expect(filterAndSort(rows, [r => r.value], "", r => r.value, "desc").map(r => r.value)).toEqual(["RT 10", "RT 2", "rt 1"]);
  });
});
