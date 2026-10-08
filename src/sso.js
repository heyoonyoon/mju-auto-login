// 명지대 SSO 페이지
// - 로그인 화면(어느 명지대 사이트에서 왔든):브라우저 비밀번호 관리자에서 계정을 받아 채우고 로그인 버튼을 누른다.
//   엣지처럼 계정을 넘겨주지 않는 브라우저는 브라우저가 채워 둔 칸을 그대로 제출한다.
// - 비밀번호 변경 안내: 방금 자동 로그인한 경우에만 취소 버튼과 같은 주소로 넘어간다.
// 팝업에서 꺼 두면 아무것도 하지 않는다.
// 비밀번호는 저장하지 않는다. 상태 표시(제출 시각, 실패 여부)만 localStorage에 둔다.
(() => {
  const KEY = "mjuAutoLogin";
  // 비밀번호가 틀리면 로그인 화면은 몇 초 안에 다시 뜬다. 길게 잡으면 로그인 직후 직접 로그아웃한 것도 실패로 착각한다.
  const FAIL_WINDOW_MS = 15 * 1000;

  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  };
  const save = (state) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  };
  const clear = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
  };

  whenEnabled(run);

  function run() {
    const params = new URLSearchParams(location.search);
    const state = load();

    if (location.pathname === "/sso/change/pw") {
      const id = params.get("cm_cg_id");
      if (id && state.submittedAt) {
        clear();
        location.replace("/sso/auth?cm_cg_id=" + encodeURIComponent(id));
      }
      return;
    }

    const fields = findLoginFields();
    if (!fields) return;

    if (state.failed) {
      showBanner("이전 자동 로그인이 실패해서 멈춰 있습니다. 직접 로그인하세요.", true);
      return;
    }
    // 자동 제출 직후 로그인 화면이 다시 떴다 = 로그인 실패. 계정 잠김을 막기 위해 멈춘다.
    if (state.submittedAt && Date.now() - state.submittedAt < FAIL_WINDOW_MS) {
      save({ failed: true });
      showBanner("자동 로그인이 실패해서 멈췄습니다. 비밀번호가 바뀌었다면 크롬에 저장된 비밀번호를 고친 뒤 다시 켜세요.", true);
      return;
    }
    // 다른 명지대 사이트(아스트라(LMS), MSI 등)에서 넘어온 로그인 화면일 때만 자동 로그인한다.
    if (!params.get("client_id")) return;

    navigator.credentials
      .get({ password: true, mediation: "silent" })
      .then(async (cred) => {
        if (cred && cred.password) {
          setValue(fields.userId, cred.id);
          setValue(fields.password, cred.password);
          submit(fields);
          return;
        }
        // 엣지는 계정을 넘겨주지 않는 대신 칸을 직접 채워 둔다. 채워져 있으면 잠금을 풀고 그 값으로 제출한다.
        if (isAutofilled(fields) && (await unlockAutofill()) && (await waitForValues(fields))) {
          submit(fields);
          return;
        }
        showBanner(
          "브라우저에서 저장된 계정을 받지 못했습니다. 계정이 저장되어 있는지, " +
            "크롬은 '비밀번호 입력 시 화면 잠금 사용', 엣지는 '디바이스 로그인 옵션을 묻는' 설정이 꺼져 있는지 확인하세요."
        );
      })
      .catch(() => {
        showBanner("브라우저에서 저장된 계정을 받는 중 오류가 났습니다. 직접 로그인하세요.");
      });
  }

  function submit(fields) {
    save({ submittedAt: Date.now() });
    // 암호화는 페이지 스크립트가 제출 시점에 하므로 버튼 클릭으로 그 흐름을 그대로 탄다.
    if (fields.submit) fields.submit.click();
    else fields.form.requestSubmit();
  }

  function isAutofilled(fields) {
    try {
      return fields.password.matches(":autofill");
    } catch {
      return fields.password.matches(":-webkit-autofill");
    }
  }

  // background.js가 디버거로 사용자 입력 표시를 한 번 보내 주면 자동 채움 값이 페이지에 풀린다.
  function unlockAutofill() {
    return new Promise((resolve) => {
      document.addEventListener("mju-auto-login:unlocked", (e) => resolve(e.detail === true), { once: true });
      document.dispatchEvent(new CustomEvent("mju-auto-login:unlock"));
    });
  }

  function waitForValues(fields, timeoutMs = 2000) {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        if (fields.userId.value && fields.password.value) resolve(true);
        else if (Date.now() - start > timeoutMs) resolve(false);
        else setTimeout(check, 100);
      };
      check();
    });
  }

  // 팝업에서 끈 상태면 아무것도 하지 않는다. 설정값은 gate.js가 <html> 속성으로 넘겨준다.
  function whenEnabled(callback) {
    const check = () => {
      if (document.documentElement.dataset.mjuAutoLogin === "on") callback();
    };
    if (document.documentElement.dataset.mjuAutoLogin) check();
    else document.addEventListener("mju-auto-login:ready", check, { once: true });
  }

  // 지금 SSO 페이지의 이름표로 먼저 찾고, 이름이 바뀌었으면 폼 구조로 찾는다.
  function findLoginFields() {
    const known = {
      form: document.querySelector("form#signin-form"),
      userId: document.querySelector("#input-userId"),
      password: document.querySelector("#input-password"),
      submit: document.querySelector("button.login_bt"),
    };
    if (known.form && known.userId && known.password && known.submit) return known;

    // 비밀번호 칸이 정확히 1개인 폼만 로그인 폼으로 본다.
    // 비밀번호 변경 폼(칸 2개 이상)에 현재 비밀번호를 넣고 제출하는 사고를 막기 위해서다.
    for (const form of document.forms) {
      const passwords = form.querySelectorAll('input[type="password"]');
      if (passwords.length !== 1) continue;
      const password = passwords[0];
      // 아이디 칸: username 표시가 있으면 그것, 없으면 비밀번호 칸 바로 앞의 글자 입력칸
      const before = [
        ...form.querySelectorAll('input:not([type]), input[type="text"], input[type="email"], input[type="tel"]'),
      ].filter((el) => el.compareDocumentPosition(password) & Node.DOCUMENT_POSITION_FOLLOWING);
      const userId = form.querySelector('input[autocomplete="username"]') || before[before.length - 1];
      if (!userId) continue;
      const submit = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
      return { form, userId, password, submit };
    }
    return null;
  }

  function setValue(input, value) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function showBanner(text, withResume) {
    const banner = document.createElement("div");
    banner.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:2147483647;padding:12px 16px;" +
      "background:#b3261e;color:#fff;font:14px/1.4 sans-serif;text-align:center;";
    banner.textContent = "[명지대 자동 로그인] " + text + " ";
    if (withResume) {
      const resume = document.createElement("button");
      resume.textContent = "자동 로그인 다시 켜기";
      resume.style.cssText = "margin-left:8px;padding:4px 8px;cursor:pointer;";
      resume.addEventListener("click", () => {
        clear();
        banner.remove();
      });
      banner.appendChild(resume);
    }
    document.body.appendChild(banner);
  }
})();
