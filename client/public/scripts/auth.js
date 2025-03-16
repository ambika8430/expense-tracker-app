document.addEventListener("DOMContentLoaded", function () {
    const getToken = () => localStorage.getItem("token");

    //sign-in form
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

    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const sentPasswordForm = document.getElementById('sent-password-form');

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("Sign-up triggered");

            const email = document.querySelector(".forgot-email").value;

            const response = await fetch("http://localhost:3000/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                forgotPasswordForm.style.display = "none";
                sentPasswordForm.style.display = "block";
            } else {
                alert("Sign-up failed: " + data.message);
                window.location.href = '/sign-in.html';
            }
        });
    } else {
        console.warn("Sign-up form not found");
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("Sign-up triggered");

            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const email = urlParams.get('email');


            const newPassword = document.querySelector(".new-password").value;
            const repeatPassword = document.querySelector(".repeat-password").value;

            if(newPassword!==repeatPassword){
                alert("Passwords doesn't match")
                window.location.href = "/reset-password"
            }

            const response = await fetch("http://localhost:3000/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token, newPassword }),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                alert("Sign-up successful! Please log in.");
                window.location.href = "/";
            } else {
                alert("Sign-up failed: " + data.message);
                window.location.href = '/sign-in.html';
            }
        });
    } else {
        console.warn("Sign-up form not found");
    }
})