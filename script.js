
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";     // Indian English
  msg.rate = 1;
  msg.volume = 1;
  window.speechSynthesis.speak(msg);
}
export let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
export let editIndex = -1;


export const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const totalAmount = document.getElementById("totalAmount");

// Save data to LocalStorage
export function saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

  displayExpenses();
    form.reset();




function displayExpenses() {
  expenseList.innerHTML = "";
  let total = 0;

  expenses.forEach((expense, index) => {
    total += expense.amount;

    const row = document.createElement("tr");
//add edit date and category in new
    row.innerHTML = `
      <td>${expense.date}</td> 
      <td>${expense.category}</td>
      <td>${expense.amount}</td>
      <td>${expense.note}</td>
      <td>
        <button onclick="editExpense(${index})">Edit</button>
        <button onclick="deleteExpense(${index})">Delete</button>
      </td>
    `;

    expenseList.appendChild(row);
  });

  totalAmount.textContent = total;
}

function deleteExpense(index) {// edit day 9
 expenses.splice(index, 1);
  displayExpenses();
}
// add new code in date and category
function editExpense(index) {
    document.getElementById("date").value = expenses[index].date;
    document.getElementById("category").value = expenses[index].category;
  document.getElementById("amount").value = expenses[index].amount;
  document.getElementById("note").value = expenses[index].note;
  editIndex = index;
}
//load expenses when page opens
displayExpenses();
function scanBill() {
  const fileInput = document.getElementById("billImage");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload a bill image first");
    return;
  }

  Tesseract.recognize(
    file,
    "eng",
    {
      logger: m => console.log(m)
    }
  ).then(({ data: { text } }) => {

    console.log("OCR TEXT:", text);

    // Find TOTAL amount (largest number usually)
    const matches = text.match(/\d+\.\d{2}/g);

    if (matches && matches.length > 0) {
      const amount = matches[matches.length - 1]; // last value
      document.getElementById("amount").value = amount;
      alert("Amount detected: ₹" + amount);
    } else {
      alert("Amount not detected. Enter manually.");
    }

  });
}function filterByMonth() {
  // Get selected month in YYYY-MM format
  let selectedMonth = document.getElementById("monthFilter").value; // this is already in YYYY-MM from input type="month"

  // Get all expenses from localStorage
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  // Filter expenses whose date starts with selectedMonth
  let monthlyExpenses = expenses.filter(exp => exp.date.startsWith(selectedMonth));

  // Calculate total
  let total = monthlyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // Display total
  document.getElementById("monthlyTotal").innerText =
    "Total Expense for " + selectedMonth + " : ₹" + total;
}
//this is for voice code
 window.onload = function () {
  speak(
    "Welcome to monthly expense tracker. " +
    "This website supports voice commands. " +
    "Press the speak button and say your expense details."
  );
};





/* ========= ACCESSIBILITY FEATURES FOR DISABLED USERS ========= */

/* VOICE INPUT: Add Expense by Speaking */
 function startVoiceExpense() {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Voice input not supported in this browser");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();

    recognition.onresult = function (event) {
        const text = event.results[0][0].transcript.toLowerCase();
        console.log("Voice:", text);

        let category = "general";
        let amount = 0;



        if (text.includes("food")) category = "food";
        else if (text.includes("travel")) category = "travel";
        else if (text.includes("shopping")) category = "shopping";
        else if (text.includes("medical")) category = "medical";

        const number = text.match(/\d+/);
        if (number) amount = Number(number[0]);

        if (amount === 0) {
            alert("Could not detect amount. Please try again.");
            return;
        }

        const today = new Date().toISOString().split("T")[0];

        expenses.push({
            date: today,
            category: category,
            amount: amount,
            note: "Added by voice"
        });

        localStorage.setItem("expenses", JSON.stringify(expenses));
        displayExpenses();

        speakText(`Expense added. ${amount} rupees for ${category}.`);
    };
}

//  CALCULATE MONTHLY TOTAL //
function getMonthlyTotal(year, month) {
    return expenses
        .filter(exp => {
            const d = new Date(exp.date);
            return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
}

/  SPEAK MONTHLY EXPENSE SUMMARY //
function speakMonthlySummary() {
    if (expenses.length === 0) {
        speakText("No expenses recorded yet.");
        return;
    }

    const now = new Date();
    const monthName = now.toLocaleString("default", { month: "long" });
    const year = now.getFullYear();
    const total = getMonthlyTotal(year, now.getMonth());

    speakText(`Your total expense for ${monthName} ${year} is ${total} rupees.`);
}

//  TEXT TO SPEECH FUNCTION //
function speakText(message) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "en-IN";
    window.speechSynthesis.speak(speech);
}





