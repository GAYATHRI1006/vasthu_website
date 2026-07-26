"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";
import type { AdminPaymentLog } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function PaymentLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AdminPaymentLog[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    router.prefetch("/admin");
    router.prefetch("/admin/customers");
    router.prefetch("/admin/class");

    fetch("/api/admin/payment-logs")
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/admin/login?denied=1");
            return null;
          }

          throw new Error("Unable to load payment logs.");
        }

        return response.json() as Promise<{ data: AdminPaymentLog[] }>;
      })
      .then((body) => {
        if (body) {
          setLogs(body.data ?? []);
        }
      })
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : "Unable to load payment logs."
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = logs.filter((log) => {
    if (!query) return true;
    const normalized = query.toLowerCase();

    return (
      log.customerName.toLowerCase().includes(normalized) ||
      log.phone.includes(query) ||
      log.orderId.toLowerCase().includes(normalized) ||
      (log.paymentId ?? "").toLowerCase().includes(normalized)
    );
  });

  return (
    <div className="flex h-full min-h-0 flex-col p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl text-[#0B4D3A]">Payment Logs</h2>
          <p className="mt-1 text-sm text-slate-500">
            {logs.length} total payment attempts
          </p>
        </div>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          id="log-search"
          placeholder="Search by name, phone, or order ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-[#0B4D3A]/40 focus:ring-1 focus:ring-[#0B4D3A]/20"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="h-full overflow-y-auto">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="sticky top-0 border-b border-slate-100 bg-slate-50 text-left">
                {[
                  "Customer",
                  "Phone",
                  "Order ID",
                  "Payment ID",
                  "Amount",
                  "Status",
                  "Time"
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    Loading logs...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    No payment logs found.
                  </td>
                </tr>
              )}
              {filtered.map((log) => (
                <tr key={log.id} className="transition hover:bg-slate-50">
                  <td className="truncate px-5 py-4 font-medium text-slate-800">
                    {log.customerName}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{log.phone}</td>
                  <td className="truncate px-5 py-4 font-mono text-xs text-slate-500">
                    {log.orderId}
                  </td>
                  <td className="truncate px-5 py-4 font-mono text-xs text-slate-500">
                    {log.paymentId ?? "--"}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-700">
                    {formatCurrency(log.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString("en-IN")
                      : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    captured: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    created: "bg-sky-50 text-sky-700 border-sky-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
        styles[status] ?? "bg-slate-100 text-slate-500 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}
