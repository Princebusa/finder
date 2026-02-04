import Link from "next/link";

export default function ExpertNotFound() {
  return (
    <div className="py-12 text-center">
      <h1 className="mb-2 text-xl font-bold text-stone-800">Expert not found</h1>
      <p className="mb-4 text-stone-600">
        This expert may no longer be listed or the link is incorrect.
      </p>
      <Link
        href="/search"
        className="font-medium text-teal-600 hover:underline"
      >
        Browse experts →
      </Link>
    </div>
  );
}
