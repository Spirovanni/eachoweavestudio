import { SongEditView } from "./song-edit-view";

export default async function SongEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SongEditView songId={id} />;
}
