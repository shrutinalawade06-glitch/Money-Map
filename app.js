/* ================= SPEECH SETUP ================= */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false; // Stable mode
recognition.lang = "en-IN";

let isListening = false;

/* ================= MONTH KEY ================= */

function getMonthKey() {
  const now = new Date();
  return `moneyMap-${now.getFullYear()}-${now.getMonth()+1}`;
}

/* ================= SAFE START ================= */

function safeStart() {
  if (!isListening) {
    try { recognition.start(); } catch (e) {}
  }
}

recognition.onstart = () => {
  isListening = true;
  document.querySelector(".mic-animation").style.opacity = "1";
};

recognition.onend = () => {
  isListening = false;
  document.querySelector(".mic-animation").style.opacity = "0.4";
  if (state !== "IDLE") safeStart();
};

/* ================= GLOBAL STATE ================= */

let state = "IDLE";
let expenses = [];
let currentCategory = "";
let budget = null;
let chart = null;

/* ================= STORAGE ================= */

function saveData() {
  localStorage.setItem(
    getMonthKey(),
    JSON.stringify({ expenses, budget })
  );
}

function loadData() {
  const stored = localStorage.getItem(getMonthKey());
  if (stored) {
    const data = JSON.parse(stored);
    expenses = data.expenses || [];
    budget = data.budget || null;
  }
  updateSummary();
  updateChart();
}

/* ================= SPEAK ================= */

function speak(text) {
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  speechSynthesis.speak(utter);
  document.getElementById("status").innerText = text;
}

/* ================= NUMBER EXTRACTION ================= */

function extractAmount(text) {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

/* ================= VOICE LOGIC ================= */

recognition.onresult = function(event) {

  const speech =
    event.results[event.results.length - 1][0].transcript
      .toLowerCase().trim();

  console.log("Heard:", speech, "State:", state);

  const amount = extractAmount(speech);

  const isFinish = /finish|done|stop|complete/.test(speech);
  const isAdd = /add|another|continue|more/.test(speech);
  const isYes = /yes|yeah|sure/.test(speech);
  const isNo = /no|not/.test(speech);

  /* CATEGORY */
  if (state === "CATEGORY") {
    currentCategory = speech;
    state = "AMOUNT";
    speak("Tell the amount.");
    return;
  }

  /* AMOUNT */
  if (state === "AMOUNT") {

    if (!amount) {
      speak("Please say a valid amount.");
      return;
    }

    expenses.push({
      category: currentCategory,
      amount,
      date: new Date().toLocaleDateString()
    });

    saveData();
    updateSummary();
    updateChart();

    state = "ADD_MORE";
    speak("Expense added. Say add another expense or finish.");
    return;
  }

  /* ADD MORE */
  if (state === "ADD_MORE") {

    if (isFinish) {
      state = "ASK_BUDGET";
      speak("Do you want to set a budget and hear summary?");
      return;
    }

    if (isAdd) {
      state = "CATEGORY";
      speak("Tell your category.");
      return;
    }

    speak("Please say add another expense or finish.");
    return;
  }

  /* ASK BUDGET */
  if (state === "ASK_BUDGET") {

    if (isYes) {
      state = "SET_BUDGET";
      speak("Tell your budget amount.");
      return;
    }

    if (isNo) {
      giveSummary();
      return;
    }

    speak("Please say yes or no.");
    return;
  }

  /* SET BUDGET */
  if (state === "SET_BUDGET") {

    if (!amount) {
      speak("Please say a valid budget amount.");
      return;
    }

    budget = amount;
    saveData();
    giveSummary();
    return;
  }

  /* REPEAT */
  if (state === "REPEAT") {

    if (isYes) {
      giveSummary();
      return;
    }

    if (isNo) {
      speak("Session finished.");
      state = "IDLE";
      recognition.stop();
      return;
    }

    speak("Please say yes or no.");
  }
};

/* ================= SUMMARY ================= */

function giveSummary() {

  let total = expenses.reduce((sum, e) => sum + e.amount, 0);

  let remaining = budget !== null ? budget - total : "not set";

  let highestCategory = "";
  let highestAmount = 0;

  expenses.forEach(e => {
    if (e.amount > highestAmount) {
      highestAmount = e.amount;
      highestCategory = e.category;
    }
  });

  speak(
    `Total spending is ${total} rupees. ` +
    `Highest spending category is ${highestCategory}. ` +
    `Remaining budget is ${remaining}. ` +
    `Do you want me to repeat summary?`
  );

  state = "REPEAT";
}

function updateSummary() {

  let total = 0;
  let text = "Expense Summary:\n\n";

  expenses.forEach((e, i) => {
    total += e.amount;
    text += `${i+1}. ${e.category} - ₹${e.amount} (${e.date})\n`;
  });

  text += `\nTotal: ₹${total}`;

  if (budget !== null) {
    text += `\nBudget: ₹${budget}`;
    text += `\nRemaining: ₹${budget - total}`;
  }

  document.getElementById("summary").innerText = text;
}

/* ================= CHART ================= */

function updateChart() {

  const ctx = document.getElementById("expenseChart");
  if (!ctx) return;

  let totals = {};
  expenses.forEach(e => {
    totals[e.category] =
      (totals[e.category] || 0) + e.amount;
  });

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(totals),
      datasets: [{
        data: Object.values(totals),
        backgroundColor: [
          "#00f5ff","#ff416c","#ffd700",
          "#8a2be2","#00ff94","#ff9800"
        ]
      }]
    },
    options: {
      responsive: false,
      cutout: "60%",
      plugins: { legend: { display: false } }
    }
  });
}

/* ================= DOWNLOAD REPORT ================= */

document.getElementById("downloadBtn").onclick = () => {

  let text = document.getElementById("summary").innerText;

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = `MoneyMap_Report.txt`;
  link.click();
};

/* ================= BUTTONS ================= */

document.getElementById("startBtn").onclick = () => {
  state = "CATEGORY";
  speak("Welcome to Money Map. Tell your category.");
  safeStart();
};

document.getElementById("resetBtn").onclick = () => {
  localStorage.removeItem(getMonthKey());
  expenses = [];
  budget = null;
  updateSummary();
  updateChart();
  speak("Current month data cleared.");
};

window.onload = loadData;



