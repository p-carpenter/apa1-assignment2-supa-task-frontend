import React from "react";

const AddressBar = ({
  currentPath,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  return (
    <div className="path-display">
      <p>Address</p>
      <div className="explorer-path flex-1 flex items-center">
        <p className="whitespace-nowrap">{currentPath}</p>
        <input
          type="text"
          className="flex-1 outline-none border-none bg-transparent"
          placeholder="Search..."
          value={searchQuery}
          onChange={onSearchChange}
          onKeyDown={(e) => e.key === "Enter" && onSearchSubmit(e)}
        />
      </div>
    </div>
  );
};

export default AddressBar;
