let method = undefined;
let contentType = undefined;
let bodyText = undefined;
let headers = {};
let res = undefined;
let headersListObj = {};
let queryListObj = {};
let url = undefined;
let tabId = undefined;

let radioButtons = undefined;
let responseBody = undefined;
let responseIframe = undefined;
let responseStatus = undefined;
let responseHeaders = undefined;

let headersContainer = undefined;
let addHeaderBtn = undefined;
let displayHeaders = undefined;
let displayQueries = undefined;
let addQueryBtn = undefined;

function collectReqHeaders() {
  // Collect headers
  addAuth();
  let headersList = headersListObj[tabId];
  headers["Access-Control-Allow-Origin"] = "*";
  headers["Access-Control-Allow-Headers"] = "*";
  headers["Access-Control-Expose-Headers"] = "*";
  headersList.forEach(({ key, value, checked }) => {
    key = key.trim();
    value = value.trim();
    if (checked && key) headers[key] = value;
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
function collectReqQuery() {
  let queryList = queryListObj[tabId];
  let queryStr = "";
  queryList.forEach(({ key, value, checked }, index) => {
    key = key.trim();
    value = value.trim();
    if (checked && key) {
      if (queryStr) queryStr += "&"; // add ampersand if not the first param
      queryStr += encodeURIComponent(key) + "=" + encodeURIComponent(value);
    }
  });
  url += queryStr ? "?" + queryStr : "";
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
  if (contentType.includes("application/json")) {
    const json = await res.json();
    body = JSON.stringify(json, null, 2);
  } else {
    body = await res.text();
  }
  document.querySelector(`#${tabId} [data-id="responseBody"]`).textContent =
    body;
}
function getRequestParams() {
  method = document.querySelector(`#${tabId} [data-id="method"]`).value;
  url = document.querySelector(`#${tabId} [data-id="url"]`).value.trim();
  contentType = document.querySelector(
    `#${tabId} [data-id="contentType"]`
  ).value;
  bodyText = document.querySelector(`#${tabId} [data-id="body"]`).value.trim();
}
async function sendRequest() {
  setParams();
  getRequestParams();
  collectReqHeaders();
  collectReqBody();
  collectReqQuery();
  console.log(bodyText);
  if (bodyText.length == 0)
    runPreview(curlPreview(url, method, headersListObj[tabId]));
  else
    runPreview(curlPreview(url, headersListObj[tabId], JSON.parse(bodyText)));
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
    document.querySelector(`#${tabId} [data-id="responseStatus"]`).textContent =
      "Error";
    document.querySelector(`#${tabId} [data-id="responseBody"]`).textContent =
      err.toString();
  }
  headers = {};
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

function updateKeyValDisplay(displayContent, List) {
  displayContent.innerHTML = "";

  List.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "flex gap-2 items-center";

    // ✅ Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.checked;
    checkbox.className = "form-checkbox accent-green-500 w-4 h-4";
    checkbox.onchange = (e) => {
      List[index].checked = e.target.checked;
    };

    const keyInput = document.createElement("input");
    keyInput.value = item.key;
    keyInput.placeholder = "Key";
    keyInput.className = "w-1/3 border rounded px-2 py-1 text-sm";
    keyInput.oninput = (e) => {
      List[index].key = e.target.value;
    };

    const valueInput = document.createElement("input");
    valueInput.value = item.value;
    valueInput.placeholder = "Value";
    valueInput.className = "w-1/3 border rounded px-2 py-1 text-sm";
    valueInput.oninput = (e) => {
      List[index].value = e.target.value;
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.className = "text-red-600 text-lg hover:scale-110 transition";
    deleteBtn.onclick = () => {
      List.splice(index, 1);
      updateKeyValDisplay(displayContent, List);
    };
    row.appendChild(checkbox);
    row.appendChild(keyInput);
    row.appendChild(valueInput);
    row.appendChild(deleteBtn);
    displayContent.appendChild(row);
  });
}
function includeHeader(e) {
  e.preventDefault();

  // Grab the last row inputs from the add section
  const allInputs = headersContainer.querySelectorAll("input");
  const key = allInputs[allInputs.length - 2].value.trim();
  const value = allInputs[allInputs.length - 1].value.trim();

  if (key === "") return; // avoid blank keys
  let headersList = headersListObj[tabId];
  headersList.push({ key, value, checked: true });
  updateKeyValDisplay(displayHeaders, headersList);

  // Clear the inputs
  allInputs[allInputs.length - 2].value = "";
  allInputs[allInputs.length - 1].value = "";
}

function includeQuery(e) {
  e.preventDefault();
  // Grab the last row inputs from the add section
  const allInputs = headersContainer.querySelectorAll("input");
  const key = allInputs[allInputs.length - 2].value.trim();
  const value = allInputs[allInputs.length - 1].value.trim();

  if (key === "") return; // avoid blank keys
  let queryList = queryListObj[tabId];
  queryList.push({ key, value, checked: true });
  updateKeyValDisplay(displayQueries, queryList);

  // Clear the inputs
  allInputs[allInputs.length - 2].value = "";
  allInputs[allInputs.length - 1].value = "";
}

function setParams() {
  radioButtons = document.getElementsByName("viewMode");
  responseBody = document.querySelector(`#${tabId} [data-id="responseBody"]`);
  responseIframe = document.querySelector(
    `#${tabId} [data-id="responseIframe"]`
  );
  responseStatus = document.querySelector(
    `#${tabId} [data-id="responseStatus"]`
  );
  responseHeaders = document.querySelector(
    `#${tabId} [data-id="responseHeaders"]`
  );

  headersContainer = document.querySelector(
    `#${tabId} [data-id="headersContainer"]`
  );
  addHeaderBtn = document.querySelector(`#${tabId} [data-id="addHeaderBtn"]`);
  displayHeaders = document.querySelector(
    `#${tabId} [data-id="displayHeaders"]`
  );
  displayQueries = document.querySelector(
    `#${tabId} [data-id="displayQueries"]`
  );
  addQueryBtn = document.querySelector(`#${tabId} [data-id="addQueryBtn"]`);
}
function handleAuthChange() {
  const value = document.querySelector(`#${tabId} [data-id="authType"]`).value;
  document.querySelector(
    `#${tabId} [data-id="basicAuthFields"]`
  ).style.display = value === "basic" ? "block" : "none";
  document.querySelector(`#${tabId} [data-id="jwtAuthFields"]`).style.display =
    value === "jwt" ? "block" : "none";
  document.querySelector(`#${tabId} [data-id="apiKeyFields"]`).style.display =
    value === "apikey" ? "block" : "none";
}

function handleJWT(jwtDiv) {
  try {
    // 1. Read user input
    const algorithm = jwtDiv.querySelector("select").value;
    const signature = jwtDiv.querySelector('input[type="text"]').value.trim();
    const payloadInput = jwtDiv.querySelector("textarea").value.trim();
    const location = jwtDiv.querySelector(
      'input[name="jwtLocation"]:checked'
    ).value;

    // 2. Parse and encode header
    const header = {
      alg: algorithm,
      typ: "JWT",
    };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));

    // 3. Parse and encode payload
    let payload;
    try {
      payload = JSON.parse(payloadInput);
    } catch (err) {
      alert("Invalid JSON payload");
      return null;
    }
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    // 4. Encode signature (use user-input as-is for demo)
    const encodedSignature = base64UrlEncode(signature);

    // 5. Construct JWT
    const jwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

    // 6. Return object for use in request
    return { loc: location, token: `Bearer ${jwt}` };
  } catch (err) {
    console.error("JWT Handling Error:", err);
    return null;
  }
}

