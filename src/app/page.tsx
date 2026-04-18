import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="container flex flex-col items-start gap-6 py-24">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
          Urban Gardening · Community
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Grow plants in small spaces. Share every step of the journey.
        </h1>

        <p className="max-w-2xl text-lg text-zinc-600">
          Green is a niche social platform for balcony gardeners, rooftop
          farmers, and everyone who loves watching something grow. Track your
          plants, post updates, enter weekly competitions, and shop from local
          vendors.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/signup" className="btn-primary">
            Get started
          </Link>
          <Link href="/login" className="btn-secondary">
            I already have an account
          </Link>
        </div>
      </section>
    </main>
  );
}
