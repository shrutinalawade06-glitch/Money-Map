// ================= MONEY ALLOCATION STORAGE =================
//let allocations = JSON.parse(localStorage.getItem("allocations")) || [];
let budget = parseFloat(localStorage.getItem("budget")) || 10000;
let pieChart;
let barChart;

let allocationsByDate =
    JSON.parse(localStorage.getItem("allocationsByDate")) || {};
    
    function syncAllocationsArray() {
    allocations = Object.values(allocationsByDate).flat();
}
// ✅ Step 1: getAllAllocations helper
function getAllAllocations() {
    return Object.values(allocationsByDate).flat();
}

// ---------------- DELETE FUNCTION ----------------
// function deleteAllocation(date, index) {
//     if (!confirm("Are you sure you want to delete this entry?")) return;

//     allocationsByDate[date].splice(index, 1);

//     // Remove date key if empty
//     if (allocationsByDate[date].length === 0) {
//         delete allocationsByDate[date];
//     }

//     localStorage.setItem("allocationsByDate", JSON.stringify(allocationsByDate));
//     syncAllocationsArray();
//     renderList();
//     updateCharts();
//     updateIncomeLevels();
//     updateSummary();
// }
function deleteAllocation(date, index) {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    allocationsByDate[date].splice(index, 1);

    // Remove date key if empty
    if (allocationsByDate[date].length === 0) delete allocationsByDate[date];

    // Save & sync
    localStorage.setItem("allocationsByDate", JSON.stringify(allocationsByDate));
    syncAllocationsArray();

    // Update UI
    renderList();
    updateCharts();
    updateIncomeLevels();
    updateSummary();
}
// function editAllocation(date, index) {
//     let allocation = allocationsByDate[date][index];

//     // Fill the form with existing values
//     document.getElementById("date").value = date;
//     document.getElementById("amount").value = allocation.amount;
//     document.getElementById("type").value = allocation.type;
//     document.getElementById("item").value = allocation.item;

//     // Delete the old entry
//     allocationsByDate[date].splice(index, 1);
//     if (allocationsByDate[date].length === 0) {
//         delete allocationsByDate[date];
//     }

//     localStorage.setItem("allocationsByDate", JSON.stringify(allocationsByDate));
//     syncAllocationsArray();

//     // Update UI
//     renderList();
//     updateCharts();
//     updateIncomeLevels();
//     updateSummary();
// }
function editAllocation(date, index) {
    let allocation = allocationsByDate[date][index];

    // Fill the form with existing values
    document.getElementById("date").value = date;
    document.getElementById("amount").value = allocation.amount;
    document.getElementById("type").value = allocation.type;
    document.getElementById("item").value = allocation.item;

    // Remove old entry
    allocationsByDate[date].splice(index, 1);
    if (allocationsByDate[date].length === 0) delete allocationsByDate[date];

    // Save & sync
    localStorage.setItem("allocationsByDate", JSON.stringify(allocationsByDate));
    syncAllocationsArray();

    // Update UI
    renderList();
    updateCharts();
    updateIncomeLevels();
    updateSummary();
}




//let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let expensesByDate = JSON.parse(localStorage.getItem("expensesByDate")) || {};


let chart;

 

// window.onload = function () {
//     if (document.getElementById("chart")) {
//         initChart();
//         renderExpenses();
//         updateDashboard();
//     }

//     if (document.getElementById("pieChart")) {
//         initCharts();
//         syncAllocationsArray();
//     renderList();
//     updateCharts();
//     resetIncomeBars();
//     }
//     updateDashboard();
//  // ✅ ADD THESE TWO LINES (SUMMARY + LEVEL BARS)
//     updateIncomeLevels();
//     updateSummary();
// };
window.onload = function () {

    // SAFE CHECK
    if (document.getElementById("budgetDisplay")) {
        document.getElementById("budgetDisplay").innerText = budget;
    }

    if (document.getElementById("budgetInput")) {
        document.getElementById("budgetInput").value = budget;
    }

    if (document.getElementById("chart")) {
        initChart();
        renderExpenses();
        updateDashboard();
    }
    if (document.getElementById("pieChart")) {
        initCharts();
        syncAllocationsArray();
    renderList();
    updateCharts();
    resetIncomeBars();
    }
    updateDashboard();
 // ✅ ADD THESE TWO LINES (SUMMARY + LEVEL BARS)
    updateIncomeLevels();
    updateSummary();
};



