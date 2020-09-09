(function () {
  // Functions
  function buildQuiz() {
    // variable to store the HTML output
    const output = [];

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // variable to store the list of possible answers
      const answers = [];

      // and for each available answer...
      for (letter in currentQuestion.answers) {
        // ...add an HTML radio button
        answers.push(
          `<label>
                <input type="radio" name="question${questionNumber}" value="${letter}">
                ${letter} :
                ${currentQuestion.answers[letter]}
              </label>`
        );
      }

      // add this question and its answers to the output
      output.push(
        `<div class="slide">
              <div class="question"> ${currentQuestion.question} </div>
              <div class="answers"> ${answers.join("")} </div>
            </div>`
      );
    });

    // finally combine our output list into one string of HTML and put it on the page
    quizContainer.innerHTML = output.join("");
  }

  function showResults() {
    // gather answer containers from our quiz
    const answerContainers = quizContainer.querySelectorAll(".answers");

    // keep track of user's answers
    let numCorrect = 0;

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // find selected answer
      const answerContainer = answerContainers[questionNumber];
      const selector = `input[name=question${questionNumber}]:checked`;
      const userAnswer = (answerContainer.querySelector(selector) || {}).value;

      // if answer is correct
      if (userAnswer === currentQuestion.correctAnswer) {
        // add to the number of correct answers
        numCorrect++;

        // color the answers green
        answerContainers[questionNumber].style.color = "lightgreen";
      }
      // if answer is wrong or blank
      else {
        // color the answers red
        answerContainers[questionNumber].style.color = "red";
      }
    });

    // show number of correct answers out of total
    resultsContainer.innerHTML = `转到控制台`;
    hint.innerHTML = `If you are <strong><span style="color:red">STUCK</span></strong> at this page,
      Post a screenshot on Instagram tagging
      <strong><span style="color:blue">@dsc_nit.agt</span></strong> with the message
      <strong><span style="color:green">#DSC_CHALLANGE2</span></strong> and then DM us to receive a HINT.`;

    console.log(
      "You made it to the HOLY console... yet again\n\n*********READ THE INSTRUCTIONS PROPERLY BEFORE MOVING FURTHER***********\n\n\n"
    );
    console.log("Total correct: " + numCorrect + " ");
    console.log("Here is your private key: " + numCorrect+""+Math.random());
    console.log("Here is your public key: " + 10 * Math.random());

    console.log("\n\n How to use it? \n\n");
    console.log(
      "Post this screenshot on your Instagram, tagging @dsc_nit.agt,\nand in the story write 'Successfully got the public key< first four digit of your public key>' \n"
    );

    console.log("Next apply at this link mentioned below\n  ");
    console.log(
      "In the key option paste your PRIVATE key followed by your InstaID"
    );
    console.log(
      "Sharing any information about how you accessed this page will lead to DISQUALIFICATION from DSC"
    );
    console.log(
      "May the source be with you \n \n Created by: @__winter.soldier__(Instagram)  WinterSoldier13 (GitHub)"
    );
    console.log(
      "\n\n\nApplication Link:  https://github.com/WinterSoldier13/Daily-DSA/blob/master/DSC_NITA_Challange.ipynb      "
    );
    alert("Great Just keep your eyes open for the changes");
  }

  function showSlide(n) {
    slides[currentSlide].classList.remove("active-slide");
    slides[n].classList.add("active-slide");
    currentSlide = n;
    if (currentSlide === 0) {
      previousButton.style.display = "none";
    } else {
      previousButton.style.display = "inline-block";
    }
    if (currentSlide === slides.length - 1) {
      nextButton.style.display = "none";
      submitButton.style.display = "inline-block";
    } else {
      nextButton.style.display = "inline-block";
      submitButton.style.display = "none";
    }
  }

  function showNextSlide() {
    showSlide(currentSlide + 1);
  }

  function showPreviousSlide() {
    showSlide(currentSlide - 1);
  }

  // Variables
  const quizContainer = document.getElementById("quiz");
  const resultsContainer = document.getElementById("results");
  const hint = document.getElementById("hint");
  const submitButton = document.getElementById("submit");
  const myQuestions = [
    {
      question: "Captain America or Iron Man?",
      answers: {
        a: "With Cap till I die",
        b: "The dude with the metal thing",
        c: "Shaktiman",
      },
      correctAnswer: "a",
    },
    {
      question: "Which one of these is a JavaScript package manager?",
      answers: {
        a: "Node.js",
        b: "TypeScript",
        c: "npm",
      },
      correctAnswer: "c",
    },
    {
      question:
        "Which of the following data-structure is used to DEEP-CLONE a LinkedList in O(n) space?",
      answers: {
        a: "HASHSET",
        b: "HASHMAP",
        c: "ARRAY",
        d: "Directed Graphs",
      },
      correctAnswer: "b",
    },
    {
      question:
        "What is the best case TIME-Compexity of the best-version of Bubble Sort?",
      answers: {
        a: "O(n^2)",
        b: "O(n)",
        c: "O(nlog(n))",
        d: "O(log(n))",
      },
      correctAnswer: "b",
    },
    {
      question: "Is Dijkstra algorithm Greedy",
      answers: {
        a: "Yes, it is greedy",
        b: "Nope",
        c: "What is Dijkstra",
      },
      correctAnswer: "a",
    },
    {
      question: "Should Messi Leave Barca' ?",
      answers: {
        a: "Nah",
        b: "Nope",
        c: "Definetly No! :( ",
      },
      correctAnswer: "c",
    },
    {
      question: "Floyd Warshall algorithm is based on?",
      answers: {
        a: "Dynamic Programming",
        b: "Greedy",
        c: "Backtracking ",
      },
      correctAnswer: "a",
    },
    {
      question: "What does E in MERN stands for?",
      answers: {
        a: "Expresso",
        b: "Experience",
        c: "Express",
        d: "ESLint",
      },
      correctAnswer: "c",
    },
    {
      question: "Which of the following is needed to run Tensorflow on GPU?",
      answers: {
        a: "Virtual Kernel",
        b: "tensorGPU",
        c: "MultiThreading package manager",
        d: "CUDA and CuDnn",
      },
      correctAnswer: "d",
    },
    {
      question: "Which of these is NOT a Database?",
      answers: {
        a: "Firebase",
        b: "SEQUELsql",
        c: "mongoDB",
        d: "postGRE",
      },
      correctAnswer: "b",
    },
    {
      question: "What is the number of cores in Intel i7 8th generation?",
      answers: {
        a: "4",
        b: "8",
        c: "6",
        d: "10",
      },
      correctAnswer: "c",
    },
  ];

  // Kick things off
  buildQuiz();

  // Pagination
  const previousButton = document.getElementById("previous");
  const nextButton = document.getElementById("next");
  const slides = document.querySelectorAll(".slide");
  let currentSlide = 0;

  // Show the first slide
  showSlide(currentSlide);

  // Event listeners
  submitButton.addEventListener("click", showResults);
  previousButton.addEventListener("click", showPreviousSlide);
  nextButton.addEventListener("click", showNextSlide);
})();

alert("With great power comes great responsibility. Informing anyone about how you landed at this page will result in immediate DISQUALIFICATION of your IP. Don't ruin the fun :) ")
