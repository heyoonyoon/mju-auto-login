// 팝업 스위치. 값은 chrome.storage.local에 저장한다.
// - enabled: 자동 로그인 전체 켜기/끄기
// - skipPwChange: 비밀번호 변경 안내 자동으로 넘기기
const DEFAULTS = { enabled: true, skipPwChange: true };
const status = document.getElementById("status");
const switches = Object.fromEntries(Object.keys(DEFAULTS).map((key) => [key, document.getElementById(key)]));

function render(settings) {
  for (const [key, input] of Object.entries(switches)) input.checked = settings[key];
  status.textContent = settings.enabled ? "켜짐" : "꺼짐";
  // 세부 설정은 자동 로그인이 켜져 있을 때만 의미가 있다.
  for (const key of ["skipPwChange"]) {
    switches[key].disabled = !settings.enabled;
    switches[key].closest(".row").classList.toggle("off", !settings.enabled);
  }
}

chrome.storage.local.get(DEFAULTS, render);

for (const [key, input] of Object.entries(switches)) {
  input.addEventListener("change", () => {
    chrome.storage.local.set({ [key]: input.checked });
    chrome.storage.local.get(DEFAULTS, render);
  });
}
