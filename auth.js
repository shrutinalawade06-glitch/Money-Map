
// REGISTER FUNCTION
function register() {
    let username = document.getElementById("regUsername").value;
    let password = document.getElementById("regPassword").value;

    if (username === "" || password === "") {
        alert("Please fill all fields");
        return;
    }

    let user = {
        username: username,
        password: password
    };

    localStorage.setItem("user", JSON.stringify(user));

    alert("Registration successful!");
    window.location.href = "login.html";
}


// LOGIN FUNCTION
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
        alert("No user found. Please register first.");
        return;
    }

    if (username === storedUser.username && password === storedUser.password) {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "index1.html";
    } else {
        alert("Invalid Credentials");
    }
}


// LOGOUT FUNCTION

