// 팝업 설정. 값은 chrome.storage.local에 저장한다.
// - enabled: 자동 로그인 전체 켜기/끄기
// - skipPwChange: 비밀번호 변경 안내 자동으로 넘기기
// - closeNotice: 아스트라(LMS) '나를 위한 공지' 창 자동으로 닫기
// - noticeCloseMode: 공지 창을 닫는 방식. "once"(X로 한 번만) 또는 "today"(오늘 하루 보지 않기)
const DEFAULTS = { enabled: true, skipPwChange: true, closeNotice: true, noticeCloseMode: "once" };
const SWITCHES = ["enabled", "skipPwChange", "closeNotice"];
const status = document.getElementById("status");
const switches = Object.fromEntries(SWITCHES.map((key) => [key, document.getElementById(key)]));
const modeRow = document.getElementById("noticeCloseMode");
const modeInputs = [...modeRow.querySelectorAll("input")];

function render(settings) {
  for (const [key, input] of Object.entries(switches)) input.checked = settings[key];
  for (const input of modeInputs) input.checked = input.value === settings.noticeCloseMode;
  status.textContent = settings.enabled ? "켜짐" : "꺼짐";
  // 세부 설정은 자동 로그인이 켜져 있을 때만 의미가 있다.
  for (const key of ["skipPwChange", "closeNotice"]) {
    switches[key].disabled = !settings.enabled;
    switches[key].closest(".row").classList.toggle("off", !settings.enabled);
  }
  const modeOn = settings.enabled && settings.closeNotice;
  for (const input of modeInputs) input.disabled = !modeOn;
  modeRow.classList.toggle("off", !modeOn);
}

const refresh = () => chrome.storage.local.get(DEFAULTS, render);
refresh();

for (const [key, input] of Object.entries(switches)) {
  input.addEventListener("change", () => {
    chrome.storage.local.set({ [key]: input.checked });
    refresh();
  });
}
for (const input of modeInputs) {
  input.addEventListener("change", () => {
    chrome.storage.local.set({ noticeCloseMode: input.value });
    refresh();
  });
}
