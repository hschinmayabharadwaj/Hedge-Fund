export function Card({ children, className = "", insight = false, hover = true }) {
  return (
    <div
      className={[
        "bg-surface-container border border-outline-variant rounded-lg",
        hover && "hover:bg-surface-container-highest transition-colors duration-150",
        insight && "relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-px before:bg-gradient-to-r before:from-secondary-container before:to-transparent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export function StatusDot({ status, glow = false }) {
  const map = {
    ok: "bg-secondary",
    error: "bg-error",
    warn: "bg-tertiary",
  };
  const glowClass = glow && status === "ok" ? "shadow-[0_0_8px_rgba(78,222,163,0.4)]" : "";
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${map[status]} ${glowClass}`} />;
}

export function TimeframeToggle({ options, value, onChange }) {
  return (
    <div className="flex bg-surface rounded border border-outline-variant p-0.5">
      {options.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={`px-2 py-0.5 text-label-uppercase text-[10px] rounded-sm transition-colors ${
            value === tf
              ? "bg-surface-container-highest text-on-surface"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
