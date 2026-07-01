import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold, Italic, Strikethrough, Code,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  Image as ImageIcon, Link as LinkIcon, Unlink
} from 'lucide-react';

interface BlogEditorProps {
  initialContent?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL Gambar:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL Tautan:', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border p-2 bg-muted/30 rounded-t-lg">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('bold') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('italic') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('strike') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('code') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        title="Code"
      >
        <Code size={16} />
      </button>

      <div className="w-px h-6 bg-border mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('heading', { level: 1 }) ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('heading', { level: 2 }) ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('heading', { level: 3 }) ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>

      <div className="w-px h-6 bg-border mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('bulletList') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('orderedList') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('blockquote') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        title="Blockquote"
      >
        <Quote size={16} />
      </button>

      <div className="w-px h-6 bg-border mx-1"></div>

      <button
        type="button"
        onClick={setLink}
        className={`p-1.5 rounded hover:bg-muted ${editor.isActive('link') ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
        title="Add Link"
      >
        <LinkIcon size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive('link')}
        className={`p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Remove Link"
      >
        <Unlink size={16} />
      </button>
      <button
        type="button"
        onClick={addImage}
        className="p-1.5 rounded hover:bg-muted text-muted-foreground"
        title="Add Image"
      >
        <ImageIcon size={16} />
      </button>
    </div>
  );
};

export default function BlogEditor({ initialContent = '' }: BlogEditorProps) {
  const [contentHtml, setContentHtml] = React.useState(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-4',
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      setContentHtml(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  // Ensure content update if initialContent changes after mounting
  React.useEffect(() => {
    if (editor && initialContent !== editor.getHTML() && initialContent !== '') {
      // Prevent recursive updates if user is typing
      if (!editor.isFocused) {
        editor.commands.setContent(initialContent);
        setContentHtml(initialContent);
      }
    }
  }, [initialContent, editor]);

  return (
    <div className="border border-border rounded-lg bg-background">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {/* Hidden input to ensure HTML value is submitted along with the regular Astro Form */}
      <input type="hidden" name="body_html" value={contentHtml} />
      {/* Fallback empty markdown or sync plain text if needed */}
      <input type="hidden" name="body_md" value="" />
    </div>
  );
}
