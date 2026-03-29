import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      if (item.isDate) {
        // If it's the date pill, insert a styled text block instead of a standard mention
        // Mentions by default insert a node, but the command expects { id, label }
        props.command({ id: new Date().toLocaleDateString(), label: new Date().toLocaleDateString() });
      } else {
        props.command({ id: item.id, label: item.name });
      }
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-lg py-1 min-w-[180px] overflow-hidden flex flex-col">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            className={`text-left px-3 py-1.5 text-sm outline-none transition-colors ${
              index === selectedIndex ? 'bg-zinc-100 dark:bg-zinc-800 font-medium' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300'
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.name}
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-zinc-500 italic">No results</div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';
