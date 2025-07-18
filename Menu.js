let proxyURL = "";
let proxyEnabled = false;
function openProxyDialog() {
  document.getElementById("proxyDialog").classList.remove("hidden");
}

function closeProxyDialog() {
  document.getElementById("proxyDialog").classList.add("hidden");
}

function updateToggleLabel(checkbox) {
  const label = checkbox
    .closest(".flex")
    .querySelector('[data-id="toggleLabel"]');
  const knob = checkbox.nextElementSibling.querySelector(
    '[data-id="switchKnob"]'
  );

  if (checkbox.checked) {
    label.textContent = "On";
    knob.classList.add("translate-x-full");
  } else {
    label.textContent = "Off";
    knob.classList.remove("translate-x-full");
  }
}

function setUpProxy(isSetUI = false) {
  if (isSetUI) {
    document.getElementById("proxyInput").value = proxyURL;
    document.getElementById("proxyToggleCheckbox").checked = proxyEnabled;
    return;
  }
  proxyURL = document.getElementById("proxyInput").value;
  proxyEnabled = document.getElementById("proxyToggleCheckbox").checked;

  console.log("Proxy URL:", proxyURL);
  console.log("Proxy Enabled:", proxyEnabled);

  closeProxyDialog();

  // Add logic to store or apply settings if needed
}

async function downloadResponseBody() {
  try {
    const buffer = responseObj[tabId];
    const headersList = responseHeadersObj[tabId];

    const rawContentType =
      headersList["content-type"] ||
      headersList["Content-Type"] ||
      "application/octet-stream";

    // ✅ Strip charset (like "text/html; charset=UTF-8" ➝ "text/html")
    const contentType = rawContentType.split(";")[0].trim();
    const ext = contentType.split("/")[1] || "bin";
    console.log(ext);
    const handle = await window.showSaveFilePicker({
      suggestedName: `response.${ext}`,
      types: [
        {
          description: contentType,
          accept: {
            [contentType]: [`.${ext}`],
          },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(buffer);
    await writable.close();
    console.log("Saved successfully.");
  } catch (err) {
    console.error("Save failed:", err);
  }
}
async function importRequestSnapshot() {
  try {
    // ✅ Step 1: Show file picker for .json files
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "JSON Files",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
      multiple: false,
    });

    // ✅ Step 2: Read and parse JSON file
    const file = await fileHandle.getFile();
    const text = await file.text();
    let snapshot;

    try {
      snapshot = JSON.parse(text);
    } catch (err) {
      alert("Invalid JSON file.");
      return;
    }

    // ✅ Step 3: Validate expected keys
    const requiredKeys = ["url", "method", "headers", "queryParams"];
    const hasAllKeys = requiredKeys.every((k) => k in snapshot);

    if (!hasAllKeys) {
      alert("Invalid request snapshot format. Missing required keys.");
      return;
    }

    // ✅ Step 4: Create new tab
    addNewTab(); // 🔁 Ensure this returns the tab ID
    getRequestParams();
    // ✅ Step 5: Set tab data
    url = snapshot.url;
    method = snapshot.method || "GET";
    headersListObj[tabId] = snapshot.headers || [];
    queryListObj[tabId] = snapshot.queryParams || [];
    proxyURL = snapshot.proxyURL || "";
    proxyEnabled = snapshot.proxyEnabled;
    setUpProxy(true);
    updateToggleLabel(document.getElementById("proxyToggleCheckbox"));

    const contentTypeEntry = headersListObj[tabId].find(
      (h) => h.key && h.key.toLowerCase() === "content-type"
    );

    const contentTypeValue = contentTypeEntry?.value || "";
    setTimeout(() => {
      document.querySelector(`#${tabId} [data-id="method"]`).value =
        snapshot.method;
      document.querySelector(`#${tabId} [data-id="url"]`).value = snapshot.url;
      document.querySelector(`#${tabId} [data-id="contentType"]`).value =
        contentTypeValue;
      document.querySelector(`#${tabId} [data-id="body"]`).value =
        snapshot.body || "";
      document.querySelector(`#${tabId} [data-id="contentType"]`).value =
        contentTypeValue;
    }, 10);
    updateKeyValDisplay(displayHeaders, headersListObj[tabId]);
    updateKeyValDisplay(displayQueries, queryListObj[tabId]);
    console.log("Imported request for tab:", tabId);
    console.log(tabId.slice(0, -"Content".length));
    const tabButton = document.querySelector(
      `[data-id="${tabId.slice(0, -"Content".length)}"]`
    );
    const nameSpan = tabButton.querySelector('[data-id="tabNameHolder"]');
    if (snapshot.tabName) nameSpan.textContent = snapshot.tabName;
    else nameSpan.textContent = "Imported Tab"; // or any desired name
    // ✅ Optionally: trigger re-render for the selected tab
    // renderTab(tabId); // If needed in your app
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("User cancelled file selection.");
    } else {
      console.error("Import failed:", err);
    }
  }
}

async function exportRequestSnapshot() {
  try {
    const headers = headersListObj[tabId] || [];
    const queryParams = queryListObj[tabId] || [];
    const tabButton = document.querySelector(
      `[data-id="${tabId.slice(0, -"Content".length)}"]`
    );
    const nameSpan = tabButton.querySelector('[data-id="tabNameHolder"]');
    const tabName = nameSpan.textContent;
    // Build full request structure
    const requestData = {
      url,
      method,
      headers, // includes { key, value, checked }
      queryParams, // includes { key, value, checked }
      body: bodyText,
      proxyURL,
      proxyEnabled,
      tabName,
    };

    const jsonString = JSON.stringify(requestData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    // ✅ Strip type for compatibility with File System Access API
    const contentType = "application/json";

    // ✅ Trigger native Save As dialog (Chrome/Edge only)
    const handle = await window.showSaveFilePicker({
      suggestedName: "request_snapshot.json",
      types: [
        {
          description: "JSON Request File",
          accept: {
            [contentType]: [".json"],
          },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();

    console.log("Request saved successfully:", handle.name);
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("User cancelled save.");
    } else {
      console.error("Save failed:", err);
    }
  }
}
