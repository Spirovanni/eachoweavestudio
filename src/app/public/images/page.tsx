import { createClient } from "@/lib/supabase/server";

export default async function PublicImagesPage() {
  const supabase = await createClient();

  const { data: images } = await supabase
    .from("ews_images")
    .select("id, title, image_url, caption, symbolism, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Published Artwork</h1>

      {!images || images.length === 0 ? (
        <p className="text-muted-foreground">No published artwork yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group overflow-hidden rounded-lg border border-border"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="size-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-3 space-y-1">
                <h3 className="font-medium text-sm">{image.title}</h3>
                {image.caption && (
                  <p className="text-xs text-muted-foreground">
                    {image.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
