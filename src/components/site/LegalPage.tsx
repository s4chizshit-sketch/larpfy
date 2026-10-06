import type { ReactNode } from "react";
import { PublicLayout } from "./Sections";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground">
          {children}
        </div>
      </article>
    </PublicLayout>
  );
}
