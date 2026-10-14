// 아스트라(LMS) 메인에 로그인하면 뜨는 '나를 위한 공지' 창(#my_notice_pop)을 닫는다.
// 닫는 방식은 팝업에서 고른다.
// - "once": X 버튼으로 이번만 닫는다. 다른 기기나 확장 프로그램 없이 접속하면 공지를 그대로 볼 수 있다.
// - "today": '오늘 하루 보지 않기'를 누른다. 그날은 창이 다시 뜨지 않는다.
// 팝업에서 자동 로그인이나 '공지 창 자동으로 닫기'를 꺼 두면 아무것도 하지 않는다.
chrome.storage.local.get(
  { enabled: true, closeNotice: true, noticeCloseMode: "once" },
  ({ enabled, closeNotice, noticeCloseMode }) => {
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

    // 지금 페이지의 이름표로 찾고, 바뀌었으면 사이트 함수 호출(myNoticePopClose)로 찾는다.
    function findButton() {
      const pop = document.getElementById("my_notice_pop");
      if (!pop) return null;
      const today = noticeCloseMode === "today";
      const button =
        (today ? null : pop.querySelector("button.close_btn")) ||
        pop.querySelector(`[onclick*="myNoticePopClose(${today})"]`);
      return button && button.getClientRects().length ? button : null;
    }
  }
);
