const scripts = [
    "scripts/contextMenu.js",
    "scripts/incidentPopup.js",
];

scripts.forEach(src => {
    let script = document.createElement("script");
    script.src = src;
    // script.type = "module";
    document.body.appendChild(script);
});