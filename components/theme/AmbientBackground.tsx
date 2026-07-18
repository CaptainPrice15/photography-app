export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="ambient-blob ambient-1 h-[60vmax] w-[60vmax] -left-[15vmax] -top-[15vmax]"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgb(var(--accent) / 0.55), transparent 70%)",
        }}
      />
      <div
        className="ambient-blob ambient-2 h-[55vmax] w-[55vmax] right-[-12vmax] top-[20vmax]"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgb(var(--accent-soft) / 0.5), transparent 70%)",
        }}
      />
      <div
        className="ambient-blob ambient-3 h-[45vmax] w-[45vmax] left-[25vmax] bottom-[-15vmax]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgb(var(--accent) / 0.35), transparent 70%)",
        }}
      />
      {/* subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
