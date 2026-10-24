// QuizMaster cloud functions: Firestore (data) and Authentication (players).
// The project settings come from firebase-env.js, which the build fills in.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-env.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ----- Questions -----
export async function saveQuestionToCloud(question) {
  const docRef = await addDoc(collection(db, "questions"), question);
  return docRef.id;
}

export async function loadQuestionsFromCloud() {
  const snapshot = await getDocs(collection(db, "questions"));
  const list = [];
  snapshot.forEach(function (document) {
    const data = document.data();
    data.id = document.id;
    list.push(data);
  });
  return list;
}

export async function deleteQuestionFromCloud(id) {
  await deleteDoc(doc(db, "questions", id));
}

// ----- Players -----
export function watchAuth(callback) {
  onAuthStateChanged(auth, callback);
}

export async function signInAsGuest() {
  await signInAnonymously(auth);
}

export async function signInWithGoogle() {
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOutPlayer() {
  await signOut(auth);
}

export async function loadPlayerProfile(uid) {
  const snapshot = await getDoc(doc(db, "players", uid));
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
}

export async function savePlayerProfile(uid, profile) {
  await setDoc(doc(db, "players", uid), profile);
}

// ----- Scores -----
export async function saveScoreToCloud(uid, name, correct, total, difficulty, category) {
  await addDoc(collection(db, "scores"), {
    uid: uid,
    name: name,
    points: correct * 10,
    correct: correct,
    total: total,
    difficulty: difficulty,
    category: category,
    createdAt: serverTimestamp()
  });
}

// level is "all", "easy", "medium", "hard" or "mixed".
// Filtering by level and sorting by points together needs a one-time
// Firestore composite index: collection "scores", fields difficulty (Ascending)
// and points (Descending). See docs/FIREBASE_LOGIN_SETUP.md.
export async function loadTopScores(level) {
  let topQuery;
  if (level === "all") {
    topQuery = query(collection(db, "scores"), orderBy("points", "desc"), limit(10));
  } else {
    topQuery = query(
      collection(db, "scores"),
      where("difficulty", "==", level),
      orderBy("points", "desc"),
      limit(10)
    );
  }

  const snapshot = await getDocs(topQuery);
  const list = [];
  snapshot.forEach(function (document) {
    list.push(document.data());
  });
  return list;
}
