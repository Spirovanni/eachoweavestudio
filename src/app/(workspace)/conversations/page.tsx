export default function ConversationsPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Conversations
          </h1>
          <p className="text-sm text-zinc-500">Archive meaningful conversations that inspire the story</p>
        </div>
      </div>
      <p className="text-sm text-zinc-500">No conversations yet.</p>
    </div>
  );
}
