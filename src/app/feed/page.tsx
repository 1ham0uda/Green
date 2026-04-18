import Link from "next/link";
import { FeedList } from "@/features/posts/components/feed-list";

export const metadata = { title: "Feed" };

export default function FeedPage() {
  return (
    <main className="container max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Feed</h1>
          <p className="text-sm text-zinc-500">
            Latest from gardeners across the community.
          </p>
        </div>
        <Link href="/posts/new" className="btn-primary">
          New post
        </Link>
      </div>

      <FeedList />
    </main>
  );
}
