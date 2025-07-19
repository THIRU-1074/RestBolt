function setResHeaders(headersObj) {
  // Set headers
  let headersFormatted = "";
  for (let key in headersObj) {
    headersFormatted += `${key}: ${headersObj[key]}\n`;
  }
  responseHeaders.textContent = headersFormatted;
}

async function handleResponse(res) {
  const headersObj = {};
  res.headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  console.log(headersObj);
  setResHeaders(headersObj);
  const contentType = res.headers.get("content-type") || "";
  const responseStatusDiv = document.querySelector(
    `#${tabId} [data-id="responseStatus"]`
  );
  responseStatusDiv.textContent = `Status: ${res.status} ${res.statusText}`;
  // Set background color based on status code
  if (res.status >= 200 && res.status < 300) {
    responseStatusDiv.style.backgroundColor = "lightgreen"; // or "green"
  } else {
    responseStatusDiv.style.backgroundColor = "lightcoral"; // or "red"
  }

  // Try to parse response as JSON, fallback to text
  let body;
  let buffer = responseObj[tabId];
  body = new TextDecoder().decode(buffer);
  document.querySelector(`#${tabId} [data-id="responseBody"]`).textContent =
    body;
}

function renderResponse(status, bodyText) {
  // Set status
  responseStatus.textContent = `Status: ${status}`;

  // Listen for radio changes
  const selectedMode = document.querySelector(
    'input[name="viewMode"]:checked'
  ).value;

  if (selectedMode === "raw") {
    responseBody.textContent = bodyText;
    responseBody.classList.remove("hidden");
    responseIframe.classList.add("hidden");
  } else {
    // Convert body to blob & object URL to load in iframe
    const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body { padding: 1rem; font-family: sans-serif; }
        button { margin: 0.5rem; padding: 0.5rem 1rem; }
      </style>
    </head>
    <body>
      ${bodyText}
    </body>
    </html>
  `;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    responseIframe.src = url;
    responseIframe.classList.remove("hidden");
    responseBody.classList.add("hidden");
  }
}
