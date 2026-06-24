import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  text: string;
  className?: string;
}

/**
 * Renders text with inline LaTeX math expressions.
 * Supports both inline math ($...$) and display math ($$...$$).
 */
export function MathRenderer({ text, className }: MathRendererProps) {
  const rendered = useMemo(() => {
    // Split on $...$ and $$...$$ patterns
    const parts: { type: "text" | "inline" | "display"; content: string }[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      // Check for display math first ($$...$$)
      const displayMatch = remaining.match(/\$\$([\s\S]*?)\$\$/);
      const inlineMatch = remaining.match(/\$([^$]+?)\$/);

      if (displayMatch && (!inlineMatch || displayMatch.index! <= inlineMatch.index!)) {
        if (displayMatch.index! > 0) {
          parts.push({ type: "text", content: remaining.slice(0, displayMatch.index!) });
        }
        parts.push({ type: "display", content: displayMatch[1] });
        remaining = remaining.slice(displayMatch.index! + displayMatch[0].length);
      } else if (inlineMatch) {
        if (inlineMatch.index! > 0) {
          parts.push({ type: "text", content: remaining.slice(0, inlineMatch.index!) });
        }
        parts.push({ type: "inline", content: inlineMatch[1] });
        remaining = remaining.slice(inlineMatch.index! + inlineMatch[0].length);
      } else {
        parts.push({ type: "text", content: remaining });
        remaining = "";
      }
    }

    return parts.map((part, i) => {
      if (part.type === "text") {
        return <span key={i}>{part.content}</span>;
      }
      try {
        const html = katex.renderToString(part.content, {
          throwOnError: false,
          displayMode: part.type === "display",
        });
        return (
          <span
            key={i}
            className={part.type === "display" ? "block my-2 text-center" : ""}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return <span key={i}>{part.content}</span>;
      }
    });
  }, [text]);

  return <span className={className}>{rendered}</span>;
}
