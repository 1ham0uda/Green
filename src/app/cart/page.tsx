import { AuthGate } from "@/features/auth/components/auth-gate";
import { CartSummary } from "@/features/marketplace/components/cart-summary";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <main className="container max-w-3xl py-8">
      <AuthGate>
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Your cart</h1>
        <CartSummary />
      </AuthGate>
    </main>
  );
}