function addExpense() {
    let date = document.getElementById("date").value;
    let amount = parseFloat(document.getElementById("amount").value);
    let category = document.getElementById("category").value;

    
    if (!expensesByDate[date]) {
        expensesByDate[date] = [];
    }

    // Push expense into that date
    expensesByDate[date].push({
        amount: amount,
        category: category
    });

    // Save
    localStorage.setItem("expensesByDate", JSON.stringify(expensesByDate));


    renderExpenses();
    updateDashboard();
}

function renderExpenses() {
    let container = document.getElementById("expenseList");
    container.innerHTML = "";

    
    let dates = Object.keys(expensesByDate).sort();

    dates.forEach(date => {

        let dailyTotal = 0;
        let listHTML = "";

        expensesByDate[date].forEach(exp => {
            dailyTotal += exp.amount;
            listHTML += `<li>${exp.category} - ₹${exp.amount}</li>`;
        });

        container.innerHTML += `
            <div class="card expense-card">
                <h4>${date}</h4>
                <ul style="text-align:left">
                    ${listHTML}
                </ul>
                <strong>Total: ₹${dailyTotal}</strong>
            </div>
        `;
    });


}



// function updateDashboard() {

//     let total = 0;

//     for (let date in expensesByDate) {
//         expensesByDate[date].forEach(exp => {
//             total += exp.amount;
//         });
//     }

//     document.getElementById("totalAmount").innerText = total;

//     let percent = (total / budget) * 100;
//     if (percent > 100) percent = 100;

//     document.querySelector(".progress-bar").style.width = percent + "%";
    

  
//     updateChart();
// }
function updateDashboard() {

    let total = 0;

    for (let date in expensesByDate) {
        expensesByDate[date].forEach(exp => {
            total += exp.amount;
        });
    }

    document.getElementById("totalAmount").innerText = total;

    let percent = (total / budget) * 100;
    if (percent > 100) percent = 100;

    document.querySelector(".progress-bar").style.width = percent + "%";

    updateChart();

    // ✅ ADD THIS LINE
    generateAI(total);
}


function generateAI(total) {

    let insightBox = document.getElementById("insightBox");
    if (!insightBox) return;

    let message = "";

    if (!expensesByDate || Object.keys(expensesByDate).length === 0) {
        insightBox.innerText = "Start tracking to see smart insights.";
        return;
    }

    // Budget Insight
    if (total < budget * 0.5) {
        message += "✅ You are managing your budget well.\n\n";
    } else if (total < budget) {
        message += "⚠ You have used " + ((total / budget) * 100).toFixed(0) + "% of your budget.\n\n";
    } else {
        message += "🚨 You exceeded your budget by ₹" + (total - budget).toFixed(2) + ".\n\n";
    }

   
    let categoryTotals = {};

    for (let date in expensesByDate) {
        expensesByDate[date].forEach(exp => {
            if (!categoryTotals[exp.category]) {
                categoryTotals[exp.category] = 0;
            }
            categoryTotals[exp.category] += exp.amount;
        });
    }



    let maxCategory = "";
    let maxAmount = 0;
    for (let category in categoryTotals) {
        if (categoryTotals[category] > maxAmount) {
            maxAmount = categoryTotals[category];
            maxCategory = category;
        }
    }

    if (maxCategory) {
        message += "💰 Highest spending: " + maxCategory + " (₹" + maxAmount.toFixed(2) + ")\n\n";
    }

    // Daily Prediction
    let today = new Date().getDate();
    let predicted = (total / today) * 30;
    if (predicted > budget) {
        message += "📈 At this rate, you may exceed budget by ₹" + (predicted - budget).toFixed(2) + ".\n\n";
    }
 
    // Remaining Budget
    let remaining = budget - total;
    if (remaining > 0) {
        message += "💡 You still have ₹" + remaining.toFixed(2) + " remaining.";
    }
      //checkGoal();
      //saveMonthlyIncome();
    
    insightBox.innerText = message;
    if (typeof checkGoal === "function") {
    checkGoal();
} 

if (
    typeof saveMonthlyIncome === "function" &&
    document.getElementById("monthlyIncomeInput")
) {
    saveMonthlyIncome();
}

}

 

