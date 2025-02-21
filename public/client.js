let incidentData = [];

const getData = async () => {
  const windowContainer = document.getElementById("window-content");
  // windowContainer.textContent = "Loading...";

  try {
    const response = await fetch(`/api/technology-failures`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    incidentData = data;

    data.forEach((entry, index) => {
      windowContainer.insertAdjacentHTML('beforeend',`<div class="case-container" data-index="${index}">
          <div class="casefile">
            <img src="assets/icons/computer.png">
            <p>${entry.name}</p>
          </div>
        </div>`)
    })

  } catch (error) {
    windowContainer.textContent = `Error: ${error.message}`;
  }
};

const postData = async () => {
  const resultElement = document.getElementById("result");
  windowContainer.textContent = "Loading...";

  try {
    const response = await fetch(`/api/new_message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "If you can see this POST is working :)" }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    windowContainer.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  } catch (error) {
    windowContainer.textContent = `Error: ${error.message}`;
  }
};

// document
//   .getElementById("callFunction")
//   .addEventListener("click", getMessages);

  document.addEventListener("DOMContentLoaded", getData)
// To begin try adding another button to use the postMessage function
