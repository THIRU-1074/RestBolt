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

function setUpProxy() {
  proxyURL = document.getElementById("proxyInput").value;
  proxyEnabled = document.getElementById("proxyToggleCheckbox").checked;

  console.log("Proxy URL:", proxyURL);
  console.log("Proxy Enabled:", proxyEnabled);

  closeProxyDialog();

  // Add logic to store or apply settings if needed
}
