"use client";

import { ReactNode, useEffect, useState } from "react";
import { filterAndSort, SortDirection } from "@/lib/table";

type Column<T> = { key: string; label: string; value?: (row: T) => string | number; render?: (row: T) => ReactNode; className?: string };
type Props<T> = { rows?: T[]; columns: Column<T>[]; endpoint?: string; revision?: number; searchPlaceholder?: string };

export function DataTable<T extends { id: string }>({ rows = [], columns, endpoint, revision = 0, searchPlaceholder = "Cari dalam tabel..." }: Props<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState("");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const [remote, setRemote] = useState<{ items: T[]; total: number; key: string }>({ items: [], total: 0, key: "" });
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const requestKey = JSON.stringify([endpoint, revision, search, page, limit, sort, direction, retry]);
  const loading = Boolean(endpoint && remote.key !== requestKey && !error);

  useEffect(() => { setPage(1); }, [endpoint]);

  useEffect(() => {
    if (!endpoint) return;
    const controller = new AbortController();
    setError("");
    const timer = setTimeout(async () => {
      try {
        const url = new URL(endpoint, window.location.origin);
        Object.entries({ search, page: String(page), limit: String(limit), sort, direction }).forEach(([key, value]) => url.searchParams.set(key, value));
        const response = await fetch(url, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Data gagal dimuat.");
        if (controller.signal.aborted) return;
        const lastPage = Math.max(1, Math.ceil(result.data.pagination.total / limit));
        if (page > lastPage) { setPage(lastPage); return; }
        setRemote({ items: result.data.items, total: result.data.pagination.total, key: requestKey });
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Data gagal dimuat.");
      }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [endpoint, revision, search, page, limit, sort, direction, retry, requestKey]);

  const filtered = endpoint ? [] : filterAndSort(rows, columns.flatMap(column => column.value ? [column.value] : []), search, columns.find(column => column.key === sort)?.value, direction);
  const total = endpoint ? remote.total : filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  useEffect(() => { if (!endpoint && page > totalPages) setPage(totalPages); }, [endpoint, page, totalPages]);
  const visible = endpoint ? remote.items : filtered.slice((currentPage - 1) * limit, currentPage * limit);
  const busy = loading || Boolean(error);

  return <div className="data-table">
    <div className="toolbar table-controls">
      <label>Cari<input type="search" value={search} placeholder={searchPlaceholder} onChange={event => { setSearch(event.target.value); setPage(1); setError(""); }} /></label>
      <label>Baris per halaman<select value={limit} onChange={event => { setLimit(Number(event.target.value)); setPage(1); setError(""); }}>{[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}</select></label>
    </div>
    {error && <div role="alert" className="alert">{error} <button type="button" className="secondary" onClick={() => { setError(""); setRetry(value => value + 1); }}>Coba lagi</button></div>}
    <div className="table-wrap" aria-busy={loading}><table><thead><tr>{columns.map(column => <th key={column.key} aria-sort={column.value ? sort === column.key ? direction === "asc" ? "ascending" : "descending" : "none" : undefined}>{column.value ? <button type="button" className="table-sort" onClick={() => { setSort(column.key); setDirection(sort === column.key && direction === "asc" ? "desc" : "asc"); setPage(1); setError(""); }}>{column.label}<span aria-hidden="true">{sort === column.key ? direction === "asc" ? " ↑" : " ↓" : " ↕"}</span></button> : column.label}</th>)}</tr></thead>
      <tbody>{busy ? <tr><td colSpan={columns.length} className="muted">{loading ? "Memuat data..." : "Data gagal dimuat."}</td></tr> : visible.length ? visible.map(row => <tr key={row.id}>{columns.map(column => <td key={column.key} className={column.className}>{column.render ? column.render(row) : column.value?.(row)}</td>)}</tr>) : <tr><td colSpan={columns.length} className="muted">{search ? "Tidak ada data yang cocok." : "Belum ada data."}</td></tr>}</tbody>
    </table></div>
    <nav className="table-pagination" aria-label="Navigasi halaman tabel">
      <span className="muted" aria-live="polite">{busy ? "—" : `${total ? (currentPage - 1) * limit + 1 : 0}–${Math.min(currentPage * limit, total)} dari ${total} data`}</span>
      <div className="actions">
        <button type="button" className="secondary" disabled={busy || currentPage <= 1} onClick={() => setPage(1)}>Pertama</button>
        <button type="button" className="secondary" disabled={busy || currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Sebelumnya</button>
        <span>Halaman {currentPage} / {totalPages}</span>
        <button type="button" className="secondary" disabled={busy || currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Berikutnya</button>
        <button type="button" className="secondary" disabled={busy || currentPage >= totalPages} onClick={() => setPage(totalPages)}>Terakhir</button>
      </div>
    </nav>
  </div>;
}
