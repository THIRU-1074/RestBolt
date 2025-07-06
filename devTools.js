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
}
function handleToolChange() {
  const value = document.querySelector(`#${tabId} [data-id="tool"]`).value;
  document.querySelector(`#${tabId} [data-id="b64ImgEncoder"]`).style.display =
    value === "Base_64ImgEncoder" ? "block" : "none";
  document.querySelector(`#${tabId} [data-id="cURL"]`).style.display =
    value === "cURL" ? "block" : "none";
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
