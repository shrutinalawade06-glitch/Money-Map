const { form, editIndex, expenses, saveToLocalStorage } = require("./script");

// Form submit (Add / Update expense)
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value; //add new

  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;

  if (editIndex === -1) {

    let existingExpense = expenses.find(
      exp => exp.date === date && exp.category === category
    );

    if (existingExpense) {
      existingExpense.amount += Number(amount);
    } else {
      expenses.push({
        date: date,
        category: category,
        amount: Number(amount),
        note: note
      });
    }

  } else {
    expenses[editIndex].date = date;
    expenses[editIndex].category = category;
    expenses[editIndex].amount = Number(amount);
    expenses[editIndex].note = note;
    editIndex = -1;
  }

} * ///localstorage
  saveToLocalStorage());
