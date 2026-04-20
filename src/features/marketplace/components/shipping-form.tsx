"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ShippingAddress } from "../types";

const GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Sharqia",
  "Qalyubia",
  "Gharbia",
  "Monufia",
  "Beheira",
  "Kafr El Sheikh",
  "Damietta",
  "Port Said",
  "Ismailia",
  "Suez",
  "North Sinai",
  "South Sinai",
  "Beni Suef",
  "Faiyum",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matrouh",
];

interface ShippingFormProps {
  initial?: Partial<ShippingAddress>;
  onSubmit: (data: ShippingAddress) => void | Promise<void>;
  submitLabel: string;
  pending?: boolean;
}

export function ShippingForm({
  initial,
  onSubmit,
  submitLabel,
  pending,
}: ShippingFormProps) {
  const [recipientName, setRecipientName] = useState(initial?.recipientName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [governorate, setGovernorate] = useState(
    initial?.governorate ?? GOVERNORATES[0]
  );
  const [city, setCity] = useState(initial?.city ?? "");
  const [addressLine, setAddressLine] = useState(initial?.addressLine ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = recipientName.trim();
    const trimmedPhone = phone.trim();
    const trimmedCity = city.trim();
    const trimmedAddress = addressLine.trim();

    if (!trimmedName) return setError("Recipient name is required.");
    if (!/^01[0-2,5]\d{8}$/.test(trimmedPhone)) {
      return setError("Enter a valid Egyptian mobile number (e.g., 01012345678).");
    }
    if (!trimmedCity) return setError("City is required.");
    if (trimmedAddress.length < 8) {
      return setError("Address must be at least 8 characters.");
    }

    void onSubmit({
      recipientName: trimmedName,
      phone: trimmedPhone,
      governorate,
      city: trimmedCity,
      addressLine: trimmedAddress,
      notes: notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="recipient">Recipient name</label>
          <input
            id="recipient"
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="input"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="phone">Mobile number</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01012345678"
            className="input"
            autoComplete="tel"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="governorate">Governorate</label>
          <select
            id="governorate"
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
            className="input"
          >
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="city">City / District</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input"
            autoComplete="address-level2"
            required
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="addressLine">Street address</label>
        <input
          id="addressLine"
          type="text"
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          placeholder="Building, street, floor, apartment"
          className="input"
          autoComplete="street-address"
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="notes">Delivery notes (optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={300}
          className="input"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}
