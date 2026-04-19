import { AuthGate } from "@/features/auth/components/auth-gate";
import { RequestVerificationForm } from "@/features/verification/components/request-verification-form";

export const metadata = { title: "Verification" };

export default function VerificationSettingsPage() {
  return (
    <AuthGate>
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-ink">Account verification</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Verified accounts receive a badge on their profile and posts.
          </p>
        </div>
        <RequestVerificationForm />
      </div>
    </AuthGate>
  );
}