function initChart() {

    const canvas = document.getElementById("chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Food", "Travel", "Shopping", "Other"],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    "#ff6384",
                    "#36a2eb",
                    "#ffcd56",
                    "#4caf50"
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}



function updateChart() {

    if (!chart) return;

    let data = { Food: 0, Travel: 0, Shopping: 0, Other: 0 };

    for (let date in expensesByDate) {
        expensesByDate[date].forEach(exp => {
            data[exp.category] += exp.amount;
        });
    }

    chart.data.datasets[0].data = Object.values(data);
    chart.update();
}

function toggleDark() {
    document.body.classList.toggle("dark");
}

function clearData() {
    /*localStorage.removeItem("expenses");
    expenses=[];*/
    localStorage.removeItem("expensesByDate");
    expensesByDate = {};
    renderExpenses();
    updateDashboard();
}


function updateProgressBar(totalAmount) {

    let budget = 10000; // change if your budget is dynamic

    let percent = (totalAmount / budget) * 100;

    if (percent > 100) {
        percent = 100;
    }

    let progressBar = document.querySelector(".progress-bar");

    if (progressBar) {
        progressBar.style.width = percent + "%";

        if (percent >= 80) {
            progressBar.style.backgroundColor = "red";
        } else {
            progressBar.style.backgroundColor = "#00ff88";
        }
    }
}


// ---------------- ADD ENTRY ----------------
// function addAllocation() {
//     let date = document.getElementById("date").value;
//     let amount = parseFloat(document.getElementById("amount").value);
//     let type = document.getElementById("type").value; // Saving / Investment
//     let item = document.getElementById("item").value;

//     if (!date || !amount || !type || !item) {
//         alert("Fill all fields");
//         return;
//     }

//    // allocations.push({ date, amount, type, item });

//     localStorage.setItem("allocations", JSON.stringify(allocations));

//     renderList();
//     updateCharts();
//     // add this line
//     updateIncomeLevels();
//     updateSummary();
//     // ---- SYNC TO DATE STRUCTURE ----
// // let date = document.getElementById("date").value;

// if (!allocationsByDate[date]) {
//     allocationsByDate[date] = [];
// }

// allocationsByDate[date].push({
//     amount,
//     type
// });

// localStorage.setItem(
//     "allocationsByDate",
//     JSON.stringify(allocationsByDate)
// );

// syncAllocationsArray();

// }

// function addAllocation() {
//     let date = document.getElementById("date").value;
//     let amount = parseFloat(document.getElementById("amount").value);
//     let type = document.getElementById("type").value;
//     let item = document.getElementById("item").value;

//     if (!date || !amount || !type || !item) {
//         alert("Fill all fields");
//         return;
//     }

//     // SAME PATTERN AS EXPENSES
//     if (!allocationsByDate[date]) {
//         allocationsByDate[date] = [];
//     }

//     allocationsByDate[date].push({
//         amount,
//         type,
//         item
//     });

//     localStorage.setItem(
//         "allocationsByDate",
//         JSON.stringify(allocationsByDate)
//     );

//     renderList();
//     updateCharts();
//     updateIncomeLevels();
//     updateSummary();
// }
function addAllocation() {
    let date = document.getElementById("date").value;
    let amount = parseFloat(document.getElementById("amount").value);
    let type = document.getElementById("type").value;
    let item = document.getElementById("item").value;

    if (!date || !amount || !type || !item) {
        alert("Fill all fields");
        return;
    }

    // ✅ Initialize array for date if not exists
    if (!allocationsByDate[date]) allocationsByDate[date] = [];

    // ✅ Push new allocation
    allocationsByDate[date].push({ amount, type, item });

    // ✅ Save to localStorage
    localStorage.setItem("allocationsByDate", JSON.stringify(allocationsByDate));

    // ✅ Sync allocations array
    syncAllocationsArray();

    // ✅ Update UI
    renderList();
    updateCharts();
    updateIncomeLevels();
    updateSummary();
}
// ---------------- LIST ----------------
// function renderList() {
//     let container = document.getElementById("allocationList");
//     container.innerHTML = "";

