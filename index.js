const express = require('express')
const bodyParser = require('body-parser')

const router = require("./routes/group-chat")

const app = express()

app.use(bodyParser.urlencoded({extended:false}));

app.use("/", router)

app.listen(3000)

