"use client";

export default function ContextMenu({
  visible,
  x,
  y,
  onFile,
  incidents, // array of selected incidents if onFile=true
  closeContextMenu,
  setShowAddNew,
  setShowUpdate,
  onDeleteIncidents,
}) {
  if (!visible) return null;

  const numSelected = incidents ? incidents.length : 0;

  const handleAddNew = () => {
    setShowAddNew(true);
    closeContextMenu();
  };

  const handleEdit = () => {
    // Typically only relevant if numSelected === 1
    setShowUpdate(true);
    closeContextMenu();
  };

  const handleDelete = () => {
    onDeleteIncidents(); // calls parent's bulk-delete logic
    // We close menu inside the parent’s function or here:
    closeContextMenu();
  };

  return (
    <div
      className="context-menu"
      style={{ position: 'fixed', top: `${y}px`, left: `${x}px` }}
      onClick={(e) => e.stopPropagation()} // so clicking inside menu won't close it
    >
      {onFile ? (
        <>
          <p onClick={handleDelete}>
            {numSelected > 1
              ? `Delete (${numSelected} items)`
              : "Delete"}
          </p>
          <p onClick={handleEdit}>Edit</p>
          <div className="separator" />
          <p>Sort</p>
        </>
      ) : (
        <>
          <p onClick={handleAddNew}>Add new</p>
          <p>Sort</p>
        </>
      )}
    </div>
  );
}
