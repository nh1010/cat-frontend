"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

type Summary = {
  total: number;
  by_source: Record<string, number>;
  per_day: { date: string; count: number }[];
  start: string;
  end: string;
};

function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ReportsPage() {
  const [start, setStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return formatDateInput(d);
  });
  const [end, setEnd] = useState<string>(() => formatDateInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const qs = useMemo(() => new URLSearchParams({ start, end }).toString(), [start, end]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/reports/summary?${qs}`);
        if (!res.ok) throw new Error(`Failed to fetch summary: ${res.status}`);
        const data = (await res.json()) as Summary;
        if (active) setSummary(data);
      } catch (e: any) {
        if (active) setError(e?.message || "Failed to load summary");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [qs]);

  const handleExport = async () => {
    const res = await fetch(`${API_BASE_URL}/api/reports/export?${qs}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cat_sightings_${start}_to_${end}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="bg-cream-100 min-h-screen">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-lilac-900">Reports</h1>
            <p className="text-sm text-lilac-700">Download CSV and view sighting counts.</p>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-lilac-700 mb-1">Start</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-md border border-lilac-300 px-2 py-1 bg-white text-lilac-900" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-lilac-700 mb-1">End</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-md border border-lilac-300 px-2 py-1 bg-white text-lilac-900" />
            </div>
            <button onClick={handleExport} className="rounded-md bg-lilac-800 text-cream-50 px-3 py-2 text-sm font-medium hover:bg-lilac-700">Export CSV</button>
          </div>
        </div>

        <div className="rounded-card border border-lilac-200 bg-white shadow-soft p-4">
          {loading && <div className="text-sm text-lilac-700">Loading…</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {!loading && !error && summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-lilac-200 p-4 bg-cream-50">
                  <div className="text-xs text-lilac-700">Total sightings</div>
                  <div className="text-2xl font-semibold text-lilac-900">{summary.total}</div>
                </div>
                <div className="rounded-lg border border-lilac-200 p-4 bg-cream-50">
                  <div className="text-xs text-lilac-700">By source</div>
                  <div className="text-sm text-lilac-900 space-y-1">
                    {Object.entries(summary.by_source).map(([k, v]) => (
                      <div key={k} className="flex justify-between"><span>{k}</span><span className="font-medium">{v}</span></div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-lilac-200 p-4 bg-cream-50">
                  <div className="text-xs text-lilac-700">Range</div>
                  <div className="text-sm text-lilac-900">
                    {new Date(summary.start).toLocaleDateString()} – {new Date(summary.end).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-lilac-900 mb-2">Per day</div>
                <div className="rounded-lg border border-lilac-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-cream-50 text-lilac-700">
                      <tr>
                        <th className="text-left px-3 py-2">Date</th>
                        <th className="text-right px-3 py-2">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.per_day.map((r) => (
                        <tr key={r.date} className="border-t border-lilac-100">
                          <td className="px-3 py-2">{new Date(r.date).toLocaleDateString()}</td>
                          <td className="px-3 py-2 text-right font-medium">{r.count}</td>
                        </tr>
                      ))}
                      {summary.per_day.length === 0 && (
                        <tr>
                          <td colSpan={2} className="px-3 py-6 text-center text-lilac-700">No data in this range.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}


