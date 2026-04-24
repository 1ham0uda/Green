"use client";

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

// ─── Password validation ──────────────────────────────────────────────────────

interface PwCheck {
  label: string;
  pass: boolean;
}

function getPwChecks(pw: string): PwCheck[] {
  return [
    { label: "At least 8 characters",        pass: pw.length >= 8 },
    { label: "At least 1 uppercase letter",   pass: /[A-Z]/.test(pw) },
    { label: "At least 1 number",             pass: /[0-9]/.test(pw) },
    { label: "At least 1 special character",  pass: /[^A-Za-z0-9]/.test(pw) },
  ];
}

function isPasswordValid(pw: string): boolean {
  return getPwChecks(pw).every((c) => c.pass);
}

// ─── Post-signup verification screen ─────────────────────────────────────────

function VerificationSent({ email }: { email: string }) {
  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
        <Icon.Mail size={28} className="text-brand-700" />
      </div>
      <div className="space-y-1.5">
        <h2 className="font-serif text-[22px] font-normal text-ink">Check your inbox</h2>
        <p className="font-sans text-[13px] text-ink-muted">
          We sent a verification link to{" "}
          <span className="font-medium text-ink">{email}</span>.
          Click the link to activate your account, then come back to sign in.
        </p>
      </div>
      <div className="rounded-xl border border-surface-border bg-surface-subtle p-4 text-xs text-ink-muted text-left space-y-1">
        <p className="font-semibold text-ink">Didn&apos;t receive it?</p>
        <p>Check your spam or junk folder. The link expires in 24 hours.</p>
      </div>
      <a href="/login" className="btn-primary block">
        Go to Sign in
      </a>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function SignupForm() {
  const { signUp, loading, error } = useAuth();

  const [step, setStep] = useState<Step>("account");
  const [done, setDone] = useState(false);

  // Account step
  const [displayName, setDisplayName]         = useState("");
  const [username, setUsername]               = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType]         = useState<AccountType>("user");
  const [showPw, setShowPw]                   = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [usernameError, setUsernameError]     = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [formError, setFormError]             = useState<string | null>(null);

  // Location step
  const [country, setCountry]         = useState("EG");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity]               = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);

  const cities    = getCitiesForGovernorate(governorate);
  const pwChecks  = getPwChecks(password);
  const pwValid   = isPasswordValid(password);
  const pwMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // ── Username validation ──────────────────────────────────────────────────────

  function validateUsernameFormat(value: string): string | null {
    if (value.length < 3)  return "At least 3 characters required.";
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
      // ignore network errors during check
    } finally {
      setCheckingUsername(false);
    }
  }

  // ── Step 1: Next ─────────────────────────────────────────────────────────────

  function handleNextStep(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const handle = username.toLowerCase().trim();
    const formatErr = validateUsernameFormat(handle);
    if (formatErr) { setUsernameError(formatErr); return; }
    if (usernameError) return;

    if (!pwValid) {
      setFormError("Please fix the password requirements below.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setStep("location");
  }

  // ── Step 2: Submit ───────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!governorate) { setLocationError("Please select a governorate."); return; }
    if (!city)        { setLocationError("Please select a city."); return; }
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
      setDone(true);
    } catch {
      // error displayed via useAuth error state
    }
  }

  if (done) return <VerificationSent email={email} />;

  // ── Step 1: Account details ──────────────────────────────────────────────────
  if (step === "account") {
    return (
      <form onSubmit={handleNextStep} className="space-y-4">
        {/* Progress */}
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
                className={`rounded-xl border-2 p-3 text-left transition ${
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
          <label htmlFor="displayName" className="text-sm font-medium text-zinc-800">Display name</label>
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
          <label htmlFor="username" className="text-sm font-medium text-zinc-800">Username</label>
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
          {usernameError   && <p className="text-xs text-red-600">{usernameError}</p>}
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
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <Icon.EyeOff size={16} /> : <Icon.Eye size={16} />}
            </button>
          </div>

          {/* Password strength checklist */}
          {password.length > 0 && (
            <ul className="mt-2 space-y-1">
              {pwChecks.map((c) => (
                <li key={c.label} className={`flex items-center gap-1.5 text-xs ${c.pass ? "text-brand-700" : "text-zinc-400"}`}>
                  <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold ${
                    c.pass ? "bg-brand-100 text-brand-700" : "bg-zinc-100 text-zinc-400"
                  }`}>
                    {c.pass ? "✓" : "·"}
                  </span>
                  {c.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-800">Confirm password</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`input pr-10 ${pwMismatch ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <Icon.EyeOff size={16} /> : <Icon.Eye size={16} />}
            </button>
          </div>
          {pwMismatch && (
            <p className="text-xs text-red-600">Passwords do not match.</p>
          )}
          {!pwMismatch && confirmPassword.length > 0 && password === confirmPassword && (
            <p className="text-xs text-brand-600">Passwords match ✓</p>
          )}
        </div>

        {formError && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={Boolean(usernameError) || checkingUsername || pwMismatch}
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
      {/* Progress */}
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

      {/* Country */}
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
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>
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
