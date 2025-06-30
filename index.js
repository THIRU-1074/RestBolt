let method = undefined;
let contentType = undefined;
let bodyText = undefined;
let headers = {};
let res = undefined;
let headersList = [];

const radioButtons = document.getElementsByName("viewMode");
const responseBody = document.getElementById("responseBody");
const responseIframe = document.getElementById("responseIframe");
const responseStatus = document.getElementById("responseStatus");
const responseHeaders = document.getElementById("responseHeaders");

const headersContainer = document.getElementById("headersContainer");
const addHeaderBtn = document.getElementById("addHeaderBtn");
const displayHeaders = document.getElementById("displayHeaders");
function collectReqHeaders() {
  // Collect headers
  headers["Access-Control-Allow-Origin"] = "*";
  headers["Access-Control-Allow-Headers"] = "*";
  headers["Access-Control-Expose-Headers"] = "*";
  headersList.forEach((pair) => {
    const key = pair.key.trim();
    const value = pair.value.trim();
    if (key) headers[key] = value;
  });

  // Set Content-Type header (override if user hasn't already)
  if (!headers["Content-Type"] && method !== "GET" && method !== "DELETE") {
    headers["Content-Type"] = contentType;
  }
}
function collectReqBody() {
  // Include body if necessary
  if (method !== "GET" && method !== "DELETE" && bodyText) {
    if (headers["Content-Type"] === "application/json") {
      try {
        options.body = JSON.stringify(JSON.parse(bodyText));
      } catch (err) {
        alert("Invalid JSON in request body!");
        return;
      }
    } else {
      options.body = bodyText;
    }
  }
}
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
  document.getElementById(
    "responseStatus"
  ).textContent = `Status: ${res.status} ${res.statusText}`;
  // Try to parse response as JSON, fallback to text
  let body;
  if (contentType.includes("application/json")) {
    const json = await res.json();
    body = JSON.stringify(json, null, 2);
  } else {
    body = await res.text();
  }
  document.getElementById("responseBody").textContent = body;
}
function getRequestParams() {
  method = document.getElementById("method").value;
  url = document.getElementById("url").value.trim();
  contentType = document.getElementById("contentType").value;
  bodyText = document.getElementById("body").value.trim();
}
async function sendRequest() {
  getRequestParams();
  collectReqHeaders();
  collectReqBody();
  // Prepare fetch options
  const options = {
    method,
    headers,
  };
  console.log(method);
  try {
    res = await fetch(url, options);
    handleResponse(res);
  } catch (err) {
    document.getElementById("responseStatus").textContent = "Error";
    document.getElementById("responseBody").textContent = err.toString();
  }
}
document.getElementById("sendBtn").addEventListener("click", sendRequest);

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
    const blob = new Blob([bodyText], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    responseIframe.src = url;
    responseIframe.classList.remove("hidden");
    responseBody.classList.add("hidden");
  }
}

// Optional: Listen for mode toggle (instant switch without resending)
radioButtons.forEach((r) => {
  r.addEventListener("change", () => {
    // Re-render current data if needed
    renderResponse(
      responseStatus.textContent.replace("Status: ", ""),
      responseBody.textContent
    );
  });
});

function updateHeaderDisplay() {
  displayHeaders.innerHTML = "";

  headersList.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "flex gap-2 items-center";

    const keyInput = document.createElement("input");
    keyInput.value = item.key;
    keyInput.placeholder = "Key";
    keyInput.className = "w-1/3 border rounded px-2 py-1 text-sm";
    keyInput.oninput = (e) => {
      headersList[index].key = e.target.value;
    };

    const valueInput = document.createElement("input");
    valueInput.value = item.value;
    valueInput.placeholder = "Value";
    valueInput.className = "w-1/3 border rounded px-2 py-1 text-sm";
    valueInput.oninput = (e) => {
      headersList[index].value = e.target.value;
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.className = "text-red-600 text-lg hover:scale-110 transition";
    deleteBtn.onclick = () => {
      headersList.splice(index, 1);
      updateHeaderDisplay();
    };

    row.appendChild(keyInput);
    row.appendChild(valueInput);
    row.appendChild(deleteBtn);
    displayHeaders.appendChild(row);
  });
}
function includeHeader(e) {
  e.preventDefault();

  // Grab the last row inputs from the add section
  const allInputs = headersContainer.querySelectorAll("input");
  const key = allInputs[allInputs.length - 2].value.trim();
  const value = allInputs[allInputs.length - 1].value.trim();

  if (key === "") return; // avoid blank keys

  headersList.push({ key, value });
  updateHeaderDisplay();

  // Clear the inputs
  allInputs[allInputs.length - 2].value = "";
  allInputs[allInputs.length - 1].value = "";
}
addHeaderBtn.addEventListener("click", includeHeader);
