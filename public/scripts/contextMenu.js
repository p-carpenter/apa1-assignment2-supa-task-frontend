document.addEventListener("DOMContentLoaded", function () {
    const explorerContents = document.getElementById("window-content");
    const contextMenu = document.getElementById("context-menu");

    explorerContents.addEventListener("contextmenu", function (event) {
        event.preventDefault(); // Stop default right-click menu

        // Position context menu where user right-clicked
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;

        // Ensure it's visible
        contextMenu.classList.remove("hidden");

        // Debugging
        console.log("Context menu should appear at:", event.clientX, event.clientY);

        // Check where the user clicked
        if (event.target.closest(".casefile")) {
            // User right-clicked on an item
            console.log("Right-clicked on a case file.");
            document.getElementById("opt-delcase").style.display = "block";
            document.getElementById("opt-editcase").style.display = "block";
            document.getElementById("opt-addcase").style.display = "none";
            document.getElementById("opt-searchcase").style.display = "none";
        } else {
            // Right-clicked on empty space
            console.log("Right-clicked on empty explorer.");
            document.getElementById("opt-delcase").style.display = "none";
            document.getElementById("opt-editcase").style.display = "none";
            document.getElementById("opt-addcase").style.display = "block";
            document.getElementById("opt-searchcase").style.display = "block";
        }
    });

    // Hide menu when clicking elsewhere
    document.addEventListener("click", function () {
        contextMenu.classList.add("hidden");
    });
})
