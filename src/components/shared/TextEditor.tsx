/**
 * 📝 Simple Text Editor Component
 *
 * Basic rich text editor with:
 * - Bold, italic, underline formatting
 * - Bullet lists and numbered lists
 * - Responsive design
 * - Returns HTML string
 * - Accepts default HTML value
 *
 * Usage:
 * ```tsx
 * const [content, setContent] = useState('<p>Hello <strong>world</strong>!</p>');
 *
 * <TextEditor
 *   value={content}
 *   onChange={setContent}
 *   placeholder="Start writing..."
 *   className="min-h-[200px]"
 * />
 * ```
 */

'use client';

import { Bold, Italic, List, ListOrdered, Underline } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TextEditor({
  value = '',
  onChange,
  placeholder = 'Start writing...',
  className,
  disabled = false,
}: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // Initialize editor with default value
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Update active states based on current selection
  const updateActiveStates = () => {
    if (!editorRef.current) return;

    setIsActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    });
  };

  // Handle content changes
  const handleInput = () => {
    if (!editorRef.current) return;

    let html = editorRef.current.innerHTML;
    // Strip all inline styles
    html = html.replace(/ style="[^"]*"/g, '');

    onChange?.(html);
    updateActiveStates();
  };

  // Execute formatting commands
  const executeCommand = (command: string, value?: string) => {
    if (disabled) return;

    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveStates();
    handleInput();
  };

  // Handle selection change
  const handleSelectionChange = () => {
    updateActiveStates();
  };

  // Add event listeners for selection changes
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-white', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
        <Button
          type="button"
          variant={isActive.bold ? 'default' : 'ghost'}
          size="sm"
          onClick={() => executeCommand('bold')}
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={isActive.italic ? 'default' : 'ghost'}
          size="sm"
          onClick={() => executeCommand('italic')}
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={isActive.underline ? 'default' : 'ghost'}
          size="sm"
          onClick={() => executeCommand('underline')}
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('insertUnorderedList')}
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('insertOrderedList')}
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onBlur={handleInput}
        onKeyUp={updateActiveStates}
        onMouseUp={updateActiveStates}
        className={cn(
          'min-h-[120px] p-4 focus:outline-none prose prose-sm max-w-none',
          'prose-headings:font-semibold prose-headings:text-gray-900',
          'prose-p:text-gray-700 prose-p:leading-relaxed',
          'prose-strong:font-semibold prose-strong:text-gray-900',
          'prose-em:text-gray-700',
          'prose-ul:text-gray-700 prose-ol:text-gray-700',
          'prose-li:text-gray-700',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
        )}
        style={{
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: '1.6',
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Custom styles for placeholder */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
