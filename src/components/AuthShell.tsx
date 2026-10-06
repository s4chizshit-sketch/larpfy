import type { ReactNode } from "react";
import { Logo } from "@/components/site/Logo";

export function AuthShell({ title, sub, children, footer }: { title: string; sub?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="hero-bg flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-md rounded-3xl border border-border glass p-7 sm:p-9">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {sub && <p className="mt-2 text-sm text-muted-foreground">{sub}</p>}
        <div className="mt-7">{children}</div>
      </div>
      {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}

export function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1.5 text-xs text-destructive">{msg}</p> : null;
}
