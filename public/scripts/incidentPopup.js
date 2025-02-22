document.addEventListener("DOMContentLoaded", function () {
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

                document.getElementById('morris-worm').style.zIndex = '200'
                // document.getElementById('morris-worm').style.position = 'absolute'
                document.getElementById('morris-worm').classList.remove('hidden')
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
