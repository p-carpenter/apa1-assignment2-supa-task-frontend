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

document.getElementById('window-content').addEventListener("dblclick", function (event) {
    const casefile = event.target.closest(".case-container");

    if (casefile) {
        const index = casefile.getAttribute("data-index");
        const incident = incidentData[index]; // Retrieve the corresponding data entry

        if (incident) {
            document.getElementById("incident-title").textContent = incident.name;
            document.getElementById("incident-date").textContent = `Date: ${incident.incident_date}`;
            document.getElementById("incident-description").textContent = `Description: ${incident.description}`;
            document.getElementById("incident-category").textContent = `Category: ${incident.category}`;
            document.getElementById("incident-severity").textContent = `Severity: ${incident.severity}`;
            document.getElementById("incident-cause").textContent = `Cause: ${incident.cause}`;
            document.getElementById("incident-consequences").textContent = `Consequences: ${incident.consequences}`;
            document.getElementById("incident-resolution-time").textContent = `Time to Resolve: ${incident.time_to_resolve}`;

            const incidentWindow = document.getElementById('incident-details-window');
            incidentWindow.classList.remove('hidden');
            incidentWindow.style.display = 'flex';
        }
    }
});

// Close button functionality
document.getElementById('popup-close').addEventListener('click', function () {
    const incidentWindow = document.getElementById('incident-details-window');
    incidentWindow.classList.add('hidden');
    incidentWindow.style.display = 'none';
});

})
