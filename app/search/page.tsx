"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Expert = {
  id: string;
  name: string;
  location: string | null;
  expertProfile: {
    title: string;
    bio: string | null;
    hourlyRate: number | null;
    experience: number;
    rating: number;
    isAvailable: boolean;
    expertises: { name: string }[];
  };
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [expertise, setExpertise] = useState(searchParams.get("expertise") ?? "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") ?? "");
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (expertise.trim()) params.set("expertise", expertise.trim());
    if (minRating.trim()) params.set("minRating", minRating.trim());
    try {
      const res = await fetch(`/api/experts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load experts");
      const data = await res.json();
      setExperts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setExperts([]);
    } finally {
      setLoading(false);
    }
  }, [location, expertise, minRating]);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  return (
    <div className="w-full">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-teal-800">
        Find financial experts
      </h1>

      <div className="mb-8 rounded-xl border border-amber-200/50 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Filters
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Location</span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or region"
              className="w-48 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Expertise</span>
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="e.g. CFO, AR, Tax"
              className="w-48 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Min. rating</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-32 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Any</option>
              <option value="3">3+ ★</option>
              <option value="4">4+ ★</option>
              <option value="4.5">4.5+ ★</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => fetchExperts()}
            className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Apply
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-stone-500">Loading experts…</div>
      ) : experts.length === 0 ? (
        <div className="rounded-xl border border-amber-200/50 bg-white p-12 text-center text-stone-600">
          No experts match your filters. Try adjusting location, expertise, or
          minimum rating.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map((expert) => (
            <li key={expert.id}>
              <Link
                href={`/expert/${expert.id}`}
                className="block rounded-xl border border-amber-200/50 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-800">{expert.name}</h3>
                    <p className="text-sm text-teal-600">{expert.expertProfile.title}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-800">
                    {expert.expertProfile.rating > 0
                      ? `${expert.expertProfile.rating.toFixed(1)} ★`
                      : "New"}
                  </span>
                </div>
                {expert.location && (
                  <p className="mt-1 text-xs text-stone-500">{expert.location}</p>
                )}
                <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                  {expert.expertProfile.expertises.map((e) => e.name).join(", ")}
                </p>
                {expert.expertProfile.hourlyRate != null && (
                  <p className="mt-2 text-sm font-medium text-stone-700">
                    From ${expert.expertProfile.hourlyRate}/hr
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
