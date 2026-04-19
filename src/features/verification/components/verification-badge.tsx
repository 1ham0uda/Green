interface VerificationBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export function VerificationBadge({ size = "sm", className = "" }: VerificationBadgeProps) {
  const dim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      title="Verified"
      aria-label="Verified account"
      className={`inline-flex items-center justify-center rounded-full bg-brand-600 text-white ${dim} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-2.5 w-2.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}
