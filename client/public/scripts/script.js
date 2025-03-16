document.addEventListener("DOMContentLoaded", async function () {
    console.log("Script loaded");

    const getToken = () => localStorage.getItem("token");

    // Load Header
    const loadHeader = async () => {
        try {
            const response = await fetch("header.html");
            const data = await response.text();
            document.getElementById("header").innerHTML = data;
        } catch (err) {
            console.error("Error loading header:", err);
        }
    };
    await loadHeader();

    // Check Premium Status
    const renderBtn = document.getElementById("renderBtn");
    const downloadReport = document.getElementById("download-report");

    const isPremium = async () => {
        try {
            const token = getToken();
            const response = await fetch("http://localhost:3000/premium", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log("Premium Status:", data);

            if (data.success) {
                localStorage.setItem("isPremium", "true");
                renderBtn.outerHTML = `<a href="leaderboard.html" class="btn btn-warning">View Leaderboard</a>`;
            } else {
                downloadReport.ariaDisabled = true;
                downloadReport.style.opacity = "0.5";
            }
        } catch (error) {
            console.error("Error fetching payment status:", error);
        }
    };
    await isPremium();

    // Expense Form Elements
    const expenseForm = document.getElementById("expenseForm");
    const expensesList = document.getElementById("expensesList");
    const searchExpenses = document.getElementById("searchExpenses");
    const itemsPerPageSelect = document.getElementById("itemsPerPage");
    const paginationContainer = document.getElementById("pagination");

    let currentPage = 1;
    const storedLimit = parseInt(localStorage.getItem("expensesPerPage"), 10) || 5;
    
    if (itemsPerPageSelect) {
        itemsPerPageSelect.value = storedLimit;
        itemsPerPageSelect.addEventListener("change", (event) => {
            const limit = parseInt(event.target.value, 10);
            localStorage.setItem("expensesPerPage", limit);
            fetchExpenses(1, limit);
        });
    }

    // Fetch Expenses with Pagination
    async function fetchExpenses(page = 1, limit = storedLimit) {
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:3000/expense?page=${page}&limit=${limit}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                currentPage = data.pagination.currentPage;
                renderExpenses(data.expenses, currentPage, limit);
                renderPagination(data.pagination);
            } else {
                console.error("Failed to fetch expenses");
            }
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    }

    // Render Expenses
    function renderExpenses(expenses, page, limit) {
        if (!expensesList) return;
        expensesList.innerHTML = "";

        const index = (page - 1) * limit;
        expenses.forEach((expense, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + i + 1}</td>
                <td>${expense.item}</td>
                <td>${expense.category}</td>
                <td>$${expense.amount}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editExpense(${expense.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">Delete</button>
                </td>
            `;
            expensesList.appendChild(row);
        });
    }

    // Render Pagination
    function renderPagination(pagination) {
        paginationContainer.innerHTML = "";
        const { currentPage, totalPages } = pagination;

        const label = document.createElement("span");
        label.innerText = `Page: ${currentPage} of ${totalPages}`;
        label.style.fontWeight = "bold";
        label.style.marginRight = "20px";
        paginationContainer.appendChild(label);

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.innerText = i;
            btn.classList.add("pagination-btn");
            btn.style.marginRight = "8px";
            if (i === currentPage) btn.classList.add("active");

            btn.addEventListener("click", () => {
                fetchExpenses(i);
            });

            paginationContainer.appendChild(btn);
        }
    }

    // Expense CRUD Operations
    window.editExpense = async (id) => {
        const expenses = await fetchExpenses();
        const expense = expenses.find(exp => exp.id === id);
        if (!expense) return;

        document.getElementById("item").value = expense.item;
        document.getElementById("category").value = expense.category;
        document.getElementById("amount").value = expense.amount;
    };

    window.deleteExpense = async (id) => {
        try {
            const token = getToken();
            await fetch(`http://localhost:3000/expense/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchExpenses(currentPage);
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    if (expenseForm) {
        expenseForm.addEventListener("submit", async (e) => {
            e.preventDefault();
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

                expenseForm.reset();
                fetchExpenses();
            } catch (error) {
                console.error("Error adding expense:", error);
            }
        });
    }

    // Fetch Leaderboard
    const leaderboardList = document.getElementById("leaderboard");
    if (leaderboardList) {
        const renderLeaderboard = async (users) => {
            leaderboardList.innerHTML = "";
            users.forEach((user, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.username}</td>
                    <td>₹${user.totalAmount}</td>
                `;
                leaderboardList.appendChild(row);
            });
        };

        const fetchLeaderboard = async () => {
            try {
                const token = getToken();
                const response = await fetch("http://localhost:3000/leaderboard", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                const res = await response.json();
                if (res.success) {
                    renderLeaderboard(res.data);
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        };
        fetchLeaderboard();
    }

    // Initial Expense Fetch
    fetchExpenses();

    const downloadButton = document.getElementById("download-report");

    downloadButton.addEventListener("click", async function () {
        try {
          const token = getToken();
          const response = await fetch("http://localhost:3000/download-report", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            credentials: "include",
          });
    
          const data = await response.json();
          if (data.url) {
                window.location.href = data.url;
          } else {
            alert("Failed to generate report.");
          }
        } catch (error) {
          console.error("Error downloading report:", error);
          alert("Something went wrong.");
        }
      });
});
