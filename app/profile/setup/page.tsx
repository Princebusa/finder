"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [experience, setExperience] = useState("");
  const [expertises, setExpertises] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const expertiseList = expertises
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const res = await fetch("/api/profile/expert", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          bio: bio.trim() || undefined,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          experience: experience ? parseInt(experience, 10) : 0,
          expertises: expertiseList.length > 0 ? expertiseList : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to create profile");
        setLoading(false);
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/profile"
        className="mb-6 inline-block text-sm font-medium text-teal-600 hover:underline"
      >
        ← Back to profile
      </Link>
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-teal-800">
        Set up your expert profile
      </h1>
      <p className="mb-8 text-stone-600">
        Tell businesses about your experience and services so they can find you.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-amber-200/50 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {error}
          </div>
        )}
        <label className="mb-4 flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-700">Professional title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. CFO, Senior Accountant, AR Specialist"
            className="rounded-lg border border-stone-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </label>
        <label className="mb-4 flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-700">Bio (optional)</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Describe your background and what you offer..."
            className="rounded-lg border border-stone-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </label>
        <label className="mb-4 flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-700">Years of experience</span>
          <input
            type="number"
            min="0"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="e.g. 10"
            className="w-24 rounded-lg border border-stone-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </label>
        <label className="mb-4 flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-700">
            Areas of expertise (comma-separated)
          </span>
          <input
            type="text"
            value={expertises}
            onChange={(e) => setExpertises(e.target.value)}
            placeholder="e.g. CFO, Tax, AR, Bookkeeping"
            className="rounded-lg border border-stone-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </label>
        <label className="mb-6 flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-700">
            Hourly rate (optional)
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="e.g. 150"
            className="w-32 rounded-lg border border-stone-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-teal-600 px-6 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
