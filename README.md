# QuizMaster

A quiz and trivia game with categories, timers, a question editor, player profiles, and an online leaderboard. Built step by step as a capstone project with Techbase Consultant Services.

**Play it:** https://YOUR-USERNAME.github.io/quizmaster/

## Features
- Choose a category and difficulty
- Timed questions and a live score
- Question Editor: add your own questions, shared with everyone
- Player names, stats, and an online top-10 leaderboard that can be filtered by difficulty level (All, Easy, Medium, Hard, Mixed)
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
| `js/questions.js` | 400 built-in questions: 100 in each of 4 categories (34 easy, 33 medium, 33 hard each) |
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
3. **Create the leaderboard index (one time).** The Easy, Medium, Hard and Mixed leaderboard tabs sort and filter at the same time, and Firestore needs an index for that. The All tab works without it.
   - In the Firebase console open **Firestore database, Indexes, Composite, Add index**.
   - Collection ID: `scores`. Add field `difficulty` (Ascending), then field `points` (Descending). Query scope: **Collection**. Click **Create**.
   - Wait a few minutes until the status says **Enabled**.
   - Shortcut: if you open a level tab before the index exists, the browser console (F12) shows an error with a link. Opening that link pre-fills the same index.
4. **Keep the Firebase SDK version** (`12.19.0` in the import lines) the same in all three imports.

## How the leaderboard shows difficulty

- Every score is saved with the **difficulty** of the game (`easy`, `medium`, `hard`, or `mixed` when the player chose All) and the **category**.
- The Leaderboard screen has tabs: **All**, **Easy**, **Medium**, **Hard**, **Mixed**. Each row shows the nickname, the points, a coloured level badge, and the category.
- Points stay the same (correct answers x 10) at every level, so each level has its **own** top 10. A perfect Easy game does not beat a perfect Hard game, because they are on different boards.
- Scores saved before this change have no difficulty and are shown as Mixed.
- After updating from an older version, **publish the new `firestore.rules`** again. The scores rule now requires `difficulty` and `category`, so the old rules and the new app will not agree until you do.

## Notes

- This build does not include the student's own extras (Play Again, About screen, Change name, Delete button, medals). Those are exercises and homework.
- The questions the player adds in the editor are saved in Firebase, not in `questions.js`.
- If you change `MAX_QUESTIONS` or `MIN_QUESTIONS_FOR_LEADERBOARD` in `js/app.js`, change the numbers in the `scores` rule too.
- If you change any file name in the project, update `FILES_TO_CACHE` in `service-worker.js` and bump `CACHE_NAME` (for example to `quizmaster-v2`).
- Never put passwords or service account files in this project. The web config is public by design; the security rules protect the data.
