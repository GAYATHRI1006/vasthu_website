"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, IndianRupee, MapPin, Timer, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatEventDate } from "@/lib/utils";
import type { VastuClass } from "@/types";

export function HeroSection({ eventClass }: { eventClass: VastuClass }) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="container grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <div className="inline-flex rounded-full border border-primary/10 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.32em] text-primary">
            Vastu Awareness Program
          </div>
          <div className="space-y-5">
            <h1 className="font-serif text-5xl leading-tight text-primary md:text-7xl">
              Transform Your Home.
              <br />
              Transform Your Life.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-600 md:text-lg">
              A premium in-person session on practical Vastu principles for modern homes,
              apartments, and workspaces.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoBadge icon={CalendarDays} label="Date" value={formatEventDate(eventClass.event_date)} />
            <InfoBadge icon={Timer} label="Time" value={eventClass.event_time} />
            <InfoBadge icon={MapPin} label="Venue" value={eventClass.venue} />
            <InfoBadge icon={IndianRupee} label="Fee" value={formatCurrency(eventClass.fee)} />
            <InfoBadge icon={Users} label="Seats Left" value={`${eventClass.available_seats} seats`} />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#register">
                Reserve Your Seat
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#about">Learn More</a>
            </Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-secondary/25 via-transparent to-primary/15 blur-3xl" />
          <Card className="relative overflow-hidden border-primary/10 bg-[#fffaf0]">
            <CardContent className="grid-lines relative min-h-[560px] overflow-hidden p-0">
              <div className="absolute left-8 top-8 h-24 w-24 rounded-full border border-secondary/40 bg-secondary/10" />
              <div className="absolute right-8 top-14 h-20 w-20 rotate-45 rounded-3xl border border-primary/15 bg-primary/10" />
              <div className="absolute bottom-14 left-10 h-32 w-32 rounded-full border border-primary/15 bg-primary/5" />
              <div className="absolute bottom-10 right-10 h-24 w-24 rounded-[30px] border border-secondary/40 bg-secondary/10" />
              <div className="absolute inset-x-10 bottom-0 top-24 rounded-[34px] bg-gradient-to-b from-white to-[#ecf3ee] p-10 shadow-soft">
                <div className="mx-auto mt-6 max-w-sm">
                  <div className="h-8 w-36 rounded-full bg-primary/10" />
                  <div className="mx-auto mt-8 h-[330px] w-full rounded-[40px] border border-primary/10 bg-gradient-to-b from-[#f6f8ef] via-white to-[#e6f0eb] p-6 shadow-panel">
                    <div className="mx-auto h-24 w-24 rounded-full border-8 border-[#ecf3ee] bg-gradient-to-br from-secondary/60 to-secondary/20" />
                    <div className="mx-auto mt-8 h-32 w-40 rounded-t-[80px] bg-gradient-to-b from-primary to-[#0f6b50]" />
                    <div className="mx-auto h-24 w-56 rounded-3xl bg-white shadow-panel" />
                    <div className="mt-8 flex items-center justify-center gap-4">
                      <div className="h-12 w-12 rotate-45 rounded-2xl border border-secondary/60 bg-secondary/15" />
                      <div className="h-12 w-12 rounded-full border border-primary/20 bg-primary/10" />
                      <div className="h-12 w-12 rounded-[18px] border border-primary/20 bg-primary/10" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function InfoBadge({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-panel rounded-3xl p-4">
      <Icon className="h-5 w-5 text-secondary" />
      <p className="mt-3 text-xs uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
