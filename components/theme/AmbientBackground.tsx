export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="ambient-blob animate-mesh-drift-a h-[65vmax] w-[65vmax] -left-[18vmax] -top-[18vmax]"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgb(var(--glow) / 0.45), transparent 70%)",
        }}
      />
      <div
        className="ambient-blob animate-mesh-drift-b h-[55vmax] w-[55vmax] right-[-15vmax] top-[22vmax]"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgb(var(--accent-soft) / 0.42), transparent 70%)",
        }}
      />
      <div
        className="ambient-blob animate-mesh-drift-c h-[48vmax] w-[48vmax] left-[22vmax] bottom-[-18vmax]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgb(var(--accent) / 0.32), transparent 70%)",
        }}
      />
      <div
        className="ambient-blob animate-mesh-drift-d h-[40vmax] w-[40vmax] left-[55vmax] top-[10vmax]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgb(var(--glow-soft) / 0.28), transparent 70%)",
        }}
      />

      {/* structural grid overlay — very faint */}
      <div className="ambient-grid absolute inset-0 opacity-70" />

      {/* subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
