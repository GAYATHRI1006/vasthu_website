import Image from "next/image";
import { CheckCircle2, Home, Sparkles, Star, SunMedium } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Home,
    title: "Practical Home Guidance",
    copy: "Learn placement, flow, and spatial corrections that fit modern apartments and houses."
  },
  {
    icon: SunMedium,
    title: "Energy and Wellbeing",
    copy: "Understand how layout decisions influence focus, comfort, and everyday emotional clarity."
  },
  {
    icon: Sparkles,
    title: "Prosperity Alignment",
    copy: "Identify high-impact Vastu principles for work, finances, and family harmony."
  }
];

const takeaways = [
  "Room-by-room practical Vastu insights",
  "Common layout mistakes and remedies",
  "Live examples from residential cases",
  "Simple corrections without structural changes"
];

export function ContentSections() {
  return (
    <>
      <section id="about" className="py-20">
        <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.3em] text-secondary">About The Program</p>
            <h2 className="section-title">Designed like a premium learning experience, not a generic seminar.</h2>
          </div>
          <div className="space-y-6">
            <p className="section-copy">
              This session translates traditional Vastu wisdom into actionable guidance for contemporary living.
              You will leave with a clearer understanding of orientation, room intent, circulation, and practical
              corrections that respect both spiritual principles and daily convenience.
            </p>
            <Card className="border-primary/10">
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {takeaways.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="benefits" className="py-20">
        <div className="container">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary">Benefits</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="section-title max-w-2xl">A focused workshop built for clarity, confidence, and real implementation.</h2>
            <p className="max-w-lg text-sm leading-7 text-slate-600">
              The class is structured to help attendees move from theory to immediately usable spatial decisions.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, copy }) => (
              <Card key={title}>
                <CardContent>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-6 font-serif text-2xl text-primary">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{copy}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="trainer" className="py-20">
        <div className="container">
          <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-white via-[#fffaf0] to-[#f2f7f4]">
            <CardContent className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
              <div className="rounded-[28px] bg-gradient-to-br from-primary to-[#116248] p-5 text-white">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-white/10 bg-white/10">
                  <Image
                    src="/images/gallery/trainer.png"
                    alt="HariOm Vastu trainer"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 32vw"
                  />
                </div>
                <p className="mt-6 text-sm uppercase tracking-[0.28em] text-secondary/90">Lead Trainer</p>
                <h3 className="mt-3 font-serif text-4xl">HariOm Vastu Mentor</h3>
                <p className="mt-4 text-sm leading-7 text-emerald-50/90">
                  Experienced in translating classical Vastu frameworks into practical recommendations for families,
                  homeowners, and professionals.
                </p>
              </div>
              <div className="space-y-5">
                <p className="text-sm uppercase tracking-[0.3em] text-secondary">Trainer</p>
                <h2 className="section-title">A grounded teacher with a practical lens.</h2>
                <p className="section-copy">
                  The workshop is facilitated to be approachable and methodical. Expect clear explanations, live case
                  examples, and time for questions around layouts, directions, room planning, and corrective steps.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TrainerStat label="Live Case Insights" value="20+" />
                  <TrainerStat label="Workshop Format" value="Interactive" />
                  <TrainerStat label="Teaching Style" value="Practical" />
                  <TrainerStat label="Session Depth" value="Beginner Friendly" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white px-5 py-4 text-sm text-slate-700">
                  <Star className="h-5 w-5 text-secondary" />
                  Includes practical Q&A on home layout, directions, remedies, and common misconceptions.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

function TrainerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white px-5 py-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-medium text-primary">{value}</p>
    </div>
  );
}
