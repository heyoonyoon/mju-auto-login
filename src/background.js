// 엣지처럼 저장된 계정을 navigator.credentials로 넘겨주지 않는 브라우저용.
// 브라우저가 로그인 칸을 자동으로 채워 두어도, 사람이 페이지를 한 번 건드리기 전에는 페이지 코드가 빈 값으로 읽는다.
// 디버거로 "사용자 입력" 표시가 붙은 빈 실행을 한 번 보내 이 잠금을 풀고 바로 뗀다. 비밀번호는 읽지도 저장하지도 않는다.
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (message !== "mju-auto-login:unlock-autofill") return;
  const tabId = sender.tab?.id;
  if (tabId === undefined || sender.frameId !== 0 || !sender.url?.startsWith("https://sso.mju.ac.kr/")) {
    reply(false);
    return;
  }
  unlockAutofill(tabId).then(
    () => reply(true),
    () => reply(false)
  );
  return true;
});

async function unlockAutofill(tabId) {
  const target = { tabId };
  await chrome.debugger.attach(target, "1.3");
  try {
    await chrome.debugger.sendCommand(target, "Runtime.evaluate", { expression: "0", userGesture: true });
  } finally {
    await chrome.debugger.detach(target).catch(() => {});
  }
}
