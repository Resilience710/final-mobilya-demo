'use client';

import { useRef, type MouseEvent, type ReactNode } from 'react';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
}

type WrapMode = {
  prefix: string;
  suffix: string;
  placeholder: string;
};

export default function RichTextEditor({
  label,
  value,
  onChange,
  rows = 8,
  placeholder,
  hint,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  const rememberSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    selectionRef.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
  };

  const focusRange = (start: number, end: number) => {
    selectionRef.current = { start, end };
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start, end);
    });
  };

  const applyWrap = ({ prefix, suffix, placeholder: fallback }: WrapMode) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const isFocused = typeof document !== 'undefined' && document.activeElement === textarea;
    const start = isFocused ? textarea.selectionStart : selectionRef.current.start;
    const end = isFocused ? textarea.selectionEnd : selectionRef.current.end;
    const selectedText = value.slice(start, end);
    const content = selectedText || fallback;
    const nextValue = `${value.slice(0, start)}${prefix}${content}${suffix}${value.slice(end)}`;
    onChange(nextValue);

    if (selectedText) {
      focusRange(start + prefix.length, start + prefix.length + selectedText.length);
      return;
    }

    focusRange(start + prefix.length, start + prefix.length + content.length);
  };

  const applyLinePrefix = (ordered = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const isFocused = typeof document !== 'undefined' && document.activeElement === textarea;
    const start = isFocused ? textarea.selectionStart : selectionRef.current.start;
    const end = isFocused ? textarea.selectionEnd : selectionRef.current.end;
    const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const lineEndIndex = value.indexOf('\n', end);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const selectedBlock = value.slice(lineStart, lineEnd);
    const lines = selectedBlock.split('\n');

    const listPattern = ordered ? /^\d+\.\s+/ : /^-\s+/;
    const allPrefixed = lines.every((line) => !line.trim() || listPattern.test(line));

    const transformed = lines.map((line, index) => {
      if (!line.trim()) return line;
      if (allPrefixed) {
        return line.replace(listPattern, '');
      }
      return ordered ? `${index + 1}. ${line}` : `- ${line}`;
    });

    const nextBlock = transformed.join('\n');
    const nextValue = `${value.slice(0, lineStart)}${nextBlock}${value.slice(lineEnd)}`;
    onChange(nextValue);
    focusRange(lineStart, lineStart + nextBlock.length);
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-charcoal">{label}</label>
      {hint ? <p className="mb-2 text-xs text-brown/45">{hint}</p> : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-[#f5f7fb] px-3 py-2">
          <ToolbarButton
            label="Kalın"
            onMouseDown={rememberSelection}
            onClick={() => applyWrap({ prefix: '**', suffix: '**', placeholder: 'Kalın metin' })}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="İtalik"
            onMouseDown={rememberSelection}
            onClick={() => applyWrap({ prefix: '*', suffix: '*', placeholder: 'İtalik metin' })}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Altı çizili"
            onMouseDown={rememberSelection}
            onClick={() => applyWrap({ prefix: '++', suffix: '++', placeholder: 'Altı çizili metin' })}
          >
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-gray-200" />
          <ToolbarButton label="Madde listesi" onMouseDown={rememberSelection} onClick={() => applyLinePrefix(false)}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Numaralı liste" onMouseDown={rememberSelection} onClick={() => applyLinePrefix(true)}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={rememberSelection}
          onSelect={rememberSelection}
          onKeyUp={rememberSelection}
          onMouseUp={rememberSelection}
          rows={rows}
          placeholder={placeholder}
          className="w-full resize-y border-0 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  onMouseDown,
  onClick,
  children,
}: {
  label: string;
  onMouseDown?: () => void;
  onClick: () => void;
  children: ReactNode;
}) {
  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    onMouseDown?.();
    event.preventDefault();
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-charcoal/80 transition-colors hover:bg-white hover:text-charcoal"
    >
      {children}
    </button>
  );
}
