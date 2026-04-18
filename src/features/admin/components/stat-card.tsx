interface StatCardProps {
  label: string;
  value: number | string;
  accent?: "brand" | "amber" | "red" | "zinc";
}

const ACCENT_STYLES = {
  brand: "bg-brand-50 text-brand-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  zinc: "bg-zinc-50 text-zinc-700",
};

export function StatCard({ label, value, accent = "zinc" }: StatCardProps) {
  return (
    <div className={`card flex flex-col gap-1 p-5 ${ACCENT_STYLES[accent]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium opacity-80">{label}</p>
    </div>
  );
}
