import Link from "next/link";

async function getFeaturedExperts() {
  try {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/experts?minRating=0`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, 6) : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const experts = await getFeaturedExperts();

  return (
    <div className="flex flex-col items-center">
      <section className="mb-16 max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-teal-800 sm:text-5xl">
          Find the right financial expert for your business
        </h1>
        <p className="mb-8 text-lg text-stone-600">
          Connect with accountants, CFOs, and AR revenue specialists. Compare
          profiles, read reviews, and request quotes in one place.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-3 font-medium text-white hover:bg-teal-700"
        >
          Browse experts
        </Link>
      </section>

      <section className="mb-12 w-full">
        <h2 className="mb-6 text-xl font-semibold text-stone-800">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-amber-200/50 bg-white p-6 shadow-sm">
            <span className="mb-2 block text-2xl font-bold text-teal-600">1</span>
            <h3 className="mb-2 font-semibold text-stone-800">Search</h3>
            <p className="text-sm text-stone-600">
              Filter by location, expertise, and ratings to find experts that
              match your needs.
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/50 bg-white p-6 shadow-sm">
            <span className="mb-2 block text-2xl font-bold text-teal-600">2</span>
            <h3 className="mb-2 font-semibold text-stone-800">Compare</h3>
            <p className="text-sm text-stone-600">
              Read profiles, experience, and reviews from other businesses.
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/50 bg-white p-6 shadow-sm">
            <span className="mb-2 block text-2xl font-bold text-teal-600">3</span>
            <h3 className="mb-2 font-semibold text-stone-800">Request a quote</h3>
            <p className="text-sm text-stone-600">
              Send a quote request directly to experts. Sign in to get started.
            </p>
          </div>
        </div>
      </section>

      {experts.length > 0 && (
        <section className="w-full">
          <h2 className="mb-6 text-xl font-semibold text-stone-800">
            Featured experts
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((expert: { id: string; name: string; location: string | null; expertProfile: { title: string; rating: number; experience: number; hourlyRate: number | null; expertises: { name: string }[] } }) => (
              <Link
                key={expert.id}
                href={`/expert/${expert.id}`}
                className="rounded-xl border border-amber-200/50 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
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
                <p className="mt-2 text-sm text-stone-600">
                  {expert.expertProfile.experience} years ·{" "}
                  {expert.expertProfile.expertises.map((e: { name: string }) => e.name).join(", ")}
                </p>
                {expert.expertProfile.hourlyRate != null && (
                  <p className="mt-1 text-sm font-medium text-stone-700">
                    From ${expert.expertProfile.hourlyRate}/hr
                  </p>
                )}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/search"
              className="text-sm font-medium text-teal-600 hover:underline"
            >
              View all experts →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
