
// 1️⃣ Run OCR

        function runOCR() {

    const fileInput = document.getElementById('imageInput');
    const result = document.getElementById('ocrResult');
    const amountInput = document.getElementById('amount');

    if (fileInput.files.length === 0) {
        alert("Please upload an image first!");
        return;
    }

    const file = fileInput.files[0];

    result.innerHTML = "Scanning receipt...";
    result.style.color = "black";

    Tesseract.recognize(file, 'eng')
    .then(({ data: { text } }) => {

        let totalAmount = extractTotal(text);

        if (totalAmount) {

            result.innerHTML = "✅ Total Found: ₹ " + totalAmount;
            result.style.color = "green";

            let confirmUse = confirm(
                "Detected Amount: ₹ " + totalAmount + "\n\nDo you want to use this amount?"
            );

            if (confirmUse) {
                amountInput.value = totalAmount;
            }

        } else {

            result.innerHTML = "❌ Could not detect total amount.";
            result.style.color = "red";
        }

    }).catch(err => {
        result.innerHTML = "Error occurred!";
        result.style.color = "red";
        console.error(err);
    });
}



// 2️⃣ Extract Total

function extractTotal(text) {

    // Split OCR text into lines
    let lines = text.split("\n");

    for (let line of lines) {

        let lowerLine = line.toLowerCase();

        // Priority 1: UPI Payment
        if (lowerLine.includes("upi") || lowerLine.includes("amount received")) {
            let match = line.match(/[\d,.]+/);
            if (match) return cleanAmount(match[0]);
        }

        // Priority 2: Grand Total
        if (lowerLine.includes("grand total")) {
            let match = line.match(/[\d,.]+/);
            if (match) return cleanAmount(match[0]);
        }

        // Priority 3: Total Amount
        if (lowerLine.includes("total")) {
            let match = line.match(/[\d,.]+/);
            if (match) return cleanAmount(match[0]);
        }
    }

    return null;
}

function cleanAmount(value) {
    value = value.replace(/,/g, "");
    let amount = parseFloat(value);
    return amount.toFixed(2);
}


function addExpenseFromOCR(amount) {

    amount = parseFloat(amount);
    if (isNaN(amount)) return;

    // Add into expenses array
    expenses.push({
        date: new Date().toISOString().split("T")[0],
        amount: amount,
        category: "Other"
    });

    // Save full expenses array
    localStorage.setItem("expenses", JSON.stringify(expenses));

    // Re-render full dashboard
    renderExpenses();
    updateDashboard();
}
