const API_BASE_URL = "http://localhost:8080";

const nicknameForm = document.querySelector("#nickname-form");
const emailForm = document.querySelector("#email-form");
const ratingsForm = document.querySelector("#ratings-form");
const nicknameResult = document.querySelector("#nickname-result");
const emailResult = document.querySelector("#email-result");
const ratingsFeedback = document.querySelector("#ratings-feedback");
const ratingSummary = document.querySelector("#rating-summary");
const ratingList = document.querySelector("#rating-list");
const activityList = document.querySelector("#activity-list");
const activityEmpty = document.querySelector("#activity-empty");
const clearLogButton = document.querySelector("#clear-log");

async function request(path) {
  const startedAt = performance.now();
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`);
  } catch {
    addActivity(path, "연결 실패", performance.now() - startedAt, false);
    throw new Error(
      "백엔드 서버에 연결할 수 없어요. localhost:8080 실행 상태를 확인해 주세요.",
    );
  }

  const data = await readResponse(response);
  addActivity(
    path,
    response.status,
    performance.now() - startedAt,
    response.ok,
  );

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `요청 처리에 실패했어요. (HTTP ${response.status})`;
    throw new Error(message);
  }

  return data;
}

async function readResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function setButtonLoading(button, isLoading, idleLabel, loadingLabel) {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingLabel : idleLabel;
}

function showCheckResult(container, type, title, description) {
  container.className = `result-message result-message--${type}`;
  container.replaceChildren();

  const icon = document.createElement("span");
  icon.className = "result-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = type === "success" ? "✓" : type === "error" ? "!" : "?";

  const content = document.createElement("div");
  const heading = document.createElement("strong");
  const body = document.createElement("p");
  heading.textContent = title;
  body.textContent = description;
  content.append(heading, body);
  container.append(icon, content);
}

nicknameForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const input = nicknameForm.elements.nickname;
  const button = nicknameForm.querySelector('button[type="submit"]');
  const nickname = input.value.trim();

  if (!nickname) {
    showCheckResult(
      nicknameResult,
      "error",
      "닉네임을 입력해 주세요.",
      "사용 가능 여부를 확인할 닉네임이 필요해요.",
    );
    input.focus();
    return;
  }

  setButtonLoading(button, true, "중복 확인", "확인 중...");

  try {
    const data = await request(
      `/members/nickname/${encodeURIComponent(nickname)}`,
    );

    if (data.available) {
      showCheckResult(
        nicknameResult,
        "success",
        `“${nickname}”은 사용할 수 있어요.`,
        "중복되지 않은 닉네임이에요.",
      );
    } else {
      showCheckResult(
        nicknameResult,
        "error",
        `“${nickname}”은 이미 사용 중이에요.`,
        "다른 닉네임으로 다시 확인해 주세요.",
      );
    }
  } catch (error) {
    showCheckResult(
      nicknameResult,
      "error",
      "닉네임 확인에 실패했어요.",
      error.message,
    );
  } finally {
    setButtonLoading(button, false, "중복 확인", "확인 중...");
  }
});

emailForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const input = emailForm.elements.email;
  const button = emailForm.querySelector('button[type="submit"]');
  const email = input.value.trim();

  if (!email || !input.checkValidity()) {
    showCheckResult(
      emailResult,
      "error",
      "올바른 이메일을 입력해 주세요.",
      "예: user@example.com 형식으로 입력해 주세요.",
    );
    input.focus();
    return;
  }

  setButtonLoading(button, true, "중복 확인", "확인 중...");

  try {
    const data = await request(`/members/email/${encodeURIComponent(email)}`);

    if (data.available) {
      showCheckResult(
        emailResult,
        "success",
        `“${email}”은 사용할 수 있어요.`,
        "중복되지 않은 이메일이에요.",
      );
    } else {
      showCheckResult(
        emailResult,
        "error",
        `“${email}”은 이미 사용 중이에요.`,
        "다른 이메일로 다시 확인해 주세요.",
      );
    }
  } catch (error) {
    showCheckResult(
      emailResult,
      "error",
      "이메일 확인에 실패했어요.",
      error.message,
    );
  } finally {
    setButtonLoading(button, false, "중복 확인", "확인 중...");
  }
});

ratingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const input = ratingsForm.elements.memberId;
  const button = ratingsForm.querySelector('button[type="submit"]');
  const memberId = Number(input.value);

  if (!Number.isInteger(memberId) || memberId <= 0) {
    ratingSummary.hidden = true;
    showRatingsError("1 이상의 회원 번호를 입력해 주세요.");
    renderEmptyRatings(
      "회원 번호를 다시 확인해 주세요.",
      "회원 번호는 양의 정수만 사용할 수 있어요.",
    );
    input.focus();
    return;
  }

  setButtonLoading(button, true, "평점 불러오기", "불러오는 중...");
  showRatingsLoading(memberId);

  try {
    const ratings = await request(`/members/${memberId}/ratings`);
    renderRatings(memberId, ratings);
  } catch (error) {
    ratingSummary.hidden = true;
    showRatingsError(error.message);
    renderEmptyRatings(
      "평점 정보를 표시할 수 없어요.",
      "회원 번호와 백엔드 서버 상태를 확인한 뒤 다시 시도해 주세요.",
    );
  } finally {
    setButtonLoading(button, false, "평점 불러오기", "불러오는 중...");
  }
});

function showRatingsLoading(memberId) {
  ratingsFeedback.className = "ratings-feedback is-loading";
  ratingsFeedback.replaceChildren();

  const spinner = document.createElement("span");
  spinner.className = "spinner";
  spinner.setAttribute("aria-hidden", "true");

  const message = document.createElement("span");
  message.textContent = `${memberId}번 회원의 평점을 불러오는 중이에요.`;

  ratingsFeedback.append(spinner, message);
}

function showRatingsError(message) {
  ratingsFeedback.className = "ratings-feedback is-error";
  ratingsFeedback.textContent = message;
}

function renderRatings(memberId, ratings) {
  const safeRatings = Array.isArray(ratings) ? ratings : [];
  ratingsFeedback.className = "ratings-feedback is-success";
  ratingsFeedback.textContent = `${memberId}번 회원의 평점 ${safeRatings.length}개를 불러왔어요.`;
  ratingList.replaceChildren();

  const totalScore = safeRatings.reduce(
    (sum, rating) => sum + Number(rating.score || 0),
    0,
  );
  const averageScore = safeRatings.length
    ? totalScore / safeRatings.length
    : 0;

  document.querySelector("#rating-count").textContent = safeRatings.length;
  document.querySelector("#rating-average").textContent =
    averageScore.toFixed(1);
  document.querySelector("#rating-latest").textContent = safeRatings.length
    ? formatDate(
        safeRatings[0].updatedAt || safeRatings[0].createdAt,
        true,
      )
    : "-";
  ratingSummary.hidden = false;

  if (!safeRatings.length) {
    renderEmptyRatings(
      "아직 등록된 평점이 없어요.",
      "이 회원이 남긴 평점이 생기면 이곳에 표시돼요.",
    );
    return;
  }

  safeRatings.forEach((rating) => {
    ratingList.append(createRatingCard(rating));
  });
}

function createRatingCard(rating) {
  const article = document.createElement("article");
  article.className = "rating-card";

  const movieIndex = document.createElement("span");
  movieIndex.className = "movie-index";
  movieIndex.textContent = `#${rating.movieId}`;

  const content = document.createElement("div");
  content.className = "rating-content";

  const header = document.createElement("div");
  header.className = "rating-card-header";

  const title = document.createElement("h4");
  title.textContent = `영화 #${rating.movieId}`;

  const score = Math.max(0, Math.min(5, Math.round(Number(rating.score) || 0)));
  const stars = document.createElement("span");
  stars.className = "stars";
  stars.setAttribute("aria-label", `평점 ${rating.score}점`);
  stars.textContent = `${"★".repeat(score)}${"☆".repeat(5 - score)}`;

  const comment = document.createElement("p");
  comment.className = "rating-comment";
  comment.textContent = rating.comment || "작성한 후기가 없습니다.";

  const time = document.createElement("time");
  time.className = "rating-date";
  time.dateTime = rating.createdAt || "";
  time.textContent = formatDate(rating.createdAt);

  header.append(title, stars);
  content.append(header, comment);
  article.append(movieIndex, content, time);

  return article;
}

