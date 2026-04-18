import { AuthGate } from "@/features/auth/components/auth-gate";
import { CreatePostForm } from "@/features/posts/components/create-post-form";

export const metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <main className="container max-w-2xl py-8">
      <AuthGate>
        <div className="card p-6">
          <h1 className="mb-6 text-xl font-semibold text-zinc-900">
            Share a new post
          </h1>
          <CreatePostForm />
        </div>
      </AuthGate>
    </main>
  );
}
