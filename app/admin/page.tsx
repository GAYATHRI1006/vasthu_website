import { Users, IndianRupee, Clock, CheckCircle2 } from "lucide-react";
import { getAllCustomers } from "@/lib/data";
import { StatCard } from "@/features/admin/stat-card";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const customers = await getAllCustomers();

  const paid = customers.filter((customer) => customer.paymentStatus === "paid");
  const pending = customers.filter(
    (customer) => customer.paymentStatus === "pending"
  );
  const totalRevenue = paid.reduce((sum, customer) => sum + customer.amountPaid, 0);
  const recent = customers.slice(0, 8);

  return (
    <div className="flex h-full min-h-0 flex-col p-8">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-[#0B4D3A]">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Registrations"
          value={customers.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Paid Customers"
          value={paid.length}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Pending Payments"
          value={pending.length}
          icon={Clock}
          color="gold"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={IndianRupee}
          color="green"
        />
      </div>

      <div className="mt-10 flex min-h-0 flex-1 flex-col">
        <h3 className="mb-4 font-serif text-xl text-[#0B4D3A]">
          Recent Registrations
        </h3>
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
          <div className="h-full overflow-y-auto">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="sticky top-0 border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Name
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Phone
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Place
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                      No registrations yet.
                    </td>
                  </tr>
                )}
                {recent.map((customer) => (
                  <tr key={customer.id} className="transition hover:bg-slate-50">
                    <td className="truncate px-5 py-4 font-medium text-slate-800">
                      {customer.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{customer.phone}</td>
                    <td className="truncate px-5 py-4 text-slate-600">
                      {customer.place}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {formatCurrency(customer.amountPaid)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={customer.paymentStatus} />
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString("en-IN")
                        : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200"
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
