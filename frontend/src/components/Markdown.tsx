import React from 'react';

interface MarkdownProps {
  content: string;
  className?: string;
  variant?: 'light' | 'dark';
}

function renderInline(text: string): (string | JSX.Element)[] {
  // Bold: **text**
  const boldSplit = text.split(/(\*\*[^*]+\*\*)/g);
  const boldApplied = boldSplit.flatMap((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return [<strong key={`b-${i}`}>{inner}</strong>];
    }
    return [part];
  });

  // Italic: *text*
  const italicSplit = boldApplied.flatMap((chunk, idx) => {
    const t = typeof chunk === 'string' ? chunk : null;
    if (!t) return [chunk];
    const parts = t.split(/(\*[^*]+\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith('*') && p.endsWith('*')) {
        return <em key={`i-${idx}-${i}`}>{p.slice(1, -1)}</em>;
      }
      return p;
    });
  });

  // Inline code: `code`
  const codeSplit = italicSplit.flatMap((chunk, idx) => {
    const t = typeof chunk === 'string' ? chunk : null;
    if (!t) return [chunk];
    const parts = t.split(/(`[^`]+`)/g);
    return parts.map((p, i) => {
      if (p.startsWith('`') && p.endsWith('`')) {
        return (
          <code key={`c-${idx}-${i}`} className="px-1 py-0.5 bg-slate-100 rounded text-slate-800">
            {p.slice(1, -1)}
          </code>
        );
      }
      return p;
    });
  });

  return codeSplit as (string | JSX.Element)[];
}

export default function Markdown({ content, className, variant = 'light' }: MarkdownProps) {
  // Handle fenced code blocks first
  const segments = content.split(/```/g);

  const nodes: JSX.Element[] = [];
  segments.forEach((seg, i) => {
    if (i % 2 === 1) {
      // Code block
      nodes.push(
        <pre key={`pre-${i}`} className={`rounded-lg p-3 overflow-auto text-sm ${variant === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-900 text-slate-100'}`}>
          <code>{seg.trim()}</code>
        </pre>
      );
    } else {
      // Regular text - split into lines and build lists/paragraphs
      const lines = seg.split(/\r?\n/);
      let listBuffer: string[] = [];

      const flushList = (keyBase: string) => {
        if (listBuffer.length === 0) return;
        nodes.push(
          <ul key={`${keyBase}-ul`} className="list-disc pl-6 my-2 space-y-1">
            {listBuffer.map((li, idx) => (
              <li key={`${keyBase}-li-${idx}`}>{renderInline(li)}</li>
            ))}
          </ul>
        );
        listBuffer = [];
      };

      lines.forEach((line, li) => {
        const trimmed = line.trim();
        if (!trimmed) {
          flushList(`list-${i}-${li}`);
          return;
        }
        // Headings
        const hMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (hMatch) {
          flushList(`list-${i}-${li}`);
          const level = hMatch[1].length;
          const text = hMatch[2];
          const Tag = (`h${Math.min(6, level)}` as unknown) as keyof JSX.IntrinsicElements;
          nodes.push(
            <Tag key={`h-${i}-${li}`} className={`font-bold mt-3 mb-1 ${variant === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {renderInline(text)}
            </Tag>
          );
          return;
        }
        // List items - "- " or "* " or numbered "1. "
        if (/^[-*]\s+/.test(trimmed)) {
          listBuffer.push(trimmed.replace(/^[-*]\s+/, ''));
          return;
        }
        if (/^\d+\.\s+/.test(trimmed)) {
          // For simplicity, render numbered items as bullets too
          listBuffer.push(trimmed.replace(/^\d+\.\s+/, ''));
          return;
        }
        // Regular paragraph
        flushList(`list-${i}-${li}`);
        nodes.push(
          <p key={`p-${i}-${li}`} className={`mb-2 ${variant === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            {renderInline(line)}
          </p>
        );
      });

      flushList(`list-${i}-end`);
    }
  });

  return <div className={className}>{nodes}</div>;
}