// ✅ Helper function for base64url encoding
function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function addAuth() {
  let authObj = retrieveAuth();
  console.log("here");
  console.log(authObj);
  if (authObj == null) return;
  if (authObj.loc == "query") {
    queryListObj[tabId].push({
      key: "access_token",
      value: authObj.token,
      checked: true,
    });
  } else if (authObj.loc == "header") {
    headersListObj[tabId].push({
      key: "Authorization",
      value: authObj.token,
      checked: true,
    });
  }
}
function retrieveAuth() {
  let authType = document.querySelector(`#${tabId} [data-id="authType"]`).value;
  let authDiv = undefined;
  if (authType == "basic") {
    authDiv = document.querySelector(`#${tabId} [data-id="basicAuthFields"]`);
    // Get the inputs inside it
    const username = authDiv.querySelector('input[type="text"]').value;
    const password = authDiv.querySelector('input[type="password"]').value;
    const location = authDiv.querySelector(
      'input[name="basicLocation"]:checked'
    ).value;
    return {
      loc: `${location}`,
      token: `Basic ${base64UrlEncode(`${username}:${password}`)}`,
    };
  } else if (authType == "jwt") {
    return handleJWT(authDiv);
  } else return null;
}
function copy(textContent, copyBtn) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(textContent).then(() => {
      let copyBtnHTML = copyBtn.innerHTML;
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.innerHTML = copyBtnHTML), 1500);
    });
  }
}
function activateTab(newTabId) {
  tabId = newTabId + "Content";
  headersListObj[tabId] = [];
  queryListObj[tabId] = [];
  setParams();
  console.log(`${tabId}`);
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
  let copyResponse = document.querySelector(
    `#${tabId} [data-id="copyResponse"]`
  );
  copyResponse.addEventListener("click", () =>
    copy(responseBody.textContent, copyResponse)
  );
  document
    .querySelector(`#${tabId} [data-id="sendBtn"]`)
    .addEventListener("click", sendRequest);
  addHeaderBtn.addEventListener("click", includeHeader);
  addQueryBtn.addEventListener("click", includeQuery);

  configdevTools();
}
