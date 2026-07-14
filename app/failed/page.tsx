import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function FailedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-xl border-primary/10">
        <CardContent className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-secondary">Payment Failed</p>
          <h1 className="font-serif text-5xl text-primary">Try Again</h1>
          <p className="text-sm leading-7 text-slate-600">
            The transaction was not completed. You can return home and submit the booking again.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/">Back Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
