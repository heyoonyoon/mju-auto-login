// 팝업의 켜기/끄기 설정을 페이지 안(MAIN world)에서 도는 스크립트에 알려준다.
// MAIN world에서는 chrome.storage를 쓸 수 없어서, 결과를 <html> 속성과 이벤트로 넘긴다.
chrome.storage.local.get({ enabled: true }, ({ enabled }) => {
  document.documentElement.dataset.mjuAutoLogin = enabled ? "on" : "off";
  document.dispatchEvent(new CustomEvent("mju-auto-login:ready"));
});
