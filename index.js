import { words as TEXT } from "./words.js";

const d = document;

const $time = d.querySelector(`time`);
const $paragraph = d.querySelector(`p`);
const $input = d.querySelector(`input`);
const $game = d.querySelector("#game");
const $results = d.querySelector("#results");
const $wpm = $results.querySelector("#results-WPM");
const $accuracy = $results.querySelector("#results-accuracy");
const $reload = d.querySelector("#btn-reload");

const INITIAL_TIME = 30;

let words = [];

let currentTime = 0;

initGame();
initEvents();

function initGame() {
  $game.style.display = `flex`;
  $results.style.display = `none`;
  $input.value = "";
  words = TEXT.toSorted(() => Math.random() - 0.5).slice(0, 40);
  currentTime = INITIAL_TIME;
  $time.textContent = currentTime;

  $paragraph.innerHTML = words
    .map((word, index) => {
      const letters = word.split("");

      return `
    <span class="word">
    ${letters.map((letter) => `<span class="letter">${letter}</span>`).join("")}
    </span>
    `;
    })
    .join("");

  const $firstWord = $paragraph.querySelector(".word");

  $firstWord.classList.add("active");

  $firstWord.querySelector(".letter").classList.add("active");

  const intervalId = setInterval(() => {
    currentTime--;
    $time.textContent = currentTime;

    if (currentTime === 0) {
      clearInterval(intervalId);
      gameOver();
    }
  }, 1000);
}
function initEvents() {
  d.addEventListener("keydown", (e) => {
    $input.focus();
  });
  $input.addEventListener("keydown", onkeyDown);
  $input.addEventListener("keyup", onkeyUp);
  $reload.addEventListener("click", initGame);
}

function onkeyDown(e) {
  const $currentWord = $paragraph.querySelector(".word.active");
  const $currentLetter = $currentWord.querySelector(".letter.active");

  const { key } = e;

  if (key === " ") {
    e.preventDefault();

    const $nextWord = $currentWord.nextElementSibling;
    const $nextLetter = $nextWord.querySelector(".letter");

    $currentWord.classList.remove("active");
    $currentLetter.classList.remove("active");

    $nextWord.classList.add("active");
    $nextLetter.classList.add("active");

    $input.value = "";

    const $hasMissedLetters =
      $currentWord.querySelectorAll(`.letter:not(.correct)`).length > 0;

    const classToAdd = $hasMissedLetters ? `marked` : `correct`;

    $currentWord.classList.add(classToAdd);
    return;
  }

  if (key === "Backspace") {
    const $prevWord = $currentWord.previousElementSibling;
    const $prevtLetter = $currentLetter.previousElementSibling;

    if (!$prevtLetter && !$prevWord) {
      e.preventDefault();
      return;
    }
    const $wordMarked = $paragraph.querySelector(`.word.marked`);

    if ($wordMarked && !$prevtLetter) {
      e.preventDefault();
      $prevWord.classList.remove("marked");
      $prevWord.classList.add("active");

      const $letterToGo = $prevWord.querySelector(`.letter:last-child`);

      $currentLetter.classList.remove(`active`);
      $letterToGo.classList.add(`active`);

      $input.value = [
        ...$prevWord.querySelectorAll(`.letter.correct , .letter.incorrect`),
      ]
        .map(($el) => {
          return $el.classList.contains(`correct`) ? $el.innerText : `*`;
        })
        .join("");
    }
  }
}
function onkeyUp() {
  const $currentWord = $paragraph.querySelector(".word.active");
  const $currentLetter = $currentWord.querySelector(".letter.active");

  const currentWord = $currentWord.innerText.trim();

  $input.maxLength = currentWord.length;

  const $allLetters = $currentWord.querySelectorAll(`.letter`);

  $allLetters.forEach(($letter) => {
    $letter.classList.remove(`incorrect`, `correct`);
  });

  $input.value.split("").forEach((el, i) => {
    const $letter = $allLetters[i];
    const letterCheck = currentWord[i];

    const isCorrect = el === letterCheck;

    const letterClass = isCorrect ? `correct` : `incorrect`;

    $letter.classList.add(letterClass);
  });

  $currentLetter.classList.remove("active", "is-last");

  const inputLenght = $input.value.length;

  const $nextActiveLetter = $allLetters[inputLenght];

  if ($nextActiveLetter) {
    $nextActiveLetter.classList.add("active");
  } else {
    $currentLetter.classList.add("active", "is-last");
  }

  // console.log({ value: $input.value, currentWord });
}

function gameOver() {
  $game.style.display = `none`;
  $results.style.display = `flex`;

  const correctWords = $paragraph.querySelectorAll(".word.correct").length;
  const correctLetters = $paragraph.querySelectorAll(".letter.correct").length;
  const incorrectLetters =
    $paragraph.querySelectorAll(".letter.incorrect").length;

  const totalLetters = correctLetters + incorrectLetters;

  const accuracy = totalLetters > 0 ? (correctLetters / totalLetters) * 100 : 0;

  const wpm = (correctWords * 60) / INITIAL_TIME;

  $wpm.textContent = wpm;
  $accuracy.textContent = `${accuracy.toFixed(2)}%`;
}
