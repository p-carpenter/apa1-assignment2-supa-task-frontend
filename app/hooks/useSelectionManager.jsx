import { useState, useRef } from "react";

const useSelectionManager = (setSelectedIncidents) => {
  const containerRef = useRef(null);

  const [lastClickedIndex, setLastClickedIndex] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const handleItemClick = (e, item, index, items) => {
    e.stopPropagation();
    if (e.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const range = items.slice(start, end + 1);
      setSelectedIncidents(range);
    } else if (e.ctrlKey || e.metaKey) {
      setSelectedIncidents((prevSelected) => {
        if (prevSelected.includes(item)) {
          return prevSelected.filter((i) => i !== item);
        } else {
          return [...prevSelected, item];
        }
      });
      setLastClickedIndex(index);
    } else {
      setSelectedIncidents([item]);
      setLastClickedIndex(index);
    }
  };

  const handleItemContextMenu = (e, item, index, selectedItems) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedItems.includes(item)) {
      setSelectedIncidents([item]);
      setLastClickedIndex(index);
    }

    return {
      visible: true,
      x: e.clientX,
      y: e.clientY,
      onFile: true,
      items: selectedItems.includes(item) ? selectedItems : [item],
    };
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.shiftKey || e.ctrlKey || e.metaKey) return;

    setIsSelecting(true);
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({ x, y });
    setSelectionBox({ x, y, width: 0, height: 0 });

    setSelectedIncidents([]);
  };

  const handleMouseMove = (e, currentItems, currentView) => {
    if (!isSelecting) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const newBox = {
      x: Math.min(startPoint.x, currentX),
      y: Math.min(startPoint.y, currentY),
      width: Math.abs(currentX - startPoint.x),
      height: Math.abs(currentY - startPoint.y),
    };
    setSelectionBox(newBox);

    const newlySelected = [];

    for (let i = 0; i < currentItems.length; i++) {
      const itemType = currentView === "years" ? "folder" : "incident";
      const itemEl = document.getElementById(`${itemType}-${i}`);
      if (!itemEl) continue;

      const itemRect = itemEl.getBoundingClientRect();
      const itemBox = {
        x: itemRect.left - rect.left,
        y: itemRect.top - rect.top,
        width: itemRect.width,
        height: itemRect.height,
      };

      if (boxesIntersect(newBox, itemBox)) {
        newlySelected.push(currentItems[i]);
      }
    }

    setSelectedIncidents(newlySelected);
  };

  const handleMouseUp = (e) => {
    if (e.button !== 0) return;
    setIsSelecting(false);
  };

  const boxesIntersect = (a, b) => {
    return !(
      a.x + a.width < b.x ||
      a.x > b.x + b.width ||
      a.y + a.height < b.y ||
      a.y > b.y + b.height
    );
  };

  return {
    containerRef,
    lastClickedIndex,
    isSelecting,
    selectionBox,
    handleItemClick,
    handleItemContextMenu,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};

export default useSelectionManager;