//     allocations.forEach(a => {
//         container.innerHTML += `
//             <div class="card expense-card">
//                 <h4>${a.type}</h4>
//                 <p>${a.item}</p>
//                 <h3>₹${a.amount}</h3>
//                 <small>${a.date}</small>
//             </div>
//         `;
//     });
// }
// function renderList() {
//     let container = document.getElementById("allocationList");
//     container.innerHTML = "";

//     let currentDate = "";

//     allocations.forEach(a => {
//         if (a.date !== currentDate) {
//             currentDate = a.date;
//             container.innerHTML += `<h4>${currentDate}</h4>`;
//         }

//         container.innerHTML += `
//             <div class="card expense-card">
//                 <h4>${a.type}</h4>
//                 <p>${a.item}</p>
//                 <h3>₹${a.amount}</h3>
//             </div>
//         `;
//     });
// }

// function renderList() {
//     let container = document.getElementById("allocationList");
//     container.innerHTML = "";

//     let dates = Object.keys(allocationsByDate).sort();

//     dates.forEach(date => {
//         let listHTML = "";

//         allocationsByDate[date].forEach(a => {
//             listHTML += `
//                 <div class="card expense-card">
//                     <h4>${a.type}</h4>
//                     <p>${a.item}</p>
//                     <h3>₹${a.amount}</h3>
//                 </div>
//             `;
//         });

//         container.innerHTML += `
//             <div class="card">
//                 <h4>${date}</h4>
//                 ${listHTML}
//             </div>
//         `;
//     });
// }
// function renderList() {
//     let container = document.getElementById("allocationList");
//     container.innerHTML = "";

//     // Sort dates in ascending order
//     let sortedDates = Object.keys(allocationsByDate).sort();

//     sortedDates.forEach(date => {
//         let itemsHTML = "";
//         allocationsByDate[date].forEach((a, index) => {
//             itemsHTML += `
//                 <li>
//                     ${a.type} - ${a.item} : ₹${a.amount.toFixed(2)}
//                     <button onclick="editAllocation('${date}', ${index})">Edit</button>
//                     <button onclick="deleteAllocation('${date}', ${index})">Delete</button>
//                 </li>
//             `;
//         });

//         container.innerHTML += `
//             <div class="card expense-card">
//                 <h4>${date}</h4>
//                 <ul style="text-align:left">
//                     ${itemsHTML}
//                 </ul>
//             </div>
//         `;
//     });
// }
function renderList() {
    let container = document.getElementById("allocationList");
    container.innerHTML = "";

    // Sort dates ascending
    let sortedDates = Object.keys(allocationsByDate).sort();

    sortedDates.forEach(date => {
        let itemsHTML = "";

        allocationsByDate[date].forEach((a, index) => {
            itemsHTML += `
                <li>
                    ${a.type} - ${a.item} : ₹${a.amount.toFixed(2)}
                    <button onclick="editAllocation('${date}', ${index})">Edit</button>
                    <button onclick="deleteAllocation('${date}', ${index})">Delete</button>
                </li>
            `;
        });

        container.innerHTML += `
            <div class="card expense-card">
                <h4>${date}</h4>
                <ul style="text-align:left">
                    ${itemsHTML}
                </ul>
            </div>
        `;
    });
}


