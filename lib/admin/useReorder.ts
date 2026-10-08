"use client";

import { useRef, useState, type DragEvent } from "react";

// Native drag-and-drop reordering: the list updates live while dragging, onCommit runs once on drop.
export function useReorder<T>(items: T[], onChange: (next: T[]) => void, onCommit: (next: T[]) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  // Working copy of the order during a drag; only touched in event handlers.
  const order = useRef<T[]>([]);

  return (index: number) => ({
    draggable: true,
    "data-dragging": dragIndex === index,
    onDragStart: (event: DragEvent) => {
      event.dataTransfer.effectAllowed = "move";
      order.current = [...items];
      setDragIndex(index);
    },
    onDragOver: (event: DragEvent) => {
      if (dragIndex === null) return;
      event.preventDefault();
      if (dragIndex === index) return;
      const next = [...order.current];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      order.current = next;
      setDragIndex(index);
      onChange(next);
    },
    onDragEnd: () => {
      if (dragIndex === null) return;
      setDragIndex(null);
      onCommit(order.current);
    },
  });
}
