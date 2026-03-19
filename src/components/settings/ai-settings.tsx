"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Sparkles, BarChart3 } from "lucide-react";
import type { AIProviderName } from "@/lib/ai";

export interface AISettings {
  defaultProvider?: AIProviderName;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  enabledTools?: {
    plot?: boolean;
    outline?: boolean;
    story?: boolean;
    assist?: boolean;
    copilot?: boolean;
  };
}

interface AISettingsProps {
  projectId: string;
  initialSettings: AISettings;
}

const PROVIDER_OPTIONS: Array<{ value: AIProviderName; label: string }> = [
  { value: "anthropic", label: "Anthropic (Claude)" },
  { value: "openai", label: "OpenAI (GPT)" },
];

const MODEL_OPTIONS: Record<AIProviderName, Array<{ value: string; label: string }>> = {
  anthropic: [
    { value: "claude-sonnet-4-5-20250929", label: "Claude Sonnet 4.5 (Default)" },
    { value: "claude-opus-4-6", label: "Claude Opus 4.6 (Most Capable)" },
    { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (Fast)" },
  ],
  openai: [
    { value: "gpt-4o", label: "GPT-4o (Default)" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Fast)" },
  ],
};

const TEMPERATURE_OPTIONS = [
  { value: "0.0", label: "0.0 (Deterministic)" },
  { value: "0.3", label: "0.3 (Focused)" },
  { value: "0.7", label: "0.7 (Balanced)" },
  { value: "0.9", label: "0.9 (Creative)" },
  { value: "1.0", label: "1.0 (Most Creative)" },
];

const MAX_TOKENS_OPTIONS = [
  { value: "2048", label: "2,048 tokens (Short)" },
  { value: "4096", label: "4,096 tokens (Default)" },
  { value: "8192", label: "8,192 tokens (Long)" },
  { value: "16384", label: "16,384 tokens (Very Long)" },
];

const AI_TOOLS = [
  { id: "plot", label: "Plot Generator", description: "Generate plot outlines and story arcs" },
  { id: "outline", label: "Outline Builder", description: "Create detailed chapter outlines" },
  { id: "story", label: "Story Writer", description: "Generate story content and prose" },
  { id: "assist", label: "Writing Assistant", description: "Get help with writing challenges" },
  { id: "copilot", label: "AI Copilot", description: "Real-time writing suggestions" },
] as const;

export function AISettingsComponent({ projectId, initialSettings }: AISettingsProps) {
  const [provider, setProvider] = useState<AIProviderName>(initialSettings.defaultProvider || "anthropic");
  const [model, setModel] = useState<string>(
    initialSettings.defaultModel || "claude-sonnet-4-5-20250929"
  );
  const [temperature, setTemperature] = useState<string>(
    String(initialSettings.defaultTemperature ?? 0.7)
  );
  const [maxTokens, setMaxTokens] = useState<string>(
    String(initialSettings.defaultMaxTokens ?? 4096)
  );
  const [enabledTools, setEnabledTools] = useState<Record<string, boolean>>(
    initialSettings.enabledTools || {
      plot: true,
      outline: true,
      story: true,
      assist: true,
      copilot: true,
    }
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [usageStats, setUsageStats] = useState<{ totalGenerations: number; totalTokens: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch usage stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/ai/generations?project_id=${projectId}&limit=1000`);
        if (!res.ok) throw new Error("Failed to fetch stats");

        const { data } = await res.json();

        const totalGenerations = data?.length || 0;
        const totalTokens = data?.reduce((sum: number, gen: any) => {
          return sum + (gen.metadata?.usage?.totalTokens || 0);
        }, 0) || 0;

        setUsageStats({ totalGenerations, totalTokens });
      } catch (err) {
        console.error("Failed to fetch AI usage stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [projectId]);

  // Update model when provider changes
  useEffect(() => {
    const defaultModel = MODEL_OPTIONS[provider][0].value;
    setModel(defaultModel);
  }, [provider]);

  const hasChanges =
    provider !== (initialSettings.defaultProvider || "anthropic") ||
    model !== (initialSettings.defaultModel || "claude-sonnet-4-5-20250929") ||
    temperature !== String(initialSettings.defaultTemperature ?? 0.7) ||
    maxTokens !== String(initialSettings.defaultMaxTokens ?? 4096) ||
    JSON.stringify(enabledTools) !== JSON.stringify(initialSettings.enabledTools || {
      plot: true,
      outline: true,
      story: true,
      assist: true,
      copilot: true,
    });

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Fetch current settings first
      const getRes = await fetch(`/api/settings?project_id=${projectId}`);
      if (!getRes.ok) throw new Error("Failed to fetch current settings");

      const { data: currentSettings } = await getRes.json();

      // Merge AI settings into the settings JSONB field
      const updatedSettings = {
        ...currentSettings.settings,
        ai: {
          defaultProvider: provider,
          defaultModel: model,
          defaultTemperature: parseFloat(temperature),
          defaultMaxTokens: parseInt(maxTokens, 10),
          enabledTools,
        },
      };

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          settings: updatedSettings,
        }),
      });

      if (!res.ok) {
        const { error: errorMsg } = await res.json();
        throw new Error(errorMsg || "Failed to update AI settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update AI settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleTool = (toolId: string) => {
    setEnabledTools((prev) => ({ ...prev, [toolId]: !prev[toolId] }));
  };

  return (
    <div className="space-y-6">
      {/* AI Provider Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle>AI Provider & Model</CardTitle>
          </div>
          <CardDescription>
            Configure default AI provider and generation parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provider">Default Provider</Label>
              <Select value={provider} onValueChange={(v) => v && setProvider(v as AIProviderName)}>
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Default Model</Label>
              <Select value={model} onValueChange={(v) => v && setModel(v)}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS[provider].map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Select value={temperature} onValueChange={(v) => v && setTemperature(v)}>
                <SelectTrigger id="temperature">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPERATURE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Higher = more creative, lower = more focused
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Output Tokens</Label>
              <Select value={maxTokens} onValueChange={(v) => v && setMaxTokens(v)}>
                <SelectTrigger id="maxTokens">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAX_TOKENS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Maximum length of AI responses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Tools Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>AI Tools</CardTitle>
          <CardDescription>
            Enable or disable individual AI tools for this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {AI_TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{tool.label}</p>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
              </div>
              <Switch
                checked={enabledTools[tool.id] ?? true}
                onCheckedChange={() => toggleTool(tool.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <CardTitle>Usage Statistics</CardTitle>
          </div>
          <CardDescription>
            View AI usage and token consumption for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading statistics...
            </div>
          ) : usageStats ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Total Generations</p>
                <p className="text-2xl font-bold">{usageStats.totalGenerations.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Total Tokens Used</p>
                <p className="text-2xl font-bold">{usageStats.totalTokens.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No usage data available</p>
          )}
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
          AI settings updated successfully!
        </div>
      )}

      {/* Save Button */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Save AI Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
