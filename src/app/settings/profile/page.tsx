import { AuthGate } from "@/features/auth/components/auth-gate";
import { EditProfileForm } from "@/features/profiles/components/edit-profile-form";

export const metadata = { title: "Edit profile" };

export default function EditProfilePage() {
  return (
    <main className="container max-w-2xl py-8">
      <AuthGate>
        <div className="card p-6">
          <h1 className="mb-6 text-xl font-semibold text-zinc-900">
            Edit your profile
          </h1>
          <EditProfileForm />
        </div>
      </AuthGate>
    </main>
  );
}
