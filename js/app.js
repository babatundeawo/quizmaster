import {
  saveQuestionToCloud,
  loadQuestionsFromCloud,
  deleteQuestionFromCloud,
  watchAuth,
  signInAsGuest,
  signInWithGoogle,
  signOutPlayer,
  loadPlayerProfile,
  savePlayerProfile,
  saveScoreToCloud,
  loadTopScores
} from "./firebase-config.js";

// ----- Screens -----
const screens = document.querySelectorAll(".screen");

function showScreen(screenId) {
  screens.forEach(function (screen) {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

// ----- Settings -----
const TIME_PER_QUESTION = 15;
const BEST_KEY = "quizmasterBestPercent";
const MAX_QUESTIONS = 10;
const MIN_QUESTIONS_FOR_LEADERBOARD = 5;

// ----- Quiz state -----
let currentIndex = 0;
let score = 0;
let answered = false;
let timeLeft = TIME_PER_QUESTION;
let timerId = null;
let selectedCategory = "All";
let selectedDifficulty = "All";
let activeQuestions = [];

// ----- Player state -----
let currentUser = null;
let currentPlayer = null;

// ----- Ending a question -----
function revealCorrectAnswer() {
  const correctIndex = activeQuestions[currentIndex].answer;
  const optionButtons = document.querySelectorAll("#options .option-btn");
  optionButtons[correctIndex].classList.add("correct");
}

function endQuestion() {
  answered = true;
  stopTimer();
  document.getElementById("live-score").textContent = `Score: ${score}`;
  document.getElementById("next-btn").classList.remove("hidden");
}

// ----- Timer -----
function updateTimerDisplay() {
  document.getElementById("timer").textContent = `Time: ${timeLeft}`;
}

function stopTimer() {
  clearInterval(timerId);
}

function startTimer() {
  stopTimer();
  timeLeft = TIME_PER_QUESTION;
  updateTimerDisplay();

  timerId = setInterval(function () {
    timeLeft = timeLeft - 1;
    updateTimerDisplay();
    if (timeLeft === 0) {
      timeUp();
    }
  }, 1000);
}

function timeUp() {
  document.getElementById("timer").textContent = "Time's up!";
  revealCorrectAnswer();
  endQuestion();
}

// ----- Best score -----
function getBestScore() {
  const saved = localStorage.getItem(BEST_KEY);
  if (saved === null) {
    return 0;
  }
  return Number(saved);
}

function showBestOnHome() {
  document.getElementById("home-best").textContent = `${currentPlayer.bestPercent}%`;
}

// ----- Player -----
function enterHome() {
  document.getElementById("player-name-display").textContent = currentPlayer.name;
  document.getElementById("games-played").textContent = currentPlayer.gamesPlayed;
  showBestOnHome();
  showScreen("home-screen");
}

async function handleSignedIn(user) {
  currentUser = user;

  try {
    currentPlayer = await loadPlayerProfile(user.uid);
  } catch (error) {
    console.log("Could not load profile:", error);
    currentPlayer = {
      name: "Guest",
      gamesPlayed: 0,
      bestPercent: getBestScore(),
      offline: true
    };
  }

  if (currentPlayer === null) {
    document.getElementById("player-name").value = "";
    document.getElementById("name-message").textContent = "";
    showScreen("name-screen");
    return;
  }

  enterHome();
}

async function saveName() {
  const name = document.getElementById("player-name").value.trim();
  const message = document.getElementById("name-message");

  if (name.length < 2) {
    message.textContent = "Please type at least 2 letters.";
    message.className = "msg-error";
    return;
  }

  const profile = { name: name, gamesPlayed: 0, bestPercent: getBestScore() };

  try {
    await savePlayerProfile(currentUser.uid, profile);
  } catch (error) {
    console.log("Could not save profile:", error);
    message.textContent = "Could not save. Check your internet and try again.";
    message.className = "msg-error";
    return;
  }

  currentPlayer = profile;
  enterHome();
}

async function updatePlayerStats(percent) {
  currentPlayer.gamesPlayed = currentPlayer.gamesPlayed + 1;
  if (percent > currentPlayer.bestPercent) {
    currentPlayer.bestPercent = percent;
  }

  if (currentPlayer.offline) {
    return;
  }

  try {
    await savePlayerProfile(currentUser.uid, currentPlayer);
  } catch (error) {
    console.log("Could not save stats:", error);
  }
}

async function trySignIn(signInFunction) {
  const message = document.getElementById("signin-message");
  message.textContent = "";

  try {
    await signInFunction();
  } catch (error) {
    console.log("Sign-in problem:", error);
    message.textContent = "Could not sign in. Please try again.";
  }
}

// ----- Leaderboard -----
async function submitScore(correct, total) {
  const status = document.getElementById("leaderboard-status");

  if (total < MIN_QUESTIONS_FOR_LEADERBOARD) {
    status.textContent =
      `Play at least ${MIN_QUESTIONS_FOR_LEADERBOARD} questions to join the leaderboard.`;
    return;
  }
  if (currentPlayer.offline) {
    status.textContent = "Offline: score not sent.";
    return;
  }

  status.textContent = "Sending score...";
  try {
    await saveScoreToCloud(currentUser.uid, currentPlayer.name, correct, total);
    status.textContent = "Score sent to the leaderboard!";
  } catch (error) {
    console.log("Could not send score:", error);
    status.textContent = "Could not send your score to the leaderboard.";
  }
}

async function showLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  const message = document.getElementById("leaderboard-message");
  list.innerHTML = "";
  message.textContent = "Loading...";
  showScreen("leaderboard-screen");

  try {
    const topScores = await loadTopScores();

    if (topScores.length === 0) {
      message.textContent = "No scores yet. Be the first!";
      return;
    }
    message.textContent = "";

    topScores.forEach(function (entry) {
      const item = document.createElement("li");
      item.textContent = `${entry.name} - ${entry.points} points`;
      if (currentUser && entry.uid === currentUser.uid) {
        item.classList.add("me");
      }
      list.appendChild(item);
    });
  } catch (error) {
    console.log("Could not load the leaderboard:", error);
    message.textContent = "Could not load the leaderboard.";
  }
}

// ----- Shared questions (saved in the cloud) -----
let customQuestions = [];

async function loadCustomQuestions() {
  const status = document.getElementById("cloud-status");
  status.textContent = "Loading shared questions...";

  try {
    const cloudQuestions = await loadQuestionsFromCloud();
    customQuestions = cloudQuestions;
    customQuestions.forEach(function (q) {
      questions.push(q);
    });
    status.textContent = `Shared questions loaded: ${cloudQuestions.length}`;
  } catch (error) {
    console.log("Could not load shared questions:", error);
    status.textContent = "Offline: using built-in questions only.";
  }
}

// ----- Setup screen -----
function getCategories() {
  const names = [];
  questions.forEach(function (q) {
    if (!names.includes(q.category)) {
      names.push(q.category);
    }
  });
  return names;
}

function buildChoiceButtons(boxId, labels, onPick) {
  const box = document.getElementById(boxId);
  box.innerHTML = "";

  labels.forEach(function (label, i) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.classList.add("choice-btn");
    if (i === 0) {
      btn.classList.add("selected");
    }

    btn.addEventListener("click", function () {
      box.querySelectorAll(".choice-btn").forEach(function (otherBtn) {
        otherBtn.classList.remove("selected");
      });
      btn.classList.add("selected");
      onPick(label);
    });

    box.appendChild(btn);
  });
}

function buildSetupScreen() {
  buildChoiceButtons(
    "category-buttons",
    ["All"].concat(getCategories()),
    function (label) {
      selectedCategory = label;
    }
  );
  buildChoiceButtons(
    "difficulty-buttons",
    ["All", "Easy", "Medium", "Hard"],
    function (label) {
      selectedDifficulty = label;
    }
  );
}

// ----- Editor screen -----
function showEditorMessage(text, isOk) {
  const message = document.getElementById("editor-message");
  message.textContent = text;
  if (isOk) {
    message.className = "msg-ok";
  } else {
    message.className = "msg-error";
  }
}

function refreshCategoryList() {
  const list = document.getElementById("category-list");
  list.innerHTML = "";
  getCategories().forEach(function (name) {
    const option = document.createElement("option");
    option.value = name;
    list.appendChild(option);
  });
}

function renderCustomList() {
  const list = document.getElementById("custom-list");
  list.innerHTML = "";

  if (customQuestions.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No questions of your own yet.";
    list.appendChild(empty);
    return;
  }

  customQuestions.forEach(function (q) {
    const item = document.createElement("li");
    item.textContent = `${q.question} (${q.category}, ${q.difficulty})`;
    list.appendChild(item);
  });
}

async function saveNewQuestion() {
  const text = document.getElementById("new-question").value.trim();
  const category = document.getElementById("new-category").value.trim();
  const difficulty = document.getElementById("new-difficulty").value;
  const answer = Number(document.getElementById("new-answer").value);

  const options = [];
  for (let i = 0; i < 4; i++) {
    options.push(document.getElementById(`new-option-${i}`).value.trim());
  }

  if (text === "" || category === "" || options.includes("")) {
    showEditorMessage("Please fill in every box.", false);
    return;
  }

  const newQuestion = {
    category: category,
    difficulty: difficulty,
    question: text,
    options: options,
    answer: answer,
    createdBy: currentUser.uid
  };

  showEditorMessage("Saving...", true);
  try {
    newQuestion.id = await saveQuestionToCloud(newQuestion);
  } catch (error) {
    console.log("Could not save question:", error);
    showEditorMessage("Could not save. Check your internet and try again.", false);
    return;
  }

  customQuestions.push(newQuestion);
  questions.push(newQuestion);

  document.getElementById("new-question").value = "";
  document.getElementById("new-category").value = "";
  for (let i = 0; i < 4; i++) {
    document.getElementById(`new-option-${i}`).value = "";
  }
  document.getElementById("new-answer").value = "0";
  document.getElementById("new-difficulty").value = "easy";

  refreshCategoryList();
  renderCustomList();
  showEditorMessage("Question saved to the cloud!", true);
}

// ----- Filter and shuffle -----
function getFilteredQuestions() {
  return questions.filter(function (q) {
    const categoryOk =
      selectedCategory === "All" || q.category === selectedCategory;
    const difficultyOk =
      selectedDifficulty === "All" ||
      q.difficulty === selectedDifficulty.toLowerCase();
    return categoryOk && difficultyOk;
  });
}

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

// ----- Show one question -----
function showQuestion(index) {
  const q = activeQuestions[index];
  answered = false;

  document.getElementById("question-number").textContent =
    `Question ${index + 1} of ${activeQuestions.length}`;
  document.getElementById("question-category").textContent =
    `${q.category} - ${q.difficulty}`;
  document.getElementById("live-score").textContent = `Score: ${score}`;
  document.getElementById("question-text").textContent = q.question;

  const nextBtn = document.getElementById("next-btn");
  nextBtn.classList.add("hidden");
  if (index === activeQuestions.length - 1) {
    nextBtn.textContent = "See Results";
  } else {
    nextBtn.textContent = "Next";
  }

  const optionsBox = document.getElementById("options");
  optionsBox.innerHTML = "";

  q.options.forEach(function (optionText, i) {
    const btn = document.createElement("button");
    btn.textContent = optionText;
    btn.classList.add("option-btn");
    btn.addEventListener("click", function () {
      checkAnswer(i, btn);
    });
    optionsBox.appendChild(btn);
  });

  startTimer();
}

// ----- Check the chosen answer -----
function checkAnswer(chosenIndex, clickedBtn) {
  if (answered) {
    return;
  }

  if (chosenIndex === activeQuestions[currentIndex].answer) {
    score = score + 1;
  } else {
    clickedBtn.classList.add("wrong");
  }

  revealCorrectAnswer();
  endQuestion();
}

// ----- Result screen -----
function showResult() {
  stopTimer();
  const total = activeQuestions.length;
  const percent = Math.round((score / total) * 100);

  document.getElementById("final-score").textContent =
    `${score} out of ${total} (${percent}%)`;

  const message = document.getElementById("high-score-message");
  if (percent > currentPlayer.bestPercent) {
    message.textContent = "New high score!";
  } else {
    message.textContent = "";
  }

  updatePlayerStats(percent);
  submitScore(score, total);

  document.getElementById("best-score").textContent = `${currentPlayer.bestPercent}%`;
  document.getElementById("games-played").textContent = currentPlayer.gamesPlayed;
  showBestOnHome();
  showScreen("result-screen");
}

// ----- Start a new game -----
function startQuiz() {
  const filtered = getFilteredQuestions();
  const message = document.getElementById("setup-message");

  if (filtered.length === 0) {
    message.textContent = "No questions match. Try another choice.";
    return;
  }

  message.textContent = "";
  activeQuestions = shuffle(filtered).slice(0, MAX_QUESTIONS);
  currentIndex = 0;
  score = 0;
  showQuestion(currentIndex);
  showScreen("quiz-screen");
}

// ----- Buttons -----
document.getElementById("start-btn").addEventListener("click", function () {
  selectedCategory = "All";
  selectedDifficulty = "All";
  buildSetupScreen();
  showScreen("setup-screen");
});

document.getElementById("begin-btn").addEventListener("click", startQuiz);

document.getElementById("setup-back-btn").addEventListener("click", function () {
  showScreen("home-screen");
});

document.getElementById("next-btn").addEventListener("click", function () {
  if (currentIndex < activeQuestions.length - 1) {
    currentIndex = currentIndex + 1;
    showQuestion(currentIndex);
  } else {
    showResult();
  }
});

document.getElementById("home-btn").addEventListener("click", function () {
  showScreen("home-screen");
});

document.getElementById("editor-btn").addEventListener("click", function () {
  refreshCategoryList();
  renderCustomList();
  document.getElementById("editor-message").textContent = "";
  showScreen("editor-screen");
});

document.getElementById("save-question-btn").addEventListener("click", saveNewQuestion);

document.getElementById("editor-back-btn").addEventListener("click", function () {
  showScreen("home-screen");
});

document.getElementById("google-btn").addEventListener("click", function () {
  trySignIn(signInWithGoogle);
});

document.getElementById("guest-btn").addEventListener("click", function () {
  trySignIn(signInAsGuest);
});

document.getElementById("save-name-btn").addEventListener("click", saveName);

document.getElementById("signout-btn").addEventListener("click", async function () {
  if (currentUser.isAnonymous) {
    const sure = confirm("Guest accounts cannot be recovered after signing out. Sign out anyway?");
    if (!sure) {
      return;
    }
  }
  await signOutPlayer();
});

document.getElementById("leaderboard-btn").addEventListener("click", showLeaderboard);

document.getElementById("view-leaderboard-btn").addEventListener("click", showLeaderboard);

document.getElementById("leaderboard-back-btn").addEventListener("click", function () {
  showScreen("home-screen");
});

// ----- Run when the page opens -----
loadCustomQuestions();

watchAuth(function (user) {
  if (user) {
    handleSignedIn(user);
  } else {
    currentUser = null;
    currentPlayer = null;
    showScreen("signin-screen");
  }
});

// ----- Make the app installable and work offline -----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("service-worker.js").catch(function (error) {
      console.log("Service worker failed:", error);
    });
  });
}
