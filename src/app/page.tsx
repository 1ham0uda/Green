"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";

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
    <main>
      {/* Hero */}
      <section className="container max-w-5xl py-20 sm:py-28 lg:py-36">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          className="flex flex-col items-start gap-7"
        >
          <p className="eyebrow">Urban gardening community</p>

          <h1 className="max-w-3xl text-balance font-serif text-[52px] font-normal leading-[1.1] tracking-[-0.03em] text-ink sm:text-[64px] lg:text-[80px]">
            Grow plants in small spaces.{" "}
            <em className="not-italic text-brand-500">Share every step.</em>
          </h1>

          <p className="max-w-xl font-sans text-[16px] leading-relaxed text-pretty text-ink-muted">
            A quiet platform for balcony gardeners and rooftop farmers. Track
            your plants, post updates, enter competitions, and shop from local
            vendors.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="btn-primary btn-lg inline-flex items-center gap-1.5"
            >
              Get started
              <Icon.ArrowRight size={16} />
            </Link>
            <Link href="/feed" className="btn-ghost btn-lg">
              Explore the feed
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container max-w-5xl pb-24">
        <div className="divider mb-12" />
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col gap-3"
            >
              <span className="text-brand-500">{f.icon}</span>
              <h3 className="font-sans text-[14px] font-medium text-ink">{f.title}</h3>
              <p className="font-sans text-[13px] leading-relaxed text-ink-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-5xl pb-24">
        <div className="rounded-3xl border border-surface-border bg-surface px-10 py-12 sm:px-14">
          <p className="eyebrow mb-4">Ready to grow?</p>
          <h2 className="font-serif text-[32px] font-normal leading-tight tracking-[-0.02em] text-ink sm:text-[40px]">
            Start your garden story today.
          </h2>
          <p className="mt-3 font-sans text-[14px] text-ink-muted">
            Join thousands of gardeners cultivating beauty in small spaces.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary btn-lg inline-flex items-center gap-1.5">
              Create your account
              <Icon.ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn-ghost btn-lg">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
