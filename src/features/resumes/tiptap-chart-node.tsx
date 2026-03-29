import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const defaultData = [
  { name: 'Q1', revenue: 4000, profit: 2400 },
  { name: 'Q2', revenue: 3000, profit: 1398 },
  { name: 'Q3', revenue: 2000, profit: 9800 },
  { name: 'Q4', revenue: 2780, profit: 3908 },
];

function ChartNodeComponent(props: any) {
  const { node, updateAttributes } = props;
  const [isEditing, setIsEditing] = useState(!node.attrs.data);
  const [rawData, setRawData] = useState(node.attrs.data || JSON.stringify(defaultData, null, 2));

  const safeData = () => {
    try { return JSON.parse(node.attrs.data || JSON.stringify(defaultData)); } 
    catch(e) { return defaultData; }
  };

  const currentData = safeData();

  const handleSave = () => {
    try {
      JSON.parse(rawData);
      updateAttributes({ data: rawData });
      setIsEditing(false);
    } catch (e) {
      alert("Invalid JSON data format.");
    }
  };

  return (
    <NodeViewWrapper className="my-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm relative group" contentEditable={false}>
      
      {/* Edit Button overlay */}
      {!isEditing && props.editor.isEditable && (
        <button 
          onClick={() => setIsEditing(true)} 
          className="absolute top-2 right-2 p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
      )}

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold text-zinc-500 uppercase">Edit Chart Data (JSON)</div>
          <textarea 
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            className="w-full h-32 p-2 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded outline-none focus:border-blue-500 text-black placeholder:text-zinc-500"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded font-medium">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">Save Chart</button>
          </div>
        </div>
      ) : (
        <div className="h-64 w-full cursor-default select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey={Object.keys(currentData[0] || {})[1] || "revenue"} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey={Object.keys(currentData[0] || {})[2] || "profit"} fill="#93c5fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </NodeViewWrapper>
  );
}

export const ChartExtension = Node.create({
  name: "interactiveChart",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      data: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="interactive-chart"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'interactive-chart' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartNodeComponent);
  },
});
