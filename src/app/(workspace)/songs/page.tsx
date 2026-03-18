export default function SongsPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Songs
          </h1>
          <p className="text-sm text-zinc-500">Lyrical and musical assets tied to the story</p>
        </div>
      </div>
      <p className="text-sm text-zinc-500">No songs yet.</p>
    </div>
  );
}
