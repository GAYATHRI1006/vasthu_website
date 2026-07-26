import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  sub?: string;
  color?: "green" | "gold" | "blue" | "red";
};

const colorMap = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  gold: "bg-amber-50 text-amber-700 border-amber-100",
  blue: "bg-sky-50 text-sky-700 border-sky-100",
  red: "bg-rose-50 text-rose-700 border-rose-100"
};

export function StatCard({ label, value, icon: Icon, sub, color = "green" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white px-6 py-5 shadow-panel">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className="mt-2 text-[2.15rem] font-semibold tracking-tight text-primary tabular-nums">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
