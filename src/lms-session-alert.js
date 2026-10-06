// 세션이 끊긴 LMS 페이지는 "접속이 종료 되었습니다" alert로 페이지를 멈춘다.
// 그 alert만 가로채서 로그인 화면으로 보낸다. 다른 alert는 그대로 띄운다.
(() => {
  const originalAlert = window.alert;
  window.alert = function (message) {
    if (String(message).includes("접속이 종료")) {
      location.replace("/ilos/main/member/login_form.acl");
      return;
    }
    return originalAlert.apply(this, arguments);
  };
})();
