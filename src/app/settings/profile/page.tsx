import { AuthGate } from "@/features/auth/components/auth-gate";
import { EditProfileForm } from "@/features/profiles/components/edit-profile-form";

export const metadata = { title: "Edit profile" };

export default function EditProfilePage() {
  return (
    <AuthGate>
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-ink">Profile</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Your public information shown across Green.
          </p>
        </div>
        <EditProfileForm />
      </div>
    </AuthGate>
  );
}
