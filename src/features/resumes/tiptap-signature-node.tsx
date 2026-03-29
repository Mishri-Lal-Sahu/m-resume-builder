import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React, { useRef, useState, useEffect } from "react";

function SignatureNodeComponent(props: any) {
  const { node, updateAttributes } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(!node.attrs.src);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas context
  useEffect(() => {
    if (isEditing && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000000";
      }
    }
  }, [isEditing]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.nativeEvent.offsetX;
      clientY = e.nativeEvent.offsetY;
      ctx.beginPath();
      ctx.moveTo(clientX, clientY);
      return;
    }
    
    // For touch events
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
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

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      updateAttributes({ src: dataUrl });
      setIsEditing(false);
    }
  };

  return (
    <NodeViewWrapper className="inline-block relative m-2 border-b-2 border-dotted border-zinc-400 min-w-[200px] min-h-[60px] align-bottom text-center">
      {isEditing ? (
        <div contentEditable={false} className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-700 rounded-lg select-none z-50">
          <div className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">Draw Signature</div>
          <canvas
            ref={canvasRef}
            width={300}
            height={100}
            className="border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-950 cursor-crosshair touch-none"
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onMouseDown={startDrawing as any}
            onMouseMove={draw as any}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={clearCanvas} className="px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600">Clear</button>
            <button onClick={saveSignature} className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">Save</button>
          </div>
        </div>
      ) : null}

      {node.attrs.src ? (
        <img 
          src={node.attrs.src} 
          alt="E-Signature" 
          className="h-[60px] object-contain cursor-pointer" 
          onClick={() => { if(props.editor.isEditable) setIsEditing(true); }}
        />
      ) : (
        <span className="text-zinc-300 italic text-sm">(Signature block)</span>
      )}
    </NodeViewWrapper>
  );
}

export const SignatureExtension = Node.create({
  name: "signatureBlock",
  group: "inline",
  inline: true,
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
        tag: 'span[data-type="signature"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    if (HTMLAttributes.src) {
      return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'signature' }), ['img', { src: HTMLAttributes.src }]];
    }
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'signature' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SignatureNodeComponent);
  },
});
