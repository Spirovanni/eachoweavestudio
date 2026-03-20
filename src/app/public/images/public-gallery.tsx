"use client";

import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

interface PublicGalleryProps {
  images: GalleryImage[];
}

export function PublicGallery({ images }: PublicGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const showNext = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null && i < images.length - 1 ? i + 1 : i
    );
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <>
      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, idx) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setLightboxIndex(idx)}
            className="group overflow-hidden rounded-lg border border-border text-left transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
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
                <p className="text-xs text-muted-foreground">{image.caption}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="size-6" />
          </button>

          {/* Prev button */}
          {lightboxIndex! > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              className="absolute left-4 text-white/70 hover:text-white transition-colors z-10"
            >
              <ChevronLeft className="size-8" />
            </button>
          )}

          {/* Image + caption */}
          <div
            className="flex flex-col items-center max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.image_url}
              alt={currentImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            <div className="mt-3 text-center text-white">
              <h3 className="text-lg font-medium">{currentImage.title}</h3>
              {currentImage.caption && (
                <p className="text-sm text-white/70 mt-1">
                  {currentImage.caption}
                </p>
              )}
            </div>
          </div>

          {/* Next button */}
          {lightboxIndex! < images.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              className="absolute right-4 text-white/70 hover:text-white transition-colors z-10"
            >
              <ChevronRight className="size-8" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
