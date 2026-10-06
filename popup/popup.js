// 자동 로그인 켜기/끄기. 값은 chrome.storage.local의 enabled에 저장한다.
const toggle = document.getElementById("enabled");
const status = document.getElementById("status");

function render(enabled) {
  toggle.checked = enabled;
  status.textContent = enabled ? "켜짐" : "꺼짐";
}

chrome.storage.local.get({ enabled: true }, ({ enabled }) => render(enabled));

toggle.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: toggle.checked });
  render(toggle.checked);
});
