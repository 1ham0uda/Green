interface VerificationBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerificationBadge({
  size = "sm",
  className = "",
}: VerificationBadgeProps) {
  const outer =
    size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6";
  const inner =
    size === "sm" ? "h-2.5 w-2.5" : size === "md" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span
      title="Verified"
      aria-label="Verified account"
      className={`inline-flex items-center justify-center rounded-full bg-gradient-brand text-white shadow-soft ring-1 ring-inset ring-white/20 ${outer} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={inner}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}
