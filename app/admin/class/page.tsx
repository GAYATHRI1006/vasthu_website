"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import type { VastuClass } from "@/types";

export default function ClassSchedulePage() {
  const router = useRouter();
  const [cls, setCls] = useState<VastuClass | null>(null);
  const [form, setForm] = useState<Partial<VastuClass>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    router.prefetch("/admin");
    router.prefetch("/admin/customers");
    router.prefetch("/admin/payment-logs");

    fetch("/api/admin/class")
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/admin/login?denied=1");
            return null;
          }

          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Unable to load class details.");
        }

        return response.json() as Promise<{ data: VastuClass }>;
      })
      .then((body) => {
        if (!body) return;
        setCls(body.data);
        setForm(body.data);
      })
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : "Unable to load class details."
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleChange(
    key: keyof VastuClass,
    value: string | number | boolean
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!cls) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/class", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cls.id, ...form })
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to save");
      }

      const body = (await res.json()) as { data: VastuClass };
      setCls(body.data);
      setForm(body.data);
      toast.success(
        "Class details updated. The public website now reflects the new information."
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-slate-400">Loading class details...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-[#0B4D3A]">Class Schedule</h2>
        <p className="mt-1 text-sm text-slate-500">
          Changes saved here are reflected instantly on the public website.
        </p>
      </div>

      {cls && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total Seats"
            value={String((form.total_seats as number) ?? cls.total_seats)}
          />
          <SummaryCard
            label="Available Seats"
            value={String(getAvailableSeats(cls, form))}
          />
          <SummaryCard
            label="Confirmed Bookings"
            value={String(getSoldSeats(cls))}
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Basic Information">
          <Field label="Title" htmlFor="cls-title">
            <input
              id="cls-title"
              type="text"
              value={(form.title as string) ?? ""}
              onChange={(e) => handleChange("title", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Subtitle" htmlFor="cls-subtitle">
            <input
              id="cls-subtitle"
              type="text"
              value={(form.subtitle as string) ?? ""}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Description" htmlFor="cls-description">
            <textarea
              id="cls-description"
              rows={3}
              value={(form.description as string) ?? ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </Field>
        </Section>

        <Section title="Date & Time">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Event Date" htmlFor="cls-date">
              <input
                id="cls-date"
                type="date"
                value={formatDateInputValue(form.event_date as string | undefined)}
                onChange={(e) =>
                  handleChange("event_date", toIsoDateString(e.target.value))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Event Time" htmlFor="cls-time">
              <input
                id="cls-time"
                type="text"
                placeholder="e.g. 10:00 AM - 1:00 PM"
                value={(form.event_time as string) ?? ""}
                onChange={(e) => handleChange("event_time", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        <Section title="Venue">
          <Field label="Venue Name" htmlFor="cls-venue">
            <input
              id="cls-venue"
              type="text"
              value={(form.venue as string) ?? ""}
              onChange={(e) => handleChange("venue", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Full Address" htmlFor="cls-address">
            <input
              id="cls-address"
              type="text"
              value={(form.address as string) ?? ""}
              onChange={(e) => handleChange("address", e.target.value)}
              className={inputClass}
            />
          </Field>
        </Section>

        <Section title="Pricing & Seats">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Fee (INR)" htmlFor="cls-fee">
              <input
                id="cls-fee"
                type="number"
                min={0}
                value={(form.fee as number) ?? 0}
                onChange={(e) => handleChange("fee", Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Total Seats" htmlFor="cls-seats">
              <input
                id="cls-seats"
                type="number"
                min={1}
                value={(form.total_seats as number) ?? 0}
                onChange={(e) =>
                  handleChange("total_seats", Number(e.target.value))
                }
                className={inputClass}
              />
            </Field>
          </div>
          {cls && (
            <p className="text-xs text-slate-500">
              Confirmed bookings are preserved automatically when seat capacity
              changes.
            </p>
          )}
        </Section>

        <Section title="Registration">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Registration Open
              </p>
              <p className="text-xs text-slate-500">
                Toggle to open or close registrations on the public website.
              </p>
            </div>
            <button
              id="registration-toggle"
              type="button"
              onClick={() =>
                handleChange("registration_open", !form.registration_open)
              }
              className="transition"
            >
              {form.registration_open ? (
                <ToggleRight className="h-9 w-9 text-[#0B4D3A]" />
              ) : (
                <ToggleLeft className="h-9 w-9 text-slate-400" />
              )}
            </button>
          </div>
        </Section>
      </div>

      <div className="mt-6">
        <button
          id="save-class-btn"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#0B4D3A] px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-[#0a4434] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0B4D3A]/40 focus:ring-1 focus:ring-[#0B4D3A]/20";

function formatDateInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

function toIsoDateString(value: string) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toISOString();
}

function getSoldSeats(cls: VastuClass) {
  return Math.max(cls.total_seats - cls.available_seats, 0);
}

function getAvailableSeats(cls: VastuClass, form: Partial<VastuClass>) {
  const nextTotalSeats =
    typeof form.total_seats === "number" && Number.isFinite(form.total_seats)
      ? form.total_seats
      : cls.total_seats;

  return Math.max(nextTotalSeats - getSoldSeats(cls), 0);
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
      <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-[#0B4D3A]">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium text-slate-500"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl text-[#0B4D3A]">{value}</p>
    </div>
  );
}
