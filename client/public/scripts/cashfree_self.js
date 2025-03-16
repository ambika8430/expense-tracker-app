const cashfree = Cashfree({
    mode: "sandbox",
});

document.getElementById("renderBtn").addEventListener("click", async () => {
    try {
        const token = localStorage.getItem("token"); // Get token from local storage

        if (!token) {
            console.error("No token found in local storage!");
            return alert("You need to log in first!");
        }

        const requestBody = {
            orderAmount: 100,
            customerPhone: "9876543210",
        };

        const res = await fetch('http://localhost:3000/pay', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Include token here
            },
            body: JSON.stringify(requestBody)
        });

        const data = await res.json();
        console.log("Response from server:", data);

        if (!data.paymentSessionId) {
            console.error("No payment session ID received!");
            return alert("Payment initialization failed!");
        }

        let checkoutOptions = {
            paymentSessionId: data.paymentSessionId, // Use actual session ID
            redirectTarget: "_self",
        };

        await cashfree.checkout(checkoutOptions);
    } catch (err) {
        console.error("Error:", err);
        alert("Something went wrong. Please try again.");
    }
});
