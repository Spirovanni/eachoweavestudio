export default function NotesPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Notes
          </h1>
          <p className="text-sm text-zinc-500">Capture ideas before they are formalized</p>
        </div>
      </div>
      <p className="text-sm text-zinc-500">No notes yet.</p>
    </div>
  );
}
