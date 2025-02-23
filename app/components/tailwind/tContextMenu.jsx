"use client";

function ContextMenu({ x, y, onFile }) {
  return (
    <div className="absolute bg-win95gray border border-win95border w-36 p-2 text-sm" style={{ top: `${y}px`, left: `${x}px` }}>
      {onFile ? (
        <>
          <p className="hover:bg-win95blue hover:text-white p-1 cursor-pointer">Delete</p>
          <p className="hover:bg-win95blue hover:text-white p-1 cursor-pointer">Edit</p>
        </>
      ) : (
        <>
          <p className="hover:bg-win95blue hover:text-white p-1 cursor-pointer">Add new</p>
          <p className="hover:bg-win95blue hover:text-white p-1 cursor-pointer">Search cases</p>
        </>
      )}
    </div>
  );
}
