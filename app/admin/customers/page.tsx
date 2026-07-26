"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { AdminCustomer } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(
    null
  );

  useEffect(() => {
    router.prefetch("/admin");
    router.prefetch("/admin/class");
    router.prefetch("/admin/payment-logs");

    fetch("/api/admin/customers")
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/admin/login?denied=1";
            return null;
          }

          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Unable to load customers.");
        }

        return response.json() as Promise<{ data: AdminCustomer[] }>;
      })
      .then((body) => {
        if (body) {
          setCustomers(body.data ?? []);
        }
      })
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : "Unable to load customers."
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.phone.includes(query) ||
        (customer.email ?? "").toLowerCase().includes(query.toLowerCase());

      const matchesFilter = filter === "all" || customer.paymentStatus === filter;
      return matchesSearch && matchesFilter;
    });
  }, [customers, filter, query]);

  async function handleExport() {
    try {
      const res = await fetch("/api/admin/customers/export");
      if (!res.ok) throw new Error("Unable to download customer report.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `hariom-customers-${Date.now()}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Customer workbook downloaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed.");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl text-[#0B4D3A]">Customers</h2>
          <p className="mt-1 text-sm text-slate-500">
            {customers.length} total ·{" "}
            {customers.filter((customer) => customer.paymentStatus === "paid").length}{" "}
            paid
          </p>
        </div>
        <button
          id="export-customers-btn"
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl bg-[#0B4D3A] px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-[#0a4434]"
        >
          <Download className="h-4 w-4" />
          Download Excel
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="customer-search"
            placeholder="Search by name, phone, or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-[#0B4D3A]/40 focus:ring-1 focus:ring-[#0B4D3A]/20"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "paid", "pending"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition ${
                filter === value
                  ? "border-[#0B4D3A] bg-[#0B4D3A] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="h-full overflow-y-auto">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="sticky top-0 border-b border-slate-100 bg-slate-50 text-left">
                {[
                  "Name",
                  "Phone",
                  "Place",
                  "Amount",
                  "Payment",
                  "Booking",
                  "Registered On",
                  "Action"
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
                  <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                    Loading customers...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                    No customers found.
                  </td>
                </tr>
              )}
              {filtered.map((customer) => (
                <tr key={customer.id} className="transition hover:bg-slate-50">
                  <td className="truncate px-5 py-4 font-medium text-slate-800">
                    {customer.name}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{customer.phone}</td>
                  <td className="truncate px-5 py-4 text-slate-600">
                    {customer.place}
                  </td>
                  <td className="px-5 py-4 font-medium text-[#0B4D3A]">
                    {formatCurrency(customer.amountPaid)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={customer.paymentStatus} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={customer.bookingStatus} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                    {customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString("en-IN")
                      : "--"}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(customer)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#0B4D3A]/30 hover:text-[#0B4D3A]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={Boolean(selectedCustomer)}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
      >
        <DialogContent className="max-w-2xl p-0">
          {selectedCustomer && (
            <div className="p-6">
              <div className="mb-6 flex items-start justify-between gap-6 pr-14">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0B4D3A]">
                    Customer profile
                  </p>
                  <h3 className="mt-2 font-serif text-2xl text-slate-900">
                    {selectedCustomer.name}
                  </h3>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={selectedCustomer.paymentStatus} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Detail label="Phone" value={selectedCustomer.phone} />
                <Detail label="Email" value={selectedCustomer.email ?? "--"} />
                <Detail label="Place" value={selectedCustomer.place} />
                <Detail
                  label="Occupation"
                  value={selectedCustomer.occupation ?? "--"}
                />
                <Detail label="Booking ID" value={selectedCustomer.bookingId} />
                <Detail
                  label="Interested Class"
                  value={selectedCustomer.interestedClass ?? "--"}
                />
                <Detail label="Program" value={selectedCustomer.program} />
                <Detail label="Venue" value={selectedCustomer.venue} />
                <Detail
                  label="Event Date"
                  value={
                    selectedCustomer.eventDate
                      ? new Date(selectedCustomer.eventDate).toLocaleDateString(
                          "en-IN"
                        )
                      : "--"
                  }
                />
                <Detail
                  label="Amount Paid"
                  value={formatCurrency(selectedCustomer.amountPaid)}
                />
                <Detail
                  label="Payment ID"
                  value={selectedCustomer.paymentId ?? "--"}
                />
                <Detail
                  label="Booking Status"
                  value={selectedCustomer.bookingStatus}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200",
    cancelled: "bg-slate-100 text-slate-500 border-slate-200"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
        styles[status] ?? styles.pending
      }`}
    >
      {status}
    </span>
  );
}
