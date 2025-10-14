export const BackgroundFX = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0" style={{ background: "var(--fx-gradient-base)" }} />
    <div className="absolute inset-0 opacity-70" style={{ background: "var(--fx-gradient-overlay)" }} />

    <div className="blur-blob absolute -top-[18%] -left-[10%] h-[38rem] w-[38rem] rounded-full" style={{ background: "var(--fx-blob-1)" }} />
    <div className="blur-blob absolute -bottom-[25%] left-[50%] h-[45rem] w-[45rem] -translate-x-1/2 rounded-full" style={{ background: "var(--fx-blob-2)" }} />
    <div className="blur-blob absolute -top-[15%] right-[-20%] h-[40rem] w-[40rem] rounded-full" style={{ background: "var(--fx-blob-3)" }} />

    <div className="floating pulse-glow absolute left-[12%] top-[30%] h-56 w-56 rounded-full blur-[60px]" style={{ background: "var(--fx-glow-1)" }} />
    <div className="floating pulse-glow absolute bottom-[12%] right-[18%] h-48 w-48 rounded-full blur-[70px]" style={{ background: "var(--fx-glow-2)" }} />
  </div>
);
