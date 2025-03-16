document.addEventListener("DOMContentLoaded", function () {
    const filterType = document.getElementById("filterType");
    const datePicker = document.getElementById("datePicker");
    const weekPicker = document.getElementById("weekPicker");
    const monthPicker = document.getElementById("monthPicker");
    const applyFilter = document.getElementById("applyFilter");
    const expenseTableBody = document.getElementById("expenseTableBody");

    // Show appropriate date picker based on selection
    filterType.addEventListener("change", function () {
        datePicker.classList.add("d-none");
        weekPicker.classList.add("d-none");
        monthPicker.classList.add("d-none");

        if (filterType.value === "daily") {
            datePicker.classList.remove("d-none");
        } else if (filterType.value === "weekly") {
            weekPicker.classList.remove("d-none");
        } else if (filterType.value === "monthly") {
            monthPicker.classList.remove("d-none");
        }
    });

    // Fetch and filter expenses based on selection
    applyFilter.addEventListener("click", async function () {
        let filterValue = "";
        if (filterType.value === "daily") {
            filterValue = datePicker.value;
        } else if (filterType.value === "weekly") {
            filterValue = weekPicker.value;
        } else if (filterType.value === "monthly") {
            filterValue = monthPicker.value;
        }

        if (!filterValue) {
            alert("Please select a date range");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            console.log("filter values", filterType.value, filterValue);
            const response = await fetch(`http://localhost:3000/expense/filter`, {
                method: 'POST',
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    filterType: filterType.value,
                    filterValue: filterValue
                })
            });

            const data = await response.json();
            console.log(data)
            renderExpenses(data.expenses);
        } catch (error) {
            console.log("Error fetching filtered expenses:", error);
        }
    });

    // Function to render expenses
    const renderExpenses = (expenses) => {
        expenseTableBody.innerHTML = "";
        expenses.forEach((expense, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${i+1}</td>
                <td>${expense.item}</td>
                <td>${expense.category}</td>
                <td>$${expense.income}</td>
                <td>$${expense.amount}</td>
            `;
            expenseTableBody.appendChild(row);
        });
    };
});