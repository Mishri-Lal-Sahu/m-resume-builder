import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { useEffect } from "react";
import { FontSize } from "@/features/resumes/tiptap-extensions";

type SubEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onFocus?: (editor: any) => void;
};

export function DocsSubEditor({ content, onChange, placeholder, onFocus }: SubEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      TextAlign.configure({ types: ["paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontSize,
    ],
    content,
    editorProps: {
      attributes: {
        class: "outline-none text-zinc-400 font-sans tracking-wide",
        spellcheck: "false",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    onFocus({ editor }) {
      if (onFocus) onFocus(editor);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content && !editor.isFocused) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="relative group w-full">
      {/* Mini formatting toolbar smoothly revealing on hover */}
      {editor && editor.isFocused && (
        <div className="absolute right-0 top-0 bg-zinc-900 text-white rounded shadow px-2 py-1 flex gap-1 z-50 text-xs">
          <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run() }} className={`px-1.5 hover:bg-zinc-700 rounded ${editor.isActive('bold') ? 'bg-zinc-700' : ''}`}>B</button>
          <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }} className={`px-1.5 hover:bg-zinc-700 rounded ${editor.isActive('italic') ? 'bg-zinc-700' : ''}`}>I</button>
          <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }} className={`px-1.5 hover:bg-zinc-700 rounded ${editor.isActive('underline') ? 'bg-zinc-700' : ''}`}>U</button>
          <div className="w-px bg-zinc-700 mx-1"></div>
          <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run() }} className="px-1.5 hover:bg-zinc-700 rounded">Left</button>
          <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run() }} className="px-1.5 hover:bg-zinc-700 rounded">Center</button>
          <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run() }} className="px-1.5 hover:bg-zinc-700 rounded">Right</button>
        </div>
      )}
      <EditorContent editor={editor} className="w-full relative z-10" />
      {editor && editor.isEmpty && !editor.isFocused && (
        <div className="absolute inset-0 pointer-events-none text-zinc-300 italic">{placeholder}</div>
      )}
    </div>
  );
}
