// 아스트라(LMS) 로그인 화면(= 로그아웃 상태)에 오면 SSO 로그인 흐름으로 보낸다.
// 팝업에서 꺼 두면 아무것도 하지 않는다.
chrome.storage.local.get({ enabled: true }, ({ enabled }) => {
  if (!enabled) return;

  const KEY = "mjuAutoLoginRedirects";
  const WINDOW_MS = 60 * 1000;
  const MAX_REDIRECTS = 2;

  // 1분 안에 여러 번 돌아오면 어딘가 막힌 것이므로 무한 반복하지 않고 멈춘다.
  const now = Date.now();
  let recent = [];
  try {
    recent = JSON.parse(sessionStorage.getItem(KEY)) || [];
  } catch {}
  recent = recent.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REDIRECTS) return;
  recent.push(now);
  try {
    sessionStorage.setItem(KEY, JSON.stringify(recent));
  } catch {}

  location.replace("https://lms.mju.ac.kr/ilos/sso/sso_check.jsp");
});
