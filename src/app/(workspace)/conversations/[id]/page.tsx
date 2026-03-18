export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Conversation Detail
      </h1>
      <p className="text-sm text-zinc-500">Conversation ID: {id}</p>
    </div>
  );
}
