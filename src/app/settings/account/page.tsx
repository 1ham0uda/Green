"use client";

import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/config";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";

function AccountContent() {
  const { user, signOut } = useAuth();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwStatus, setPwStatus] = useState<
    "idle" | "saving" | "done" | "error"
  >("idle");
  const [pwError, setPwError] = useState<string | null>(null);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseAuth.currentUser || !user) return;
    setPwStatus("saving");
    setPwError(null);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(firebaseAuth.currentUser, cred);
      await updatePassword(firebaseAuth.currentUser, newPw);
      setPwStatus("done");
      setCurrentPw("");
      setNewPw("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to update password");
      setPwStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-ink">Change password</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Update your password. You&apos;ll stay signed in on this device.
          </p>
        </div>

        <form onSubmit={handlePasswordChange} className="max-w-sm space-y-4">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={6}
              className="input"
            />
          </div>
          {pwError && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {pwError}
            </p>
          )}
          {pwStatus === "done" && (
            <p className="rounded-xl bg-brand-50 p-3 text-sm text-brand-700">
              Password updated successfully.
            </p>
          )}
          <Button type="submit" isLoading={pwStatus === "saving"}>
            Update password
          </Button>
        </form>
      </div>

      <div className="card border-red-200/50 p-6 sm:p-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-red-700">Danger zone</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Sign out of this device. You&apos;ll need to sign in again.
          </p>
        </div>
        <Button variant="danger" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <AuthGate>
      <AccountContent />
    </AuthGate>
  );
}
