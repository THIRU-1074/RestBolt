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
    key = capitalizeHeader(key);
    if (checked && key) headers[key] = value;
  });

  // Set Content-Type header (override if user hasn't already)
  if (method !== "GET" && method !== "DELETE") {
    headers["Content-Type"] = contentType;
    headersList["Content-Type"] = contentType;
  }
  updateKeyValDisplay(displayHeaders, headersList);
}

function collectReqBody() {
  // Include body if necessary
  if (method !== "GET" && method !== "DELETE" && bodyText) {
    if (headers["Content-Type"] === "application/json") {
      try {
        console.log(bodyText);
        const parsed = JSON.parse(bodyText);
        body = JSON.stringify(parsed);
      } catch (err) {
        alert("Invalid JSON in request body!");
        console.log(err.message);
      }
    } else {
      body = bodyText;
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

function getRequestParams() {
  method = document.querySelector(`#${tabId} [data-id="method"]`).value;
  url = document.querySelector(`#${tabId} [data-id="url"]`).value.trim();
  contentType = document.querySelector(
    `#${tabId} [data-id="contentType"]`
  ).value;
  if (contentType == "binary") {
    if (binaryReqBodyObj == undefined) {
      alert("Please upload a File for Request Body...!");
      bodyText = "";
      return;
    }
    contentType = binaryReqBodyObj.contentType;
    body = binaryBodyContent;
  } else {
    bodyText = document
      .querySelector(`#${tabId} [data-id="body"]`)
      .value.trim();
  }
}
async function sendRequest() {
  setParams();
  collectReqHeaders();
  collectReqBody();
  collectReqQuery();
  getRequestParams();
  if (proxyEnabled) url = proxyURL + encodeURIComponent(url);
  console.log(bodyText);
  if (bodyText.length == 0)
    runPreview(curlPreview(url, method, headersListObj[tabId]));
  else runPreview(curlPreview(url, method, headersListObj[tabId], bodyText));
  // Prepare fetch options
  const options = {
    method,
    headers,
    body,
  };
  console.log(method);
  try {
    res = await fetch(url, options);

    const plainHeaders = {};
    res.headers.forEach((value, key) => {
      plainHeaders[key] = value;
    });
    console.log(plainHeaders);
    responseHeadersObj[tabId] = plainHeaders;
    responseObj[tabId] = await res.arrayBuffer();
    handleResponse(res);
    const rawRadio = document.querySelector(
      `#${tabId} input[name="viewMode"][value="raw"]`
    );

    // Set it as checked
    rawRadio.checked = true;

    // Trigger the change event manually
    rawRadio.dispatchEvent(new Event("change", { bubbles: true }));
  } catch (err) {
    document.querySelector(`#${tabId} [data-id="responseStatus"]`).textContent =
      "Error";
    document.querySelector(`#${tabId} [data-id="responseBody"]`).textContent =
      err.toString();
  }
  headers = {};

  const queryList = queryListObj[tabId] || [];
  queryListObj[tabId] = queryList.filter((item) => item.key !== "access_token");

  const headersList = headersListObj[tabId] || [];
  headersListObj[tabId] = headersList.filter(
    (item) => item.key !== "Authorization"
  );
}
