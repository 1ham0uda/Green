"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/use-auth";
import { isHandleAvailable } from "../services/auth-service";
import {
  COUNTRIES,
  GOVERNORATES,
  getCitiesForGovernorate,
} from "@/lib/data/egypt-locations";
import { Icon } from "@/components/ui/icon";

type AccountType = "user" | "business";
type Step = "account" | "location";

export function SignupForm() {
  const { signUp, loading, error } = useAuth();
  const router = useRouter();

  // Step
  const [step, setStep] = useState<Step>("account");

  // Account step
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("user");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Location step
  const [country, setCountry] = useState("EG");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);

  const cities = getCitiesForGovernorate(governorate);

  function validateUsernameFormat(value: string): string | null {
    if (value.length < 3) return "At least 3 characters required.";
    if (value.length > 20) return "Maximum 20 characters.";
    if (!/^[a-z0-9_]+$/.test(value)) return "Only lowercase letters, numbers, and underscore.";
    return null;
  }

  async function handleUsernameBlur() {
    const val = username.toLowerCase().trim();
    const formatErr = validateUsernameFormat(val);
    if (formatErr) { setUsernameError(formatErr); return; }
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

  function handleNextStep(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const handle = username.toLowerCase().trim();
    const formatErr = validateUsernameFormat(handle);
    if (formatErr) { setUsernameError(formatErr); return; }
    if (usernameError) return;
    setStep("location");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!governorate) { setLocationError("Please select a governorate."); return; }
    if (!city) { setLocationError("Please select a city."); return; }
    setLocationError(null);
    try {
      await signUp({
        displayName,
        username: username.toLowerCase().trim(),
        email,
        password,
        role: accountType,
        country,
        governorate,
        city,
      });
      router.push("/feed");
    } catch {
      // displayed via error from useAuth
    }
  }

  // ── Step 1: Account details ──────────────────────────────────────────────────
  if (step === "account") {
    return (
      <form onSubmit={handleNextStep} className="space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-brand-600 font-medium">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white text-[10px] font-bold">1</span>
            Account
          </div>
          <div className="h-px flex-1 bg-surface-border" />
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-surface-border text-[10px]">2</span>
            Location
          </div>
        </div>

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
                  {type === "user" ? "Browse, post & buy" : "Sell products & services"}
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
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400 text-sm">@</span>
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
          {checkingUsername && <p className="text-xs text-zinc-400">Checking availability…</p>}
          {usernameError && <p className="text-xs text-red-600">{usernameError}</p>}
          {!usernameError && !checkingUsername && username.length >= 3 && (
            <p className="text-xs text-brand-600">Username available ✓</p>
          )}
          <p className="text-xs text-zinc-400">Lowercase letters, numbers, underscore · 3–20 chars</p>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-zinc-800">Email</label>
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
          <label htmlFor="password" className="text-sm font-medium text-zinc-800">Password</label>
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

        <button
          type="submit"
          disabled={Boolean(usernameError) || checkingUsername}
          className="btn-primary w-full"
        >
          Continue
          <Icon.ArrowRight size={16} className="ml-1.5 inline" />
        </button>
      </form>
    );
  }

  // ── Step 2: Location ─────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => setStep("account")}
          className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
            <Icon.Check size={10} />
          </span>
          Account
        </button>
        <div className="h-px flex-1 bg-brand-300" />
        <div className="flex items-center gap-1.5 text-xs text-brand-600 font-medium">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white text-[10px] font-bold">2</span>
          Location
        </div>
      </div>

      <p className="text-sm text-ink-muted">
        Your location helps connect you with local gardeners and relevant content.
      </p>

      {/* Country — fixed to Egypt for now */}
      <div className="space-y-1">
        <label htmlFor="country" className="text-sm font-medium text-zinc-800">Country</label>
        <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="input">
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Governorate */}
      <div className="space-y-1">
        <label htmlFor="governorate" className="text-sm font-medium text-zinc-800">
          Governorate <span className="text-red-500">*</span>
        </label>
        <select
          id="governorate"
          required
          value={governorate}
          onChange={(e) => { setGovernorate(e.target.value); setCity(""); setLocationError(null); }}
          className="input"
        >
          <option value="">Select governorate…</option>
          {GOVERNORATES.map((g) => (
            <option key={g.code} value={g.code}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div className="space-y-1">
        <label htmlFor="city" className="text-sm font-medium text-zinc-800">
          City <span className="text-red-500">*</span>
        </label>
        <select
          id="city"
          required
          value={city}
          disabled={!governorate}
          onChange={(e) => { setCity(e.target.value); setLocationError(null); }}
          className="input disabled:opacity-50"
        >
          <option value="">{governorate ? "Select city…" : "Select governorate first"}</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {locationError && (
        <p className="text-sm text-red-600" role="alert">{locationError}</p>
      )}
      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !governorate || !city}
        className="btn-primary w-full"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
