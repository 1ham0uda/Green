"use client";

import { useState } from "react";
import { GOVERNORATES, getCitiesForGovernorate } from "@/lib/data/egypt-locations";
import { useCreateAd } from "../hooks/use-ads";

interface CreateAdFormProps {
  onSuccess?: () => void;
}

export function CreateAdForm({ onSuccess }: CreateAdFormProps) {
  const createAd = useCreateAd();

  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [linkURL, setLinkURL] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [targetGovernorates, setTargetGovernorates] = useState<string[]>([]);
  const [targetCities, setTargetCities] = useState<string[]>([]);
  const [reach, setReach] = useState(1000);
  const [error, setError] = useState<string | null>(null);

  const availableCities = targetGovernorates.flatMap((g) =>
    getCitiesForGovernorate(g).map((c) => ({ gov: g, city: c }))
  );

  function toggleGovernorate(code: string) {
    setTargetGovernorates((prev) =>
      prev.includes(code) ? prev.filter((g) => g !== code) : [...prev, code]
    );
    // Remove cities from removed governorate
    const cities = getCitiesForGovernorate(code);
    setTargetCities((prev) => prev.filter((c) => !cities.includes(c)));
  }

  function toggleCity(city: string) {
    setTargetCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!headline.trim()) {
      setError("Headline is required.");
      return;
    }
    try {
      await createAd.mutateAsync({
        headline,
        body: body || undefined,
        linkURL: linkURL || undefined,
        imageFile,
        targetGovernorates,
        targetCities,
        reach,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit ad.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label">Headline *</label>
        <input
          className="input"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Organic compost for urban gardens"
          maxLength={80}
        />
      </div>

      <div>
        <label className="label">Body copy</label>
        <textarea
          className="input resize-none"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Optional additional description…"
          maxLength={200}
        />
      </div>

      <div>
        <label className="label">Link URL</label>
        <input
          className="input"
          type="url"
          value={linkURL}
          onChange={(e) => setLinkURL(e.target.value)}
          placeholder="https://…"
        />
      </div>

      <div>
        <label className="label">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
        />
      </div>

      <div>
        <label className="label">Target governorates (leave empty for nationwide)</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {GOVERNORATES.map((g) => (
            <button
              key={g.code}
              type="button"
              onClick={() => toggleGovernorate(g.code)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                targetGovernorates.includes(g.code)
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-brand-300"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {availableCities.length > 0 && (
        <div>
          <label className="label">Target cities (leave empty for all cities in selected governorates)</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {availableCities.map(({ city }) => (
              <button
                key={city}
                type="button"
                onClick={() => toggleCity(city)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  targetCities.includes(city)
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-brand-300"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="label">Requested reach (impressions)</label>
        <input
          className="input w-40"
          type="number"
          min={100}
          step={100}
          value={reach}
          onChange={(e) => setReach(Number(e.target.value))}
        />
        <p className="mt-1 text-xs text-zinc-400">
          Admin will confirm the actual reach after payment verification.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={createAd.isPending}
        className="btn-primary disabled:opacity-60"
      >
        {createAd.isPending ? "Submitting…" : "Submit ad for review"}
      </button>
    </form>
  );
}
