"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ExpertProfile = {
  id: string;
  title: string;
  bio: string | null;
  hourlyRate: number | null;
  experience: number;
  rating: number;
  isAvailable: boolean;
  expertises: { id: string; name: string }[];
};

type Profile = {
  id: string;
  name: string;
  email: string;
  location: string | null;
  role: string;
  expertProfile: ExpertProfile | null;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    fetch("/api/me")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login?callbackUrl=/profile");
          return null;
        }
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setError("");
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="py-12 text-center text-stone-500">Loading profile…</div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-amber-200/50 bg-white p-8 text-center shadow-sm">
        <h1 className="mb-2 text-xl font-bold text-teal-800">Profile</h1>
        <p className="mb-4 text-stone-600">
          Sign in to view and edit your profile.
        </p>
        <Link
          href="/login?callbackUrl=/profile"
          className="inline-block rounded-full bg-teal-600 px-6 py-2 font-medium text-white hover:bg-teal-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-amber-50 px-4 py-2 text-amber-800">
        {error}
      </div>
    );
  }

  // If user is expert but no expertProfile yet, show setup CTA
  const isExpert = profile?.role === "EXPERT";
  if (profile && isExpert && !profile.expertProfile) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-amber-200/50 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-bold text-teal-800">Welcome, {profile.name}</h1>
        <p className="mb-6 text-stone-600">
          You signed up as an expert. Create your expert profile so businesses can
          find you and request quotes.
        </p>
        <Link
          href="/profile/setup"
          className="inline-block rounded-full bg-teal-600 px-6 py-2 font-medium text-white hover:bg-teal-700"
        >
          Set up expert profile
        </Link>
      </div>
    );
  }

  const expert = profile?.expertProfile;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-teal-800">
        Your profile
      </h1>

      <div className="rounded-xl border border-amber-200/50 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Account
        </h2>
        <p className="font-medium text-stone-800">{profile?.name}</p>
        <p className="text-sm text-stone-600">{profile?.email}</p>
        {profile?.location && (
          <p className="mt-1 text-sm text-stone-600">{profile.location}</p>
        )}
      </div>

      {expert && (
        <div className="mt-8 rounded-xl border border-amber-200/50 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Expert profile
            </h2>
            <Link
              href="/profile/edit"
              className="text-sm font-medium text-teal-600 hover:underline"
            >
              Edit
            </Link>
          </div>
          <p className="mt-2 text-lg font-semibold text-stone-800">{expert.title}</p>
          <p className="mt-1 text-sm text-stone-600">
            {expert.experience} years · {expert.expertises.map((e) => e.name).join(", ")}
          </p>
          {expert.hourlyRate != null && (
            <p className="mt-1 text-sm text-stone-700">${expert.hourlyRate}/hr</p>
          )}
          {expert.bio && (
            <p className="mt-3 text-stone-600">{expert.bio}</p>
          )}
          <p className="mt-2 text-sm text-stone-500">
            Rating: {expert.rating > 0 ? `${expert.rating.toFixed(1)} ★` : "No reviews yet"}
          </p>
        </div>
      )}

      {profile && !expert && profile.role === "EXPERT" && (
        <div className="mt-8 rounded-xl border border-amber-200/50 bg-white p-6 shadow-sm">
          <p className="text-stone-600">
            You haven&apos;t set up your expert profile yet.
          </p>
          <Link
            href="/profile/setup"
            className="mt-3 inline-block text-sm font-medium text-teal-600 hover:underline"
          >
            Set up expert profile →
          </Link>
        </div>
      )}
    </div>
  );
}
