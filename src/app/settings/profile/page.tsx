import { AuthGate } from "@/features/auth/components/auth-gate";
import { EditProfileForm } from "@/features/profiles/components/edit-profile-form";

export const metadata = { title: "Edit profile" };

export default function EditProfilePage() {
  return (
    <AuthGate>
      <div className="rounded-2xl border border-surface-border bg-surface p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="font-serif text-[22px] font-normal tracking-[-0.02em] text-ink">Profile</h2>
          <p className="mt-1 font-sans text-[13px] text-ink-muted">
            Your public information shown across Green.
          </p>
        </div>
        <EditProfileForm />
      </div>
    </AuthGate>
  );
}