function renderEmptyRatings(title, description) {
  ratingList.replaceChildren();

  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";

  const icon = document.createElement("span");
  icon.className = "empty-state-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "★";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const body = document.createElement("p");
  body.textContent = description;

  emptyState.append(icon, heading, body);
  ratingList.append(emptyState);
}

function formatDate(value, short = false) {
  if (!value) {
    return "날짜 정보 없음";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "날짜 정보 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: short ? "short" : "long",
    day: "numeric",
    ...(short
      ? {}
      : {
          hour: "2-digit",
          minute: "2-digit",
        }),
  }).format(date);
}

function addActivity(path, status, duration, isSuccess) {
  activityEmpty.hidden = true;

  const item = document.createElement("li");
  item.className = "activity-item";

  const method = document.createElement("span");
  method.className = "activity-method";
  method.textContent = "GET";

  const requestPath = document.createElement("code");
  requestPath.className = "activity-path";
  requestPath.textContent = path;

  const meta = document.createElement("div");
  meta.className = "activity-meta";

  const statusBadge = document.createElement("span");
  statusBadge.className = `activity-status ${
    isSuccess ? "activity-status--success" : "activity-status--error"
  }`;
  statusBadge.textContent = String(status);

  const responseTime = document.createElement("span");
  responseTime.className = "activity-time";
  responseTime.textContent = `${Math.round(duration)}ms`;

  meta.append(method, statusBadge, responseTime);
  item.append(meta, requestPath);
  activityList.prepend(item);

  while (activityList.children.length > 6) {
    activityList.lastElementChild.remove();
  }
}

clearLogButton.addEventListener("click", () => {
  activityList.replaceChildren();
  activityEmpty.hidden = false;
});
