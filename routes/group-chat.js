const express = require('express');
const router = express.Router();
const fs = require('fs')

router.get('/', (req,res,next) => {

    fs.readFile("messages.txt",(err,data) =>{
        let messages = 'No Messages Yet'
        if(data){
            messages = data.toString()

    res.send(`
        <script>
            window.onload = function() {
                const user = localStorage.getItem("username");
                if (user) {
                    document.body.innerHTML = \`
                        <section>
                            <p>${messages}</p>
                            <form action="/" method="POST">
                                <input type="text" id="message" name="message" placeholder="Type something..." required>
                                <input type="hidden" name="username" value="\${user}">
                                <button type="submit">Send</button>
                            </form>
                        </section>
                    \`;
                } else {
                    document.body.innerHTML = \`
                        <form action="/" method="POST" onsubmit="localStorage.setItem('username', document.getElementById('username').value)">
                            <input type="text" id="username" name="username" placeholder="Enter username" required>
                            <button type="submit">Login</button>
                        </form>
                    \`;
                }
            }
        </script>
    `);   
    
    }
    }) 
});

router.post("/",(req,res,next)=>{

    const data = req.body;
    const message = `${data.username}: ${data.message} `
    console.log(message)
    fs.appendFile("messages.txt", message, err => {
        if(err){
            return res.status(500).send("Internal Server Error");
        }
    })
    res.redirect("/")
})

module.exports = router;