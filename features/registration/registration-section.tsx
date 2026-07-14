"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoaderCircle, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRazorpay } from "@/hooks/use-razorpay";
import { createOrder, createRegistration, verifyPayment } from "@/services/api";
import { registrationSchema } from "@/lib/validations";
import { formatCurrency, formatEventDate } from "@/lib/utils";
import type { RegistrationPayload, VastuClass } from "@/types";

type RegistrationFormValues = RegistrationPayload;

export function RegistrationSection({ eventClass }: { eventClass: VastuClass }) {
  useRazorpay();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<{
    customerId: string;
    bookingId: string;
    values: RegistrationFormValues;
  } | null>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      classId: eventClass.id,
      fullName: "",
      phone: "",
      email: "",
      place: "",
      interestedClass: eventClass.title,
      occupation: ""
    }
  });

  const values = form.watch();

  function handleReview(values: RegistrationFormValues) {
    startTransition(async () => {
      try {
        const registration = await createRegistration(values);
        setDraft({
          customerId: registration.customerId,
          bookingId: registration.bookingId,
          values
        });
        toast.success("Details saved. Review and continue to payment.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Registration failed.");
      }
    });
  }

  function openCheckout() {
    if (!draft) {
      toast.error("Please review your details first.");
      return;
    }

    startTransition(async () => {
      try {
        const order = await createOrder({
          customerId: draft.customerId,
          classId: eventClass.id
        });

        if (!window.Razorpay || order.orderId.startsWith("order_mock_")) {
          const verified = await verifyPayment({
            customerId: draft.customerId,
            classId: eventClass.id,
            bookingId: draft.bookingId,
            razorpay_order_id: order.orderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: "mock_signature"
          });

          router.push(`/success?bookingId=${verified.bookingId}`);
          return;
        }

        const payment = new window.Razorpay({
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: "HariOm Vastu Solutions",
          description: eventClass.title,
          order_id: order.orderId,
          prefill: {
            name: draft.values.fullName,
            email: draft.values.email,
            contact: draft.values.phone
          },
          notes: {
            bookingId: draft.bookingId
          },
          theme: {
            color: "#0B4D3A"
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verified = await verifyPayment({
                customerId: draft.customerId,
                classId: eventClass.id,
                bookingId: draft.bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              router.push(`/success?bookingId=${verified.bookingId}`);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Verification failed.");
              router.push("/failed");
            }
          },
          modal: {
            ondismiss: () => router.push("/failed")
          }
        });

        payment.open();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to start payment.");
      }
    });
  }

  return (
    <section id="register" className="py-20">
      <div className="container grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-primary/10 bg-gradient-to-br from-primary to-[#114f3d] text-white">
          <CardContent className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-secondary/90">Upcoming Batch</p>
            <h2 className="font-serif text-4xl md:text-5xl">{eventClass.title}</h2>
            <p className="max-w-xl text-sm leading-7 text-emerald-50/90">{eventClass.subtitle}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <EventItem label="Date" value={formatEventDate(eventClass.event_date)} />
              <EventItem label="Time" value={eventClass.event_time} />
              <EventItem label="Venue" value={eventClass.venue} />
              <EventItem label="Fee" value={formatCurrency(eventClass.fee)} />
            </div>
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-secondary" />
                <p className="text-sm">Secure Razorpay checkout with UPI, cards, net banking, and wallet support.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardContent className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-secondary">Registration</p>
              <h2 className="section-title mt-3 text-4xl">Reserve your seat with a clean two-step flow.</h2>
            </div>

            <form onSubmit={form.handleSubmit(handleReview)} className="grid gap-5 md:grid-cols-2">
              <Field label="Full Name" error={form.formState.errors.fullName?.message}>
                <Input {...form.register("fullName")} placeholder="Your full name" />
              </Field>
              <Field label="Phone Number" error={form.formState.errors.phone?.message}>
                <Input {...form.register("phone")} placeholder="10-digit mobile number" />
              </Field>
              <Field label="Email (Optional)" error={form.formState.errors.email?.message}>
                <Input {...form.register("email")} placeholder="name@example.com" />
              </Field>
              <Field label="Place" error={form.formState.errors.place?.message}>
                <Input {...form.register("place")} placeholder="City / Area" />
              </Field>
              <Field label="Interested Class" error={form.formState.errors.interestedClass?.message}>
                <Input {...form.register("interestedClass")} />
              </Field>
              <Field label="Occupation (Optional)" error={form.formState.errors.occupation?.message}>
                <Input {...form.register("occupation")} placeholder="Profession" />
              </Field>

              <input type="hidden" {...form.register("classId")} />

              <div className="md:col-span-2">
                <Button size="lg" type="submit" disabled={isPending}>
                  {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Review Details
                </Button>
              </div>
            </form>

            <div className="rounded-[28px] border border-primary/10 bg-accent/65 p-6">
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-2xl text-primary">Review Details</h3>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ReviewItem label="Name" value={values.fullName || "Not provided yet"} />
                <ReviewItem label="Phone" value={values.phone || "Not provided yet"} />
                <ReviewItem label="Email" value={values.email || "Optional"} />
                <ReviewItem label="Place" value={values.place || "Not provided yet"} />
                <ReviewItem label="Program" value={values.interestedClass || eventClass.title} />
                <ReviewItem label="Amount" value={formatCurrency(eventClass.fee)} />
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={openCheckout}
                  disabled={!draft || isPending}
                >
                  {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Pay Securely
                </Button>
                <p className="text-sm leading-7 text-slate-600">
                  Booking is confirmed only after successful payment verification.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function EventItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.24em] text-emerald-50/75">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}
