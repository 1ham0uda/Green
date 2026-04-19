"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/use-auth";
import { isHandleAvailable } from "../services/auth-service";

type AccountType = "user" | "business";

export function SignupForm() {
  const { signUp, loading, error } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("user");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  function validateUsernameFormat(value: string): string | null {
    if (value.length < 3) return "At least 3 characters required.";
    if (value.length > 20) return "Maximum 20 characters.";
    if (!/^[a-z0-9_]+$/.test(value)) {
      return "Only lowercase letters, numbers, and underscore.";
    }
    return null;
  }

  async function handleUsernameBlur() {
    const val = username.toLowerCase().trim();
    const formatErr = validateUsernameFormat(val);
    if (formatErr) {
      setUsernameError(formatErr);
      return;
    }
    setCheckingUsername(true);
    try {
      const available = await isHandleAvailable(val);
      setUsernameError(available ? null : "Username is already taken.");
    } catch {
      // silently ignore network errors during check
    } finally {
      setCheckingUsername(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const handle = username.toLowerCase().trim();
    const formatErr = validateUsernameFormat(handle);
    if (formatErr) {
      setUsernameError(formatErr);
      return;
    }
    try {
      await signUp({ displayName, username: handle, email, password, role: accountType });
      router.push("/feed");
    } catch {
      // displayed via error from useAuth
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Account type */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-800">Account type</p>
        <div className="grid grid-cols-2 gap-3">
          {(["user", "business"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setAccountType(type)}
              className={`rounded-lg border-2 p-3 text-left transition ${
                accountType === type
                  ? "border-brand-600 bg-brand-50"
                  : "border-surface-border bg-white hover:border-brand-300"
              }`}
            >
              <p className="font-medium text-sm text-zinc-900 capitalize">{type}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {type === "user"
                  ? "Browse, post & buy"
                  : "Sell products & services"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Display name */}
      <div className="space-y-1">
        <label htmlFor="displayName" className="text-sm font-medium text-zinc-800">
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="input"
        />
      </div>

      {/* Username */}
      <div className="space-y-1">
        <label htmlFor="username" className="text-sm font-medium text-zinc-800">
          Username
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400 text-sm">
            @
          </span>
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            minLength={3}
            maxLength={20}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
              setUsernameError(null);
            }}
            onBlur={handleUsernameBlur}
            className="input pl-7"
            placeholder="your_username"
          />
        </div>
        {checkingUsername && (
          <p className="text-xs text-zinc-400">Checking availability…</p>
        )}
        {usernameError && (
          <p className="text-xs text-red-600">{usernameError}</p>
        )}
        {!usernameError && !checkingUsername && username.length >= 3 && (
          <p className="text-xs text-brand-600">Username available ✓</p>
        )}
        <p className="text-xs text-zinc-400">
          Lowercase letters, numbers, underscore · 3–20 chars
        </p>
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-zinc-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-zinc-800">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || Boolean(usernameError) || checkingUsername}
        className="btn-primary w-full"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
