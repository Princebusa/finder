"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ExpertProfile = {
  id: string;
  title: string;
  bio: string | null;
  hourlyRate: number | null;
  experience: number;
  isAvailable: boolean;
  expertises: { id: string; name: string }[];
};

export default function ProfileEditPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [experience, setExperience] = useState("");
  const [expertises, setExpertises] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.role !== "EXPERT" || !data?.expertProfile) {
          router.push("/profile");
          return;
        }
        const p = data.expertProfile as ExpertProfile;
        setProfile(p);
        setTitle(p.title);
        setBio(p.bio ?? "");
        setHourlyRate(p.hourlyRate != null ? String(p.hourlyRate) : "");
        setExperience(String(p.experience));
        setExpertises(p.expertises.map((e) => e.name).join(", "));
        setIsAvailable(p.isAvailable);
      })
      .catch(() => router.push("/profile"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError("");
    setSaving(true);
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
          isAvailable,
          expertises: expertiseList.length > 0 ? expertiseList : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to update profile");
        setSaving(false);
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Something went wrong");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-stone-500">Loading…</div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/profile"
        className="mb-6 inline-block text-sm font-medium text-teal-600 hover:underline"
      >
        ← Back to profile
      </Link>
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-teal-800">
        Edit expert profile
      </h1>
      <p className="mb-8 text-stone-600">
        Update your title, bio, experience, and expertise.
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
            className="rounded-lg border border-stone-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </label>
        <label className="mb-4 flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-700">Bio (optional)</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
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
            className="rounded-lg border border-stone-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </label>
        <label className="mb-4 flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-700">Hourly rate (optional)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-32 rounded-lg border border-stone-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </label>
        <label className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="rounded border-stone-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm font-medium text-stone-700">Available for new clients</span>
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-teal-600 px-6 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
