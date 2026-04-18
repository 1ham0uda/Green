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

function AccountContent() {
  const { user, signOut } = useAuth();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
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
    <div className="space-y-8">
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Current password
            </label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              New password
            </label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={6}
              className="input"
            />
          </div>
          {pwError && <p className="text-sm text-red-600">{pwError}</p>}
          {pwStatus === "done" && (
            <p className="text-sm text-brand-600">Password updated successfully.</p>
          )}
          <button
            type="submit"
            disabled={pwStatus === "saving"}
            className="btn-primary"
          >
            {pwStatus === "saving" ? "Saving…" : "Update password"}
          </button>
        </form>
      </div>

      <div className="card border-red-200 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
        <p className="text-sm text-zinc-600">
          Signing out will end your current session on this device.
        </p>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <main className="container max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Account Settings</h1>
      <AuthGate>
        <AccountContent />
      </AuthGate>
    </main>
  );
}
