"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: <Icon.Leaf size={22} />,
    title: "Track every leaf",
    body: "Log watering, pruning, and progress for each plant — with photos.",
  },
  {
    icon: <Icon.Users size={22} />,
    title: "Join the community",
    body: "Follow growers, share tips, and celebrate every harvest together.",
  },
  {
    icon: <Icon.Trophy size={22} />,
    title: "Weekly competitions",
    body: "Submit your best plants and vote for community favorites.",
  },
  {
    icon: <Icon.ShoppingBag size={22} />,
    title: "Marketplace",
    body: "Shop seeds, tools, and gear directly from verified local vendors.",
  },
];

export default function HomePage() {
  return (
    <main className="relative">
      {/* Hero */}
      <section className="container py-16 sm:py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          className="flex flex-col items-start gap-6"
        >
          <Badge variant="brand">
            <Icon.Sparkle size={12} />
            Urban gardening community
          </Badge>

          <h1 className="max-w-4xl text-balance text-5xl font-bold tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Grow plants in small spaces.{" "}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-400 bg-clip-text text-transparent">
              Share every step.
            </span>
          </h1>

          <p className="max-w-2xl text-pretty text-lg text-ink-muted">
            Green is a niche social platform for balcony gardeners, rooftop
            farmers, and everyone who loves watching something grow. Track your
            plants, post updates, enter competitions, and shop from local
            vendors.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="btn-primary btn-lg inline-flex items-center gap-1.5"
            >
              Get started
              <Icon.ArrowRight size={18} />
            </Link>
            <Link href="/feed" className="btn-secondary btn-lg">
              Explore the feed
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="card-hover p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-500 p-10 text-white shadow-elevated sm:p-14">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative max-w-2xl space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Start your garden story today.
            </h2>
            <p className="text-base text-white/80">
              Join thousands of gardeners cultivating beauty in small spaces.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-soft transition hover:shadow-elevated active:scale-[0.98]"
              >
                Create your account
                <Icon.ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
