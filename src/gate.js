// 팝업의 켜기/끄기 설정을 페이지 안(MAIN world)에서 도는 스크립트에 알려준다.
// MAIN world에서는 chrome.storage를 쓸 수 없어서, 결과를 <html> 속성과 이벤트로 넘긴다.
chrome.storage.local.get({ enabled: true }, ({ enabled }) => {
  document.documentElement.dataset.mjuAutoLogin = enabled ? "on" : "off";
  document.dispatchEvent(new CustomEvent("mju-auto-login:ready"));
});

// sso.js가 자동 채움 잠금 해제를 요청하면 background.js에 전달하고 결과를 돌려준다.
document.addEventListener("mju-auto-login:unlock", () => {
  chrome.runtime.sendMessage("mju-auto-login:unlock-autofill", (ok) => {
    void chrome.runtime.lastError;
    document.dispatchEvent(new CustomEvent("mju-auto-login:unlocked", { detail: ok === true }));
  });
});
