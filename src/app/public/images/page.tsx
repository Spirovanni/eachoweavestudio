import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { PublicGallery } from "./public-gallery";

export const metadata: Metadata = {
  title: "Artwork — Echo Weave Studio",
  description: "Browse published artwork and illustrations from Echo Weave Studio.",
};

export default async function PublicImagesPage() {
  const supabase = await createClient();

  const { data: images } = await supabase
    .from("ews_images")
    .select("id, title, image_url, caption, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Published Artwork</h1>

      {!images || images.length === 0 ? (
        <p className="text-muted-foreground">No published artwork yet.</p>
      ) : (
        <PublicGallery images={images} />
      )}
    </div>
  );
}
