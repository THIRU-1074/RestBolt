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
function addAuth() {
  let authObj = retrieveAuth();
  console.log(authObj);
  if (authObj == null) return;
  if (authObj.loc === "query") {
    const queryList = queryListObj[tabId] || [];

    const index = queryList.findIndex((item) => item.key === "access_token");

    if (index === -1) {
      queryList.push({
        key: "access_token",
        value: authObj.token,
        checked: true,
      });
    } else {
      queryList[index].value = authObj.token;
      queryList[index].checked = true;
    }

    queryListObj[tabId] = queryList;
  } else if (authObj.loc === "header") {
    const headersList = headersListObj[tabId] || [];

    const index = headersList.findIndex((item) => item.key === "Authorization");

    if (index === -1) {
      headersList.push({
        key: "Authorization",
        value: authObj.token,
        checked: true,
      });
    } else {
      headersList[index].value = authObj.token;
      headersList[index].checked = true;
    }

    headersListObj[tabId] = headersList;
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

function togglePasswordVisibility(inputId, button) {
  const input = document.querySelector(`#${tabId} [data-id=${inputId}]`);
  const isVisible = input.type === "text";

  input.type = isVisible ? "password" : "text";

  const eye = button.querySelector(`#${tabId}.eye-icon`);
  const eyeOff = button.querySelector(`#${tabId}.eye-off-icon`);

  if (isVisible) {
    eye.classList.remove("hidden");
    eyeOff.classList.add("hidden");
  } else {
    eye.classList.add("hidden");
    eyeOff.classList.remove("hidden");
  }
}
