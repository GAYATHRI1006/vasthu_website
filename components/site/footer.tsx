import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-primary/10 py-10">
      <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-serif text-2xl text-primary">{siteConfig.name}</p>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Guided Vastu learning experiences designed with clarity, calm, and intention.
          </p>
        </div>
        <div className="text-sm text-slate-600">
          <p>{siteConfig.contact.phone}</p>
          <p>{siteConfig.contact.email}</p>
        </div>
      </div>
    </footer>
  );
}
