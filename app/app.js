const express = require('express');
const bodyParser = require('body-parser')
const { Pool } = require("pg")
const router = require("./routes/router")
const dotenv = require("dotenv");
dotenv.config()

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
});

pool.connect()


const app = express();

app.set('view engine', 'ejs');

app.use("/auth/login", router);

app.listen(3000, (req, res) => {
    console.log("App is running on port 3000")
})