import { CreateDailyPostForm } from "@/components/CreateDailyPostForm";

export default function CreatePostPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Create Daily Impact Post</h1>
      <p className="text-muted-foreground mb-8">This post will be visible to all donors.</p>
      <CreateDailyPostForm />
    </div>
  );
}