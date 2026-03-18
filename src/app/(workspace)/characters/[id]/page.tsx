export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Character Detail
      </h1>
      <p className="text-sm text-zinc-500">Character ID: {id}</p>
    </div>
  );
}
