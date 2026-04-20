import { AuthGate } from "@/features/auth/components/auth-gate";
import { CartSummary } from "@/features/marketplace/components/cart-summary";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <main className="container max-w-2xl pb-24 md:pb-0">
      <AuthGate>
        <div className="py-5">
          <p className="eyebrow">Shop</p>
          <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
            Your Cart
          </h1>
        </div>
        <CartSummary />
      </AuthGate>
    </main>
  );
}
