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
    </div>
  );
}
