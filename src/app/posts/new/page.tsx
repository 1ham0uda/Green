import { AuthGate } from "@/features/auth/components/auth-gate";
import { CreatePostForm } from "@/features/posts/components/create-post-form";

export const metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <main className="mx-auto w-full max-w-[640px] pb-24 md:pb-0">
      <AuthGate>
        <div className="px-4 pt-5 pb-3">
          <p className="eyebrow">Create</p>
          <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
            New Post
          </h1>
        </div>
        <div className="border-t border-surface-border px-4 pt-5">
          <CreatePostForm />
        </div>
      </AuthGate>
    </main>
  );
}
