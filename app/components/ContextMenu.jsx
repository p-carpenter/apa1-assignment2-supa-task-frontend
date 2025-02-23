"use client";

export default function ContextMenu({ x, y, onFile }) {
  return (
    <div className="context-menu" style={{ top: `${y}px`, left: `${x}px` }}>
      {onFile ? (
        <>
          <p>Delete</p>
          <p>Edit</p>
        </>
      ) : (
        <>
          <p>Add new</p>
          <p>Search cases</p>
        </>
      )}
    </div>
  );
}
