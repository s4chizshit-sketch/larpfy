import { useEffect } from "react";
import confetti from "canvas-confetti";
import { PartyPopper } from "lucide-react";

function playChime() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
    setTimeout(() => void ctx.close(), 1600);
  } catch {
    // Audio is a bonus; never block the celebration.
  }
}

function burstConfetti() {
  const colors = ["#3B82F6", "#22C55E", "#F59E0B", "#EC4899", "#A855F7"];
  confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors });
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
  }, 250);
  setTimeout(() => confetti({ particleCount: 50, spread: 100, origin: { y: 0.4 }, scalar: 0.9, colors }), 700);
}

export function SignupCelebration({ name }: { name: string }) {
  useEffect(() => {
    burstConfetti();
    playChime();
  }, []);

  return (
    <div
      role="status"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="mx-4 w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <PartyPopper className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground">Congratulations{name ? `, ${name}` : ""}! 🎉</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your account has been created successfully.
          <br />
          Explore our plans before purchasing.
        </p>
      </div>
    </div>
  );
}
