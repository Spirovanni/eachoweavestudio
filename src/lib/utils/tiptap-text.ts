/**
 * Extract plain text from Tiptap JSONContent.
 * Walks the document tree and concatenates all text nodes.
 */
export function extractTextFromTiptap(
  content: Record<string, unknown> | null
): string {
  if (!content) return "";

  const lines: string[] = [];

  function walk(node: Record<string, unknown>) {
    if (node.type === "text" && typeof node.text === "string") {
      lines.push(node.text);
      return;
    }

    const children = node.content as Record<string, unknown>[] | undefined;
    if (Array.isArray(children)) {
      for (const child of children) {
        walk(child);
      }
    }

    // Add newline after block-level nodes
    const blockTypes = [
      "paragraph",
      "heading",
      "blockquote",
      "listItem",
      "codeBlock",
      "horizontalRule",
    ];
    if (blockTypes.includes(node.type as string)) {
      lines.push("\n");
    }
  }

  walk(content);
  return lines.join("").trim();
}
