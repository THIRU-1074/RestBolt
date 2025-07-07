let dropzone = undefined;
let fileInput = undefined;
let base64Output = undefined;
let curlOutput = undefined;
let copyBase64 = undefined;
let copyCURL = undefined;
function configdevTools() {
  dropzone = document.querySelector(`#${tabId} [data-id="dropzone"]`);
  fileInput = document.querySelector(`#${tabId} [data-id="fileInput"]`);
  base64Output = document.querySelector(`#${tabId} [data-id="base64Output"]`);
  curlOutput = document.querySelector(`#${tabId} [data-id="curlOutput"]`);
  copyBase64 = document.querySelector(`#${tabId} [data-id="copyBase64"]`);
  copyCURL = document.querySelector(`#${tabId} [data-id="copyCURL"]`);
  const decodeBtn = document.querySelector(`#${tabId} [data-id="decodeBtn"]`);
  // Handle click to open file selector
  dropzone.addEventListener("click", () => fileInput.click());

  // Handle drag & drop
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("bg-blue-600");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("bg-blue-600");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("bg-blue-600");
    const file = e.dataTransfer.files[0];
    if (file) convertToBase64(file);
  });
  decodeBtn.addEventListener("click", () => convertFromBase64());
  // Handle manual file selection
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) convertToBase64(file);
  });
  // Copy to clipboard
  copyBase64.addEventListener("click", () =>
    copy(base64Output.value, copyBase64)
  );
  copyCURL.addEventListener("click", () => copy(curlOutput.value, copyCURL));
  document
    .querySelector(`#${tabId} [data-id="curl_eg"]`)
    .addEventListener("click", () => runPreview());

  const unixInputSection = document.querySelector(
    `#${tabId} [data-id="unixInputSection"]`
  );
  const utcInputSection = document.querySelector(
    `#${tabId} [data-id="utcInputSection"]`
  );
  const output = document.querySelector(`#${tabId} [data-id="output"]`);
  const convertBtn = document.querySelector(`#${tabId} [data-id="convertBtn"]`);
  const toggle = document.querySelector(`#${tabId} [data-id="modeSwitch"]`);
  const label = document.querySelector(`#${tabId} [data-id="toggleLabel"]`);
  const knob = document.querySelector(`#${tabId} [data-id="switchKnob"]`);
  const track = document.querySelector(`#${tabId} [data-id="switchTrack"]`);
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      knob.style.transform = "translateX(20px)";
      track.classList.remove("bg-blue-500");
      track.classList.add("bg-green-500");
      unixInputSection.classList.add("hidden");
      utcInputSection.classList.remove("hidden");
      label.textContent = "UTC ➝ Unix";
      output.textContent = "";
    } else {
      knob.style.transform = "translateX(0px)";
      track.classList.remove("bg-green-500");
      track.classList.add("bg-blue-500");
      unixInputSection.classList.remove("hidden");
      utcInputSection.classList.add("hidden");
      output.textContent = "";
      label.textContent = "Unix ➝ UTC";
    }
  });

  convertBtn.addEventListener("click", () => {
    if (!toggle.checked) {
      // Unix ➝ UTC
      const unixTime = parseInt(
        document.querySelector(`#${tabId} [data-id="unixInput"]`).value.trim()
      );
      if (isNaN(unixTime)) {
        output.textContent = "Please enter a valid Unix timestamp";
        return;
      }
      const date = new Date(unixTime * 1000);
      output.textContent = `UTC Time: ${date.toUTCString()}`;
    } else {
      // UTC ➝ Unix
      const dateStr = document.querySelector(
        `#${tabId} [data-id="utcDate"]`
      ).value;
      const timeStr = document.querySelector(
        `#${tabId} [data-id="utcTime"]`
      ).value;

      if (!dateStr || !timeStr) {
        output.textContent = "Please select both date and time";
        return;
      }

      const fullDateTime = new Date(`${dateStr}T${timeStr}Z`);
      const unixTimestamp = Math.floor(fullDateTime.getTime() / 1000);
      output.textContent = `Unix Timestamp: ${unixTimestamp}`;
    }
  });
}
function handleToolChange() {
  const value = document.querySelector(`#${tabId} [data-id="tool"]`).value;
  document.querySelector(`#${tabId} [data-id="b64ImgEncoder"]`).style.display =
    value === "Base_64ImgEncoder" ? "block" : "none";
  document.querySelector(`#${tabId} [data-id="cURL"]`).style.display =
    value === "cURL" ? "block" : "none";
  document.querySelector(`#${tabId} [data-id="UnixTimeConv"]`).style.display =
    value === "UnixTimeConv" ? "block" : "none";
  document.querySelector(`#${tabId} [data-id="b64ImgDecoder"]`).style.display =
    value === "Base_64ImgDecoder" ? "block" : "none";
}
function curlPreview(url, method, headersList, jsonBody = null) {
  console.log(method);
  console.log(url);
  let curl = `curl -X ${String(method).toUpperCase()} "${url}"`;

  // Add headers
  if (headersList != undefined) {
    headersList.forEach((header) => {
      if (header.checked && header.key && header.value) {
        curl += ` \\\n  -H "${header.key}: ${header.value}"`;
      }
    });
  }

  // Add body
  if (jsonBody && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    const bodyString = JSON.stringify(jsonBody).replace(/"/g, '\\"');
    curl += ` \\\n  -d "${bodyString}"`;
  }

  return curl;
}
function runPreview(curlStr = null) {
  const url = "https://api.example.com/login";
  const method = "POST";
  const headersList = [
    { key: "Content-Type", value: "application/json", checked: true },
    { key: "Authorization", value: "Bearer xyz123", checked: true },
  ];
  const jsonBody = {
    username: "thiru",
    password: "pass123",
  };
  let result = undefined;
  if (curlStr == null) result = curlPreview(url, method, headersList, jsonBody);
  else result = curlStr;
  document.querySelector(`#${tabId} [data-id="curlOutput"]`).value = result;
}
// Convert image to base64
function convertToBase64(file) {
  const reader = new FileReader();
  reader.onload = () => {
    base64Output.value = reader.result;
  };
  reader.readAsDataURL(file);
}

function convertFromBase64() {
  const base64Input = document.querySelector(
    `#${tabId} [data-id="base64Input"]`
  );
  const decodedImage = document.querySelector(
    `#${tabId} [data-id="decodedImage"]`
  );
  const outputArea = document.querySelector(`#${tabId} [data-id="outputArea"]`);
  const errorMsg = document.querySelector(`#${tabId} [data-id="errorMsg"]`);

  const base64String = base64Input.value.trim();

  // Basic validation
  if (!base64String.startsWith("data:image/")) {
    errorMsg.textContent =
      "Invalid Base64 image string. Make sure it starts with 'data:image/...'";
    errorMsg.classList.remove("hidden");
    outputArea.classList.add("hidden");
    return;
  }

  decodedImage.src = base64String;
  errorMsg.classList.add("hidden");
  outputArea.classList.remove("hidden");
}
