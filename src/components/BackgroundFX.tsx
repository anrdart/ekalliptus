export const BackgroundFX = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0f172a_10%,#050510_70%,#03030a_100%)]" />
    <div className="background-overlay absolute inset-0 opacity-70" />

    <div className="blur-blob absolute -top-[18%] -left-[10%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,#6366f1_0%,rgba(79,70,229,0)_70%)]" />
    <div className="blur-blob absolute -bottom-[25%] left-[50%] h-[45rem] w-[45rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,#06b6d4_0%,rgba(6,182,212,0)_68%)]" />
    <div className="blur-blob absolute -top-[15%] right-[-20%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,#8b5cf6_0%,rgba(139,92,246,0)_65%)]" />

    <div className="floating pulse-glow absolute left-[12%] top-[30%] h-56 w-56 rounded-full bg-white/5 opacity-40 blur-[60px]" />
    <div className="floating pulse-glow absolute bottom-[12%] right-[18%] h-48 w-48 rounded-full bg-white/5 opacity-50 blur-[70px]" />
  </div>
);
