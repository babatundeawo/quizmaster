# QuizMaster

A quiz and trivia game with categories, timers, a question editor, player profiles, and an online leaderboard. Built step by step as a capstone project with Techbase Consultant Services.

**Play it:** https://YOUR-USERNAME.github.io/quizmaster/

## Features
- Choose a category and difficulty
- Timed questions and a live score
- Question Editor: add your own questions, shared with everyone
- Player names, stats, and an online top-10 leaderboard
- Installs on a phone and opens even without internet

## Built with
HTML, CSS, JavaScript, GitHub, Firebase (Firestore and Authentication), and a Progressive Web App (manifest and service worker).

## Install on a phone
- **Android (Chrome):** open the link, tap the menu, then Install app.
- **iPhone (Safari):** open the link, tap Share, then Add to Home Screen.

## What I learned
(Write three or four sentences here in your own words.)

## Ideas for the future
- Sound effects and animations
- A progress chart and badges
- More question types (pictures, true or false)

---

# Teacher notes: using this reference build

This folder is the finished project as it stands at the end of Session 12 of the QuizMaster curriculum. Use it to check the student's work or to recover a broken project. The student should still type his own code session by session.

## What is in the folder

| File | What it does |
|------|--------------|
| `index.html` | All screens (loading, sign-in, name, home, setup, editor, quiz, result, leaderboard) |
| `css/style.css` | All styles, with colour variables at the top |
| `js/questions.js` | 24 built-in starter questions in 4 categories |
| `js/app.js` | The game logic (ES module) |
| `js/firebase-config.js` | Firebase connection, questions, players, and scores |
| `manifest.json` | Makes the app installable |
| `service-worker.js` | Keeps a copy of the app for offline use |
| `firestore.rules` | Reference copy of the security rules |
| `assets/images/icons/` | **Placeholder** icons (192 and 512 pixels). Replace them with the student's own |

## Before it will work

1. **Add your own Firebase config.** Open `js/firebase-config.js` and replace the `PASTE_...` values with the `firebaseConfig` object from your own Firebase project (Project settings, Your apps, Web app). The project needs:
   - **Authentication** with the **Anonymous** sign-in method switched on (and **Google** if used), and `YOUR-USERNAME.github.io` added under Authorized domains.
   - **Firestore database** created in the **Standard** edition.
   - The rules from `firestore.rules` pasted into Firestore, Rules, and published.
2. **Run it with Live Server** (the app uses JavaScript modules, so double-clicking `index.html` will not work), or publish it with GitHub Pages.
3. **Keep the Firebase SDK version** (`12.19.0` in the import lines) the same in all three imports.

## Notes

- This build does not include the student's own extras (Play Again, About screen, Change name, Delete button, medals). Those are exercises and homework.
- The questions the player adds in the editor are saved in Firebase, not in `questions.js`.
- If you change `MAX_QUESTIONS` or `MIN_QUESTIONS_FOR_LEADERBOARD` in `js/app.js`, change the numbers in the `scores` rule too.
- If you change any file name in the project, update `FILES_TO_CACHE` in `service-worker.js` and bump `CACHE_NAME` (for example to `quizmaster-v2`).
- Never put passwords or service account files in this project. The web config is public by design; the security rules protect the data.
