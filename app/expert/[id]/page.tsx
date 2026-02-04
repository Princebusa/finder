import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpertDetailClient } from "./ExpertDetailClient";

async function getExpert(id: string) {
  try {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/experts/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ExpertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expert = await getExpert(id);

  if (!expert || !expert.expertProfile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/search"
        className="mb-6 inline-block text-sm font-medium text-teal-600 hover:underline"
      >
        ← Back to search
      </Link>

      <div className="mb-8 rounded-xl border border-amber-200/50 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-teal-800">
              {expert.name}
            </h1>
            <p className="mt-1 text-lg text-teal-600">
              {expert.expertProfile.title}
            </p>
            {expert.location && (
              <p className="mt-1 text-sm text-stone-500">{expert.location}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              {expert.expertProfile.rating > 0
                ? `${expert.expertProfile.rating.toFixed(1)} ★`
                : "New"}
            </span>
            {expert.expertProfile.isAvailable && (
              <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800">
                Available
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {expert.expertProfile.expertises.map((e: { name: string }) => (
            <span
              key={e.name}
              className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700"
            >
              {e.name}
            </span>
          ))}
        </div>

        <p className="mt-4 text-stone-600">
          {expert.expertProfile.experience} years of experience
          {expert.expertProfile.hourlyRate != null &&
            ` · From $${expert.expertProfile.hourlyRate}/hr`}
        </p>

        {expert.expertProfile.bio && (
          <p className="mt-4 text-stone-700">{expert.expertProfile.bio}</p>
        )}
      </div>

      <ExpertDetailClient expertId={id} reviews={expert.reviewsReceived ?? []} />
    </div>
  );
}
