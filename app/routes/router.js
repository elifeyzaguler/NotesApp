const express = require("express");
const { Pool } = require("pg")
const bodyParser = require('body-parser')
const dotenv = require("dotenv");
const constants = require("constants");
const bcrypt = require("bcryptjs");
dotenv.config()

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
});

pool.connect()
const router = express.Router();

router.use( bodyParser.json() );
router.use(bodyParser.urlencoded({
    extended: true
}));

let notes = [{
    note_id: undefined,
    note_content: undefined
}];

router.get("/", async ( req, res ) => {
    const client = await pool.connect()
    await client.query("SELECT * FROM note_info ORDER BY note_id ASC", (err, result) => {
        if (err){
            console.error("Error executing the query: ", err)
        }
        notes = result.rows
        res.render("home", { data: notes})
    })

})

/*router.post("/", async (req, res) =>  {
    const client = await pool.connect()

    res.render("home", {
        data: notes
    })
})*/

router.post("/update", async (req, res) => {
    const client = await pool.connect()
    const noteId = parseInt(req.body.note_id);
    const noteContent = req.body.note_content;
    await client.query("UPDATE note_info SET note_content = $1 WHERE note_id = $2", [noteContent, noteId]).then(
        () => {
            res.redirect("/")
        }
    )
})
router.post("/delete",async (req, res) => {
    const noteId = parseInt(req.body.note_id);

    try {
        const client = await pool.connect()
        const delete_query = "DELETE FROM note_info WHERE note_id = $1;"
        await client.query(delete_query, [noteId])
        console.log("Data deleted.")
        client.release()
        res.redirect('/')
    } catch (error) {
        console.log("Error deleting data", error)
    }
})

router.post('/insertData', async (req, res) => {
    const noteContent = req.body.note_content;

    try {
        const client = await pool.connect()
        const insert_query = "INSERT INTO note_info (note_content) VALUES ($1)"
        const values = [noteContent]

        await client.query(insert_query, values)

        console.log("Data inserted.")
        client.release()
    } catch (error) {
        console.log("Error inserting data", error)
        res.status(500).send("An error occurred")
    }

    res.redirect('/')
})

router.get('/register', async (req, res) => {
    res.render("register");
})

router.get('/login', async (req, res) => {
    res.render("login");
})

router.post("/auth/register", async (req, res) => {
    const { name, surname, email, password, password_confirm} = req.body

    const client = await pool.connect()
    const email_query = "SELECT email FROM users WHERE email = ($1)"
    const values = [email]

    await client.query(email_query, values, async (error, res) => {
        if(error){
            console.log(error)
        }else{
            if (res.length > 0){
                res.send("This e-mail is already in use!")
                return res.redirect('/register')
            }
            else if (password !== password_confirm) {
                res.send("Passwords do not match!")
                return res.redirect('/register')
            }
            else{
                res.send("User registered!")
                return res.redirect('/register')
            }
        }
    })

})

router.post("/auth/login", async (req, res) => {
    const { email, password } = req.body

    const client = await pool.connect()
    const email_query = "SELECT email FROM users WHERE email = ($1)"
    const values = [email]

    await client.query(email_query, values, async (error, res) => {
        if(error){
            console.log(error)
        }else{
            if (res.length > 0 && res.password === password){
                res.send("Login successful")
                return res.redirect('/')
            }
            else if (res.password !== password) {
                res.send("Wrong password!")
                return res.redirect('/login')
            }
            else if (res.length < 0 ){
                res.send("No matching e-mail.")
                return res.redirect('/login')
            }
        }
    })
})





module.exports = router;