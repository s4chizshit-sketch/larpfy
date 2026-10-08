import type { ReactNode } from "react";
import { Logo } from "@/components/site/Logo";

export function AuthShell({
  title,
  sub,
  children,
  footer,
}: {
  title: string;
  sub?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="auth-shell">
      <div className="auth-bloom auth-bloom-a" aria-hidden />
      <div className="auth-bloom auth-bloom-b" aria-hidden />
      <div className="auth-stack">
        <Logo />
        <div className="auth-card mt-8">
          <h1 className="auth-title">{title}</h1>
          {sub && <p className="auth-sub">{sub}</p>}
          <div className="mt-8">{children}</div>
        </div>
        {footer && <div className="auth-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-2 text-xs text-destructive">{msg}</p> : null;
}
