'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { common, createLowlight } from 'lowlight';
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  Quote, Code, Image as ImageIcon, Video, Link as LinkIcon,
  Undo, Redo, Heading1, Heading2, Code2
} from 'lucide-react';
import { useCallback } from 'react';
import { uploadImage } from '@/lib/editor-utils';

const lowlight = createLowlight(common);

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addImage = useCallback(() => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addYoutubeVideo = useCallback(() => {
    const url = window.prompt('Enter YouTube URL');
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap gap-2 p-2 mb-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 sticky top-0 z-10">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-white/20 ${editor.isActive('bold') ? 'bg-white/30' : ''}`}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-white/20 ${editor.isActive('italic') ? 'bg-white/30' : ''}`}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-white/20 ${editor.isActive('underline') ? 'bg-white/30' : ''}`}
        title="Underline"
      >
        <UnderlineIcon size={18} />
      </button>
      <div className="w-px h-6 bg-white/20 self-center mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-white/20 ${editor.isActive('heading', { level: 1 }) ? 'bg-white/30' : ''}`}
        title="H1"
      >
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-white/20 ${editor.isActive('heading', { level: 2 }) ? 'bg-white/30' : ''}`}
        title="H2"
      >
        <Heading2 size={18} />
      </button>
      <div className="w-px h-6 bg-white/20 self-center mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-white/20 ${editor.isActive('bulletList') ? 'bg-white/30' : ''}`}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-white/20 ${editor.isActive('orderedList') ? 'bg-white/30' : ''}`}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-white/20 ${editor.isActive('blockquote') ? 'bg-white/30' : ''}`}
        title="Quote"
      >
        <Quote size={18} />
      </button>
      <div className="w-px h-6 bg-white/20 self-center mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-2 rounded hover:bg-white/20 ${editor.isActive('code') ? 'bg-white/30' : ''}`}
        title="Inline Code"
      >
        <Code size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-white/20 ${editor.isActive('codeBlock') ? 'bg-white/30' : ''}`}
        title="Code Block"
      >
        <Code2 size={18} />
      </button>
      <button
        onClick={setLink}
        className={`p-2 rounded hover:bg-white/20 ${editor.isActive('link') ? 'bg-white/30' : ''}`}
        title="Add Link"
      >
        <LinkIcon size={18} />
      </button>
      <div className="w-px h-6 bg-white/20 self-center mx-1" />
      <button onClick={addImage} className="p-2 rounded hover:bg-white/20" title="Add Image">
        <ImageIcon size={18} />
      </button>
      <button onClick={addYoutubeVideo} className="p-2 rounded hover:bg-white/20" title="Add Video">
        <Video size={18} />
      </button>
      <div className="flex-1" />
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-white/20 disabled:opacity-30"
        title="Undo"
      >
        <Undo size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 rounded hover:bg-white/20 disabled:opacity-30"
        title="Redo"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

export default function BlogEditor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl border border-white/20 max-w-full h-auto',
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'rounded-xl border border-white/20 max-w-full h-auto aspect-video',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder: 'Write your story...',
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4 bg-white/5 rounded-xl border border-white/10',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            uploadImage(file).then((res: any) => {
              const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}${res.url}`;
              view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: url })));
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            uploadImage(file).then((res: any) => {
              const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}${res.url}`;
              view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: url })));
            });
            return true;
          }
        }
        return false;
      },
    },
  });

  return (
    <div className="w-full">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
