// 세션이 끊긴 아스트라(LMS) 페이지는 "접속이 종료 되었습니다" alert로 페이지를 멈춘다.
// 그 alert만 가로채서 로그인 화면으로 보낸다. 다른 alert는 그대로 띄운다.
// 팝업에서 꺼 두면 가로채지 않는다. 설정을 아직 못 읽었으면 기본값(켜짐)으로 본다.
(() => {
  const originalAlert = window.alert;
  window.alert = function (message) {
    const enabled = document.documentElement.dataset.mjuAutoLogin !== "off";
    if (enabled && String(message).includes("접속이 종료")) {
      location.replace("/ilos/main/member/login_form.acl");
      return;
    }
    return originalAlert.apply(this, arguments);
  };
})();
