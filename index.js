let method = undefined;
let contentType = undefined;
let bodyText = undefined;
let headers = {};
let res = undefined;
let headersListObj = {};
let queryListObj = {};
let responseObj = {};
let url = undefined;
let tabId = undefined;
let binaryReqBodyObj = undefined;
let binaryBodyContent = undefined;

let radioButtons = undefined;
let responseBody = undefined;
let responseIframe = undefined;
let responseStatus = undefined;
let responseHeaders = undefined;
let responseHeadersObj = {};

let headersContainer = undefined;
let addHeaderBtn = undefined;
let displayHeaders = undefined;
let displayQueries = undefined;
let addQueryBtn = undefined;
let toggleButton = undefined;
let keyValueMode = undefined;
let bulkEditBox = undefined;

let bulkEditActive = undefined;

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
function capitalizeHeader(header) {
  let result = "";
  let capitalizeNext = true;

  for (let ch of header) {
    if (ch === "-") {
      result += ch;
      capitalizeNext = true;
    } else {
      result += capitalizeNext ? ch.toUpperCase() : ch.toLowerCase();
      capitalizeNext = false;
    }
  }

  return result;
}
function includeHeader(e) {
  e.preventDefault();

  // Grab the last row inputs from the add section
  const allInputs = headersContainer.querySelectorAll("input");
  const key = allInputs[allInputs.length - 2].value.trim();
  const value = allInputs[allInputs.length - 1].value.trim();

  if (key === "") return; // avoid blank keys
  let headersList = headersListObj[tabId];
  const exists = headersList.some((header) => header.key === key);

  if (!exists) {
    headersList.push({ key, value, checked: true });
  }
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
  const exists = queryList.some((header) => header.key === key);

  if (!exists) {
    queryList.push({ key, value, checked: true });
  }
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
  toggleButton = document.querySelector(`#${tabId} [data-id="toggleEditMode"]`);
  keyValueMode = document.querySelector(`#${tabId} [data-id="keyValueMode"]`);
  bulkEditBox = document.querySelector(`#${tabId} [data-id="bulkEditBox"]`);
}

// ✅ Helper function for base64url encoding
function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function copy(textContent, copyBtn) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(textContent).then(() => {
      let copyBtnHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = "Copied!";

      setTimeout(() => {
        copyBtn.innerHTML = copyBtnHTML;
        console.log(copyBtnHTML);
      }, 1500);
    });
  }
}

