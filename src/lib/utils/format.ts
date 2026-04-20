export const DEFAULT_CURRENCY = "EGP";

export function formatPrice(value: number, currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
