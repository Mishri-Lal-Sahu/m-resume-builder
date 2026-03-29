import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React, { useRef, useState, useEffect } from "react";

const COLORS = ["#000000", "#ef4444", "#3b82f6", "#10b981", "#f59e0b"];

function BoardNodeComponent(props: any) {
  const { node, updateAttributes } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(!node.attrs.src);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState(COLORS[0]);

  useEffect(() => {
    if (isEditing && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = strokeColor;
        
        // If there's an existing image, draw it onto the canvas
        if (node.attrs.src) {
           const img = new Image();
           img.onload = () => ctx.drawImage(img, 0, 0);
           img.src = node.attrs.src;
        }
      }
    }
  }, [isEditing, strokeColor, node.attrs.src]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let clientX, clientY;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      clientX = e.touches[0].clientX - rect.left;
      clientY = e.touches[0].clientY - rect.top;
    } else {
      clientX = e.nativeEvent.offsetX;
      clientY = e.nativeEvent.offsetY;
    }
    
    ctx.beginPath();
    ctx.moveTo(clientX, clientY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX, clientY;
    if ("touches" in e) {
      const rect = canvas.getBoundingClientRect();
      clientX = e.touches[0].clientX - rect.left;
      clientY = e.touches[0].clientY - rect.top;
    } else {
      clientX = e.nativeEvent.offsetX;
      clientY = e.nativeEvent.offsetY;
    }

    ctx.lineTo(clientX, clientY);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveBoard = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      updateAttributes({ src: canvas.toDataURL("image/png") });
      setIsEditing(false);
    }
  };

  return (
    <NodeViewWrapper className="my-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm relative group overflow-hidden">
      {!isEditing && props.editor.isEditable && (
        <button 
          onClick={() => setIsEditing(true)} 
          className="absolute top-2 right-2 p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
      )}

      {isEditing ? (
        <div className="flex flex-col p-2 bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex gap-2 items-center">
              <span className="text-xs font-bold text-zinc-500 uppercase">Drawing Canvas</span>
              <div className="h-4 w-px bg-zinc-300 mx-1" />
              {COLORS.map(c => (
                <button 
                  key={c} 
                  onClick={() => setStrokeColor(c)}
                  className={`w-4 h-4 rounded-full border-2 transition-transform ${strokeColor === c ? 'border-zinc-800 scale-125' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={clearCanvas} className="px-3 py-1 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-600 font-bold">Clear All</button>
              <button onClick={saveBoard} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-bold">Done</button>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={750}
            height={400}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-crosshair touch-none shadow-inner"
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onMouseDown={startDrawing as any}
            onMouseMove={draw as any}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      ) : (
        <div className="w-full bg-zinc-50 dark:bg-zinc-950 py-4 flex justify-center min-h-[100px]">
          {node.attrs.src ? (
             <img src={node.attrs.src} alt="Drawing Canvas" className="max-w-full rounded shadow-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" />
          ) : (
             <span className="text-zinc-400 italic font-medium my-auto">Empty Drawing Canvas</span>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}

export const BoardExtension = Node.create({
  name: "drawingBoard",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="drawing-board"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    if (HTMLAttributes.src) {
      return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'drawing-board' }), ['img', { src: HTMLAttributes.src }]];
    }
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'drawing-board' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BoardNodeComponent);
  },
});