// Function to parse bulk edit and return array of objects
function parseAndBulkEdit(isAddHeader) {
  const lines = bulkEditBox.value.split("\n");
  let keyValues = undefined;
  if (isAddHeader) keyValues = headersListObj[tabId];
  else keyValues = queryListObj[tabId];
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    const disabled = line.startsWith("//");
    const cleanLine = disabled ? line.slice(2).trim() : line;
    console.log(cleanLine);
    const [key, ...rest] = cleanLine.split(":");
    const value = rest.join(":").trim();
    if (key && value) {
      const obj = {
        key: key.trim(),
        value: value.trim(),
        checked: !disabled,
      };
      const exists = keyValues.some(
        (item) =>
          item.key === obj.key &&
          item.value === obj.value &&
          item.checked === obj.checked
      );
      if (!exists) keyValues.push(obj);
    }
  }
  console.log(keyValues);
  if (isAddHeader) updateKeyValDisplay(displayHeaders, keyValues);
  else updateKeyValDisplay(displayQueries, keyValues);
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
  document
    .querySelector(`#${tabId} [data-id="binaryUploadForm"]`)
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const fileInput = document.querySelector(
        `#${tabId} [data-id="binaryFileInput"]`
      );
      const file = fileInput.files[0];

      if (!file) {
        alert("Please select a binary file.");
        return;
      }
      const binaryReqBody = document.querySelector(
        `#${tabId} [data-id="binaryReqBody"]`
      );
      const toggle = binaryReqBody.querySelector(` [data-id="modeSwitch"]`);
      // Read binary file and convert to Base64 string

      if (toggle.checked) binaryBodyContent = await fileToBase64(file);
      else binaryBodyContent = await file.arrayBuffer();

      // Example: Add to request body
      binaryReqBodyObj = {
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      };

      console.log("Request Body:", binaryReqBodyObj);
    });
  bulkEditActive = false;
  toggleButton.addEventListener("click", () => {
    bulkEditActive = !bulkEditActive;
    const indicator = document.querySelector(
      `#${tabId} [data-id="editModeIndicator"]`
    );
    if (bulkEditActive) {
      toggleButton.textContent = "Switch to Key-Value Edit";
      keyValueMode.classList.add("hidden");
      bulkEditBox.classList.remove("hidden");
      addHeaderBtn.addEventListener("click", includeHeader);
      addQueryBtn.addEventListener("click", includeQuery);
      indicator.textContent = "Bulk Key-Value editor";
    } else {
      toggleButton.textContent = "Switch to Bulk Edit";
      keyValueMode.classList.remove("hidden");
      bulkEditBox.classList.add("hidden");
      addHeaderBtn.addEventListener("click", () => parseAndBulkEdit(true));
      addQueryBtn.addEventListener("click", () => parseAndBulkEdit(false));
      indicator.textContent = "Key-Value Adder";
    }
  });
  const binaryReqBody = document.querySelector(
    `#${tabId} [data-id="binaryReqBody"]`
  );
  const toggle = binaryReqBody.querySelector(` [data-id="modeSwitch"]`);
  const label = binaryReqBody.querySelector(` [data-id="toggleLabel"]`);
  const knob = binaryReqBody.querySelector(` [data-id="switchKnob"]`);
  const track = binaryReqBody.querySelector(` [data-id="switchTrack"]`);
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      knob.style.transform = "translateX(20px)";
      track.classList.remove("bg-blue-500");
      track.classList.add("bg-green-500");
      label.textContent = "Base64 Encode";
    } else {
      knob.style.transform = "translateX(0px)";
      track.classList.remove("bg-green-500");
      track.classList.add("bg-blue-500");
      label.textContent = "Raw Binary";
    }
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
function handleBodyTypeChange() {
  const value = document.querySelector(
    `#${tabId} [data-id="contentType"]`
  ).value;
  switch (value) {
    case "application/json": {
      document.querySelector(`#${tabId} [data-id="body"]`).style.display =
        "block";
      document.querySelector(
        `#${tabId} [data-id="binaryReqBody"]`
      ).style.display = "none";
      break;
    }
    case "text/plain": {
      document.querySelector(`#${tabId} [data-id="body"]`).style.display =
        "block";
      document.querySelector(
        `#${tabId} [data-id="binaryReqBody"]`
      ).style.display = "none";
      break;
    }
    case "application/x-www-form-urlencoded": {
      document.querySelector(`#${tabId} [data-id="body"]`).style.display =
        "block";
      document.querySelector(
        `#${tabId} [data-id="binaryReqBody"]`
      ).style.display = "none";
      break;
    }
    case "multipart/form-data": {
      document.querySelector(`#${tabId} [data-id="body"]`).style.display =
        "block";
      document.querySelector(
        `#${tabId} [data-id="binaryReqBody"]`
      ).style.display = "none";
      break;
    }
    case "binary": {
      document.querySelector(`#${tabId} [data-id="body"]`).style.display =
        "none";
      document.querySelector(
        `#${tabId} [data-id="binaryReqBody"]`
      ).style.display = "block";
      break;
    }
    case "None": {
      document.querySelector(`#${tabId} [data-id="body"]`).style.display =
        "none";
      document.querySelector(
        `#${tabId} [data-id="binaryReqBody"]`
      ).style.display = "none";
      break;
    }
  }
}

// Helper to convert binary file to base64 string
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result.split(",")[1]; // Strip "data:;base64,"
      resolve(base64);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file); // reads and encodes as Base64
  });
}

function arrayBufferToHex(ab) {
  const arr = new Uint8Array(ab);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
