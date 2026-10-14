// 아스트라(LMS) 메인에 로그인하면 뜨는 '나를 위한 공지' 창(#my_notice_pop)을 닫는다.
// '오늘 하루 보지 않기'를 눌러서 그날은 창이 다시 뜨지 않게 한다.
// 이름표가 바뀌면 '오늘 하루 보지 않기' 글자로 찾는다.
// 팝업에서 자동 로그인이나 '공지 창 자동으로 닫기'를 꺼 두면 아무것도 하지 않는다.
chrome.storage.local.get({ enabled: true, closeNotice: true }, ({ enabled, closeNotice }) => {
  if (!enabled || !closeNotice) return;

  // 공지 창은 페이지가 뜬 뒤 늦게 붙을 수 있어서 잠깐 지켜본다.
  const WATCH_MS = 15 * 1000;

  const tryClose = () => {
    const button = findButton();
    if (!button) return false;
    button.click();
    return true;
  };

  if (tryClose()) return;
  const observer = new MutationObserver(() => {
    if (tryClose()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), WATCH_MS);

  function findButton() {
    const pop = document.getElementById("my_notice_pop");
    const scope = pop || (document.body?.textContent.includes("나를 위한 공지") ? document.body : null);
    if (!scope) return null;
    for (const el of scope.querySelectorAll("button, a")) {
      if (el.textContent.trim() === "오늘 하루 보지 않기" && el.getClientRects().length) return el;
    }
    return null;
  }
});
