"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Song } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Check, AlertCircle } from "lucide-react";

const AUTOSAVE_DELAY = 2000;

type SaveState = "idle" | "saving" | "saved" | "error";

export function SongEditView({ songId }: { songId: string }) {
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [mood, setMood] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadRef = useRef(true);

  // Fetch song data
  useEffect(() => {
    async function fetchSong() {
      try {
        const res = await fetch(`/api/songs/${songId}`);
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Failed to load song");
        }
        const { data } = await res.json();
        setSong(data);
        setTitle(data.title);
        setLyrics(data.lyrics || "");
        setAudioUrl(data.audio_url || "");
        setMood(data.mood || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load song");
      } finally {
        setLoading(false);
      }
    }
    fetchSong();
  }, [songId]);

  // Auto-save function
  const save = useCallback(
    async (updates: Partial<Pick<Song, "title" | "lyrics" | "audio_url" | "mood">>) => {
      setSaveState("saving");
      try {
        const res = await fetch(`/api/songs/${songId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          throw new Error("Save failed");
        }
        setSaveState("saved");
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setSaveState("error");
      }
    },
    [songId]
  );

  // Debounced auto-save
  const scheduleSave = useCallback(
    (updates: Partial<Pick<Song, "title" | "lyrics" | "audio_url" | "mood">>) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      setHasUnsavedChanges(true);
      setSaveState("idle");
      saveTimerRef.current = setTimeout(() => {
        save(updates);
      }, AUTOSAVE_DELAY);
    },
    [save]
  );

  // Handle field changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!initialLoadRef.current) {
      scheduleSave({ title: newTitle, lyrics, audio_url: audioUrl, mood });
    }
  };

  const handleLyricsChange = (newLyrics: string) => {
    setLyrics(newLyrics);
    if (!initialLoadRef.current) {
      scheduleSave({ title, lyrics: newLyrics, audio_url: audioUrl, mood });
    }
  };

  const handleAudioUrlChange = (newAudioUrl: string) => {
    setAudioUrl(newAudioUrl);
    if (!initialLoadRef.current) {
      scheduleSave({ title, lyrics, audio_url: newAudioUrl, mood });
    }
  };

  const handleMoodChange = (newMood: string) => {
    setMood(newMood);
    if (!initialLoadRef.current) {
      scheduleSave({ title, lyrics, audio_url: audioUrl, mood: newMood });
    }
  };

  // Mark initial load complete after first render with data
  useEffect(() => {
    if (song && initialLoadRef.current) {
      const timer = setTimeout(() => {
        initialLoadRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [song]);

  // Warn on unsaved changes when navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error || "Song not found"}</p>
        <Button variant="outline" onClick={() => router.push("/songs")}>
          Back to Songs
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <Link href={`/songs/${songId}`}>
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft />
          </Button>
        </Link>

        <div className="flex flex-1 items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Edit Song</span>

          {/* Save indicator */}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveState === "saving" && (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveState === "saved" && (
              <>
                <Check className="size-3 text-green-600" />
                <span>Saved</span>
              </>
            )}
            {saveState === "error" && (
              <>
                <AlertCircle className="size-3 text-destructive" />
                <span>Save failed</span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => save({ title, lyrics, audio_url: audioUrl, mood })}
                >
                  Retry
                </Button>
              </>
            )}
            {saveState === "idle" && hasUnsavedChanges && (
              <Badge variant="outline">Unsaved changes</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Song title..."
              className="text-2xl font-bold h-auto py-2"
            />
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Mood
            </label>
            <Input
              value={mood}
              onChange={(e) => handleMoodChange(e.target.value)}
              placeholder="e.g. melancholy, triumphant, ethereal..."
            />
          </div>

          {/* Audio URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Audio URL
            </label>
            <Input
              type="url"
              value={audioUrl}
              onChange={(e) => handleAudioUrlChange(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Lyrics */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Lyrics
            </label>
            <Textarea
              value={lyrics}
              onChange={(e) => handleLyricsChange(e.target.value)}
              placeholder="Write or paste lyrics here..."
              className="min-h-96 font-mono text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
