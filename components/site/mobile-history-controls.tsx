"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

export function MobileHistoryControls() {
  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 md:hidden">
      <div className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/95 px-3 py-2 shadow-soft backdrop-blur">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-primary/40 hover:text-primary"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => window.history.forward()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-primary/40 hover:text-primary"
          aria-label="Go forward"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
