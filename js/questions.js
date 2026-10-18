// All the built-in quiz questions live here.
// answer = the position (0, 1, 2 or 3) of the correct option.
// Questions that players add in the editor are saved in Firebase, not here.
const questions = [
  // ----- Science -----
  {
    category: "Science",
    difficulty: "easy",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "easy",
    question: "Which part of the body pumps blood around the body?",
    options: ["Brain", "Heart", "Lungs", "Stomach"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "What gas do plants take in from the air?",
    options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "medium",
    question: "At what temperature does water boil at sea level (in degrees Celsius)?",
    options: ["90", "100", "110", "120"],
    answer: 1
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "What is the SI unit of force?",
    options: ["Joule", "Watt", "Newton", "Pascal"],
    answer: 2
  },
  {
    category: "Science",
    difficulty: "hard",
    question: "About how long does light from the Sun take to reach Earth?",
    options: ["8 seconds", "8 minutes", "8 hours", "8 days"],
    answer: 1
  },

  // ----- Geography -----
  {
    category: "Geography",
    difficulty: "easy",
    question: "What is the capital city of Nigeria?",
    options: ["Lagos", "Kano", "Abuja", "Ibadan"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "easy",
    question: "Which is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    answer: 3
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "Which river is the longest in Africa?",
    options: ["Niger", "Congo", "Nile", "Zambezi"],
    answer: 2
  },
  {
    category: "Geography",
    difficulty: "medium",
    question: "What is the capital city of Ghana?",
    options: ["Kumasi", "Accra", "Tamale", "Takoradi"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which is the smallest country in the world by area?",
    options: ["Monaco", "Vatican City", "San Marino", "Malta"],
    answer: 1
  },
  {
    category: "Geography",
    difficulty: "hard",
    question: "Which is the largest hot desert in the world?",
    options: ["Gobi", "Kalahari", "Sahara", "Arabian"],
    answer: 2
  },

  // ----- Maths -----
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 7 x 8?",
    options: ["54", "56", "63", "48"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "easy",
    question: "What is 100 divided by 4?",
    options: ["20", "25", "30", "50"],
    answer: 1
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is the square root of 144?",
    options: ["10", "11", "12", "14"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "medium",
    question: "What is 15% of 200?",
    options: ["20", "25", "30", "35"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is 2 to the power of 10?",
    options: ["512", "1000", "1024", "2048"],
    answer: 2
  },
  {
    category: "Maths",
    difficulty: "hard",
    question: "What is the next prime number after 13?",
    options: ["15", "16", "17", "19"],
    answer: 2
  },

  // ----- Technology -----
  {
    category: "Technology",
    difficulty: "easy",
    question: "Which language is used to style web pages?",
    options: ["HTML", "CSS", "Python", "SQL"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "easy",
    question: "What does CPU stand for?",
    options: [
      "Central Processing Unit",
      "Computer Personal Unit",
      "Central Program Utility",
      "Core Processing Update"
    ],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which HTML tag creates the largest heading?",
    options: ["<h6>", "<h1>", "<head>", "<header>"],
    answer: 1
  },
  {
    category: "Technology",
    difficulty: "medium",
    question: "Which symbols start a one-line comment in JavaScript?",
    options: ["//", "#", "<!--", "**"],
    answer: 0
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which JavaScript keyword declares a variable that cannot be reassigned?",
    options: ["let", "var", "const", "static"],
    answer: 2
  },
  {
    category: "Technology",
    difficulty: "hard",
    question: "Which array method adds an item to the end of an array?",
    options: ["pop", "push", "shift", "slice"],
    answer: 1
  }
];
