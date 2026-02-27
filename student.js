


let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let totalMoney = localStorage.getItem("totalMoney") || 0;
let editIndex = -1;

document.getElementById("remaining").innerText = totalMoney;

updateTable();
updateRemaining();
updateCharts();



function setMoney() {
    totalMoney = Number(document.getElementById("totalMoney").value);
    localStorage.setItem("totalMoney", totalMoney);
    updateRemaining();
}


function updateRemaining() {
    let spent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    let remaining = Number(totalMoney) - spent;

    let remainingElement = document.getElementById("remaining");
    remainingElement.innerText = "₹" + remaining;

    if (remaining < 0) {
        remainingElement.style.color = "red";

        // Show alert message
        alert("⚠️ Your spending limit is over!");
    } else {
        remainingElement.style.color = "green";
    }
}




function addExpense() {
    let expense = {
        date: date.value,
        category: category.value,
        amount: amount.value
    };

    if (editIndex >= 0) {
        expenses[editIndex] = expense;
        editIndex = -1;
    } else {
        expenses.push(expense);
        
        
    }

    localStorage.setItem("expenses", JSON.stringify(expenses));
    updateTable();
    updateRemaining();
    updateCharts();
}

function updateTable() {
    let html = "";
    expenses.forEach((e, i) => {
        html += `
        <tr>
            <td>${e.date}</td>
            <td>${e.category}</td>
            <td>₹${e.amount}</td>
            <td>
                <button class="action-btn edit" onclick="editExpense(${i})">Edit</button>
                <button class="action-btn delete" onclick="deleteExpense(${i})">Delete</button>
            </td>
        </tr>`;
    });
    document.getElementById("expenseList").innerHTML = html;
}

function editExpense(index) {
    date.value = expenses[index].date;
    category.value = expenses[index].category;
    amount.value = expenses[index].amount;
    editIndex = index;
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    updateTable();
    updateRemaining();
    updateCharts();
}

//let pieChart, linechart;

var pieChart = null;
var lineChart = null;


function updateCharts() {


    let categoryData = {};
    expenses.forEach(e => {
        categoryData[e.category] =
        (categoryData[e.category] || 0) + Number(e.amount);
    });

    // PIE CHART
    if (pieChart) pieChart.destroy();
    const pieCtx = document.getElementById("pieChart").getContext("2d");

    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // LINE CHART
    if (lineChart) lineChart.destroy();
    const lineCtx = document.getElementById("lineChart").getContext("2d");

    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: expenses.map(e => e.date),
            datasets: [{
                label: "Daily Expense",
                data: expenses.map(e => e.amount),
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}





