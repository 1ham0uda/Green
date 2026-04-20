"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAdminCreateCompetition } from "@/features/admin/hooks/use-admin";

export default function NewCompetitionPage() {
  const router = useRouter();
  const create = useAdminCreateCompetition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [rewards, setRewards] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!startsAt || !endsAt) {
      setError("Start and end dates are required.");
      return;
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);

    if (end <= start) {
      setError("End date must be after start date.");
      return;
    }

    setError(null);
    try {
      const id = await create.mutateAsync({
        title,
        description,
        rules,
        rewards,
        startsAt: start,
        endsAt: end,
      });
      router.push(`/competitions/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <p className="eyebrow mb-1">Admin</p>
        <h2 className="font-serif text-[24px] font-normal tracking-[-0.02em] text-ink">Create Competition</h2>
      </div>
      <div className="rounded-2xl border border-surface-border bg-surface p-6">

      <form onSubmit={handleSubmit} className="space-y-4">
        {(
          [
            { id: "title", label: "Title", value: title, setter: setTitle },
          ] as const
        ).map(({ id, label }) => (
          <div key={id} className="space-y-1">
            <label htmlFor={id} className="label">
              {label}
            </label>
            <input
              id={id}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
          </div>
        ))}

        {(
          [
            {
              id: "description",
              label: "Description",
              value: description,
              setter: setDescription,
            },
            { id: "rules", label: "Rules", value: rules, setter: setRules },
            {
              id: "rewards",
              label: "Rewards",
              value: rewards,
              setter: setRewards,
            },
          ] as const
        ).map(({ id, label, value, setter }) => (
          <div key={id} className="space-y-1">
            <label htmlFor={id} className="label">
              {label}
            </label>
            <textarea
              id={id}
              rows={3}
              required
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="input"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="startsAt" className="label">
              Starts at
            </label>
            <input
              id="startsAt"
              type="datetime-local"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="input"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="endsAt" className="label">
              Ends at
            </label>
            <input
              id="endsAt"
              type="datetime-local"
              required
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="input"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={create.isPending}
          className="btn-primary"
        >
          {create.isPending ? "Creating…" : "Create competition"}
        </button>
      </form>
      </div>
    </div>
  );
}
