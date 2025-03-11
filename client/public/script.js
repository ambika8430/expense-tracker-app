document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded");

    // Retrieve the token from localStorage
    const getToken = () => localStorage.getItem("token");

    // Sign-in Form
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("Sign-in triggered");

            const email = document.querySelector(".signin-email").value;
            const password = document.querySelector(".signin-password").value;

            const response = await fetch("http://localhost:3000/user/sign-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                alert("Sign-in successful!");
                localStorage.setItem("token", data.token); // Store the token
                window.location.href = "/home.html";
            } else {
                alert("Sign-in failed: " + data.message);
            }
        });
    } else {
        console.warn("Sign-in form not found");
    }

    // Sign-up Form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("Sign-up triggered");

            const username = document.querySelector(".signup-username").value;
            const email = document.querySelector(".signup-email").value;
            const password = document.querySelector(".signup-password").value;

            console.log({ username, email, password })

            const response = await fetch("http://localhost:3000/user/sign-up", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                alert("Sign-up successful! Please log in.");
                window.location.href = "/";
            } else {
                alert("Sign-up failed: " + data.message);
            }
        });
    } else {
        console.warn("Sign-up form not found");
    }

    // Expense Form
    const expenseForm = document.getElementById('expenseForm');
    const expensesList = document.getElementById('expensesList');
    const searchExpenses = document.getElementById('searchExpenses');

    console.log(expensesList);

    // Fetch all expenses
    const fetchExpenses = async () => {
        try {
            const token = getToken();
            const response = await fetch("http://localhost:3000/expense", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();
            return data.expenses || [];
        } catch (error) {
            console.error("Error fetching expenses:", error);
            return [];
        }
    };

    // Edit expense
    window.editExpense = async (id) => {
        const expenses = await fetchExpenses();
        const expense = expenses.find((exp) => exp.id === id);

        if (!expense) return;

        document.getElementById("item").value = expense.item;
        document.getElementById("category").value = expense.category;
        document.getElementById("amount").value = expense.amount;

        try {
            const token = getToken();
            await fetch(`http://localhost:3000/expense/${id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ item, category, amount })
            });
            renderExpenses();
        } catch (error) {
            console.error("Error updating expense:", error);
        }
    };

    // Delete expense
    window.deleteExpense = async (id) => {
        console.log("delete-id", id);
        try {
            const token = getToken();
            await fetch(`http://localhost:3000/expense/${id}`, { 
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            renderExpenses();
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    // Render expenses
    const renderExpenses = async () => {
        if (!expensesList) return;
        const expenses = await fetchExpenses();
        expensesList.innerHTML = "";

        expenses.forEach((expense) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${expense.item}</td>
                <td>${expense.category}</td>
                <td>$${expense.amount}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editExpense(${expense.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">Delete</button>
                </td>
            `;

            expensesList.appendChild(row);
        });
    };

    if (expensesList) {
        renderExpenses();
    }

    if (expenseForm) {
        expenseForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("Expense form triggered");

            const item = document.getElementById("item").value;
            const category = document.getElementById("category").value;
            const amount = document.getElementById("amount").value;

            try {
                const token = getToken();
                await fetch("http://localhost:3000/expense", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ item, category, amount })
                });

                renderExpenses();
                expenseForm.reset();
            } catch (error) {
                console.error("Error adding expense:", error);
            }
        });
    } else {
        console.warn("Expense form not found");
    }

    // Search expenses
    if (searchExpenses) {
        searchExpenses.addEventListener("input", async (e) => {
            const query = e.target.value.toLowerCase();
            const expenses = await fetchExpenses();
            const filteredExpenses = expenses.filter((expense) =>
                expense.item.toLowerCase().includes(query) ||
                expense.category.toLowerCase().includes(query)
            );
            expensesList.innerHTML = "";

            filteredExpenses.forEach((expense) => {
                const div = document.createElement("div");
                div.classList.add("card", "p-3", "mb-3");
                div.innerHTML = `
                    <h5>${expense.item} - $${expense.amount}</h5>
                    <p><strong>Category:</strong> ${expense.category}</p>
                    <button class="btn btn-warning btn-sm" onclick="editExpense(${expense.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">Delete</button>
                `;
                expensesList.appendChild(div);
            });
        });
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    const renderBtn = document.getElementById("renderBtn");

    try {
        // Fetch user's payment status from the backend
        const response = await fetch("http://localhost:3000/premium", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("isPremium", "true");
            renderBtn.textContent = "You are a premium member";
            renderBtn.disabled = true;
            renderBtn.classList.remove("btn-success");
            renderBtn.classList.add("btn-secondary");
        }
    } catch (error) {
        console.error("Error fetching payment status:", error);
    }

    renderBtn.addEventListener("click", async function () {
        alert("You already have a premium membership.");
    });
});

const Expense = require("../models/expense");

// Get all expenses sorted in descending orde

document.addEventListener("DOMContentLoaded", async function () {
    const expensesList = document.getElementById("leaderBorad");

    async function fetchExpenses() {
        try {
            const response = await fetch("http://localhost:3000/getExpense"); // Update with your backend URL
            const expenses = await response.json();
            renderExpenses(expenses);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    }

    function renderExpenses(expenses) {
        expensesList.innerHTML = ""; // Clear existing entries
        expenses.forEach(expense => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${expense.expenseName}</td>
                <td>${expense.category}</td>
                <td>₹${expense.amount}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">Delete</button>
                </td>
            `;
            expensesList.appendChild(row);
        });
    }

    fetchExpenses();
});


