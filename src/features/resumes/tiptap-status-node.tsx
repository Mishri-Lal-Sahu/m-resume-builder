import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React, { useState, useRef, useEffect } from "react";

const statuses = [
  { id: "not-started", label: "Not Started", color: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200" },
  { id: "in-progress", label: "In Progress", color: "bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200" },
  { id: "needs-review", label: "Needs Review", color: "bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200" },
  { id: "done", label: "Done", color: "bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-200" },
  { id: "blocked", label: "Blocked", color: "bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-200" },
];

function StatusNodeComponent(props: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const currentStatusId = props.node.attrs.statusId || "not-started";
  const currentStatus = statuses.find(s => s.id === currentStatusId) || statuses[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as globalThis.Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <NodeViewWrapper className="inline-block relative align-middle mx-1" ref={ref}>
      <button
        contentEditable={false}
        onClick={() => setOpen(!open)}
        className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider select-none border border-transparent hover:border-black/10 dark:hover:border-white/10 ${currentStatus.color}`}
      >
        {currentStatus.label} ▾
      </button>

      {open && (
        <div 
          contentEditable={false}
          className="absolute top-full left-0 mt-1 min-w-[140px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl py-1 z-50 flex flex-col"
        >
          {statuses.map(s => (
            <button
              key={s.id}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 ${s.id === currentStatusId ? 'font-bold' : ''}`}
              onClick={() => {
                props.updateAttributes({ statusId: s.id });
                setOpen(false);
              }}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${s.color.split(' ')[0]}`} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </NodeViewWrapper>
  );
}

export const StatusPillExtension = Node.create({
  name: "statusPill",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      statusId: {
        default: "not-started",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="status-pill"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'status-pill' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(StatusNodeComponent);
  },
});
