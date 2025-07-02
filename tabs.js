let tabCount = 1;
const tabHeaders = document.getElementById("tabHeaders");
const tabContents = document.getElementById("tabContents");
const defaultContent = document.getElementById("tab1Content").cloneNode(true);
activateTab("tab" + tabCount);
switchTab("tab" + tabCount);
function switchTab(tabID) {
  tabId = tabID + "Content";
  setParams();
  document
    .querySelectorAll(".tab")
    .forEach((tab) =>
      tab.classList.toggle("font-bold", tab.dataset.id === tabID)
    );
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.add("hidden"));
  document.getElementById(tabID + "Content").classList.remove("hidden");
}

document.getElementById("addTab").addEventListener("click", () => {
  tabCount++;
  const newTabId = "tab" + tabCount;

  // Create tab wrapper div
  const tabWrapper = document.createElement("div");
  tabWrapper.className = "flex items-center";
  tabWrapper.dataset.tabWrapper = newTabId;

  // Create tab button (with flex for label + ❌)
  const tabBtn = document.createElement("button");
  tabBtn.className =
    "tab px-4 py-2 bg-white rounded-t border border-b-0 flex items-center space-x-2";
  tabBtn.dataset.id = newTabId;

  // Inner span for tab label
  const labelSpan = document.createElement("span");
  labelSpan.textContent = "undefined";
  labelSpan.onclick = () => renameTab(labelSpan);
  // Inner span for ❌ delete
  const closeSpan = document.createElement("span");
  closeSpan.textContent = "✕";
  closeSpan.className = "text-red-400 hover:text-red-600 text-xs ml-1";
  closeSpan.onclick = (e) => {
    e.stopPropagation(); // prevent switching when clicking ✕
    deleteTab(newTabId);
  };

  // Assemble tab button
  tabBtn.appendChild(labelSpan);
  tabBtn.appendChild(closeSpan);

  // Append to wrapper
  tabWrapper.appendChild(tabBtn);

  // Insert before + tab button
  tabHeaders.insertBefore(tabWrapper, document.getElementById("addTab"));

  // Create tab content
  const tabContent = document.createElement("div");
  tabContent.className = "tab-content border rounded-b bg-white p-4 hidden";
  tabContent.id = newTabId + "Content";
  tabContent.innerHTML = defaultContent.innerHTML;
  tabContents.appendChild(tabContent);

  activateTab(newTabId);
  switchTab(newTabId);
});

function deleteTab(tabId) {
  // Remove tab button + wrapper
  const tabWrapper = document.querySelector(`[data-tab-wrapper="${tabId}"]`);
  if (tabWrapper) tabWrapper.remove();

  // Remove content
  const tabContent = document.getElementById(`${tabId}Content`);
  if (tabContent) tabContent.remove();

  // Switch to first available tab (if any)
  const nextTab = document.querySelector(".tab");
  if (nextTab) switchTab(nextTab.dataset.id);
}

function renameTab(spanElement) {
  const currentName = spanElement.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentName;
  input.className = "text-sm border p-0.5 rounded w-20";
  spanElement.replaceWith(input);
  input.focus();
  let renamed = false;
  const finishRename = () => {
    if (renamed) return;
    renamed = true;
    const newName = input.value.trim() || currentName;
    const newSpan = document.createElement("span");
    newSpan.textContent = newName;
    newSpan.onclick = () => renameTab(newSpan);
    input.replaceWith(newSpan);
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finishRename();
  });
  input.addEventListener("blur", finishRename);
}

// Handle switching
tabHeaders.addEventListener("click", (e) => {
  if (e.target.classList.contains("tab")) {
    console.log(e.target.dataset.id);
    switchTab(e.target.dataset.id);
  }
});
