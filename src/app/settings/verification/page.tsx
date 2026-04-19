import { AuthGate } from "@/features/auth/components/auth-gate";
import { RequestVerificationForm } from "@/features/verification/components/request-verification-form";

export const metadata = { title: "Verification" };

export default function VerificationSettingsPage() {
  return (
    <main className="container max-w-2xl py-8">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900">
        Account Verification
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Verified accounts get a badge on their profile and posts.
      </p>
      <div className="card p-6">
        <AuthGate>
          <RequestVerificationForm />
        </AuthGate>
      </div>
    </main>
  );
}