// ---------------- PIE + BAR ----------------
function initCharts() {

    // PIE
    pieChart = new Chart(document.getElementById("pieChart"), {
        type: "doughnut",
        data: {
            labels: ["Saving", "Investment"],
            datasets: [{
                data: [0, 0],
                backgroundColor: ["#00ff88", "#ff9800"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // BAR
    barChart = new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Saving",
                    data: [],
                    backgroundColor: "#00ff88"
                },
                {
                    label: "Investment",
                    data: [],
                    backgroundColor: "#ff9800"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}




function updateCharts() {

    if (!pieChart || !barChart) return;

    let saving = 0;
    let investment = 0;

    let months = {};

    for (let date in allocationsByDate) {

        let month = date.slice(0, 7); // ✅ use KEY date

        if (!months[month]) {
            months[month] = { Saving: 0, Investment: 0 };
        }

        allocationsByDate[date].forEach(a => {

            if (a.type === "Saving") {
                saving += a.amount;
                months[month].Saving += a.amount;
            }

            if (a.type === "Investment") {
                investment += a.amount;
                months[month].Investment += a.amount;
            }
        });
    }

    // PIE
    pieChart.data.datasets[0].data = [saving, investment];
    pieChart.update();

    // BAR
    barChart.data.labels = Object.keys(months);
    barChart.data.datasets[0].data = Object.values(months).map(m => m.Saving);
    barChart.data.datasets[1].data = Object.values(months).map(m => m.Investment);
    barChart.update();
}

let goalName = "";
let goalAmount = 0;

function saveGoal() {
    goalName = document.getElementById("goalName").value;
    goalAmount = parseFloat(document.getElementById("goalAmount").value);

    localStorage.setItem("goalName", goalName);
    localStorage.setItem("goalAmount", goalAmount);

    checkGoal();
}

function checkGoal() {
    let totalSpent = parseFloat(document.getElementById("totalAmount").innerText);
    let budget = 10000;  // Your fixed budget
    let remaining = budget - totalSpent;

    let savedGoalName = localStorage.getItem("goalName");
    let savedGoalAmount = parseFloat(localStorage.getItem("goalAmount"));

    if (!savedGoalName || !savedGoalAmount) return;

    let message = "";

    if (remaining >= savedGoalAmount) {
        message = "🎉 Congratulations! You achieved your goal: " + savedGoalName;
    } else {
        let needMore = savedGoalAmount - remaining;
        message = "💰 You need ₹" + needMore.toFixed(2) + " more to achieve your goal: " + savedGoalName;
    }

    document.getElementById("goalStatus").innerText = message;
}
// ================= INCOME + LEVEL BAR FINAL LOGIC =================
function saveMonthlyIncome() {
    let income = parseFloat(document.getElementById("monthlyIncome").value);

    if (!income || income <= 0) {
        alert("Enter valid income");
        return;
    }

    localStorage.setItem("monthlyIncome", income);

    updateIncomeLevels();
    updateSummary();
}



function updateIncomeLevels() {

    let income = parseFloat(localStorage.getItem("monthlyIncome")) || 0;
    if (income === 0) return;

    let savingTarget = income * 0.10;
    let investmentTarget = income * 0.10;

    let savingTotal = 0;
    let investmentTotal = 0;

    for (let date in allocationsByDate) {
        allocationsByDate[date].forEach(a => {
            if (a.type === "Saving") savingTotal += a.amount;
            if (a.type === "Investment") investmentTotal += a.amount;
        });
    }

    let savingPercent = Math.min((savingTotal / savingTarget) * 100, 100);
    let investPercent = Math.min((investmentTotal / investmentTarget) * 100, 100);

    document.getElementById("savingBar").style.width = savingPercent + "%";
    document.getElementById("investBar").style.width = investPercent + "%";
}



function updateSummary() {

    let income = parseFloat(localStorage.getItem("monthlyIncome")) || 0;
    if (income === 0) return;

    let savingTotal = 0;
    let investmentTotal = 0;

    for (let date in allocationsByDate) {
        allocationsByDate[date].forEach(a => {
            if (a.type === "Saving") savingTotal += a.amount;
            if (a.type === "Investment") investmentTotal += a.amount;
        });
    }

    let savingTarget = income * 0.10;
    let investmentTarget = income * 0.10;

    let expenseTotal =
        parseFloat(document.getElementById("totalAmount")?.innerText) || 0;

    let wantAmount = income - (savingTotal + investmentTotal + expenseTotal);
    if (wantAmount < 0) wantAmount = 0;

    document.getElementById("sumIncome").innerText = income.toFixed(2);
    document.getElementById("sumSavingTarget").innerText = savingTarget.toFixed(2);
    document.getElementById("sumInvestmentTarget").innerText = investmentTarget.toFixed(2);
    document.getElementById("sumSaving").innerText = savingTotal.toFixed(2);
    document.getElementById("sumInvestment").innerText = investmentTotal.toFixed(2);
    document.getElementById("sumWant").innerText = wantAmount.toFixed(2);
}

function saveBudget() {
    const input = document.getElementById("budgetInput");
    const display = document.getElementById("budgetDisplay");

    if (!input || !display) return;

    const value = parseFloat(input.value);

    if (isNaN(value) || value <= 0) {
        alert("Please enter valid budget");
        return;
    }

    budget = value;
    localStorage.setItem("budget", budget);

    display.innerText = budget;

    updateDashboard(); // VERY IMPORTANT
}