const express = require('express')
const mysql = require('mysql')
const cors = require("cors")

const bcrypt = require('bcrypt')
const saltRounds = 10

const app = express()

app.use(express.json())
app.use(cors())

const db = mysql.createPool({
    user: 'root',
    host: 'localhost',
    password: 'password',
    database: 'cruddb',
    port: 3306
})


app.post("/register", (req, res) => {
    const userName = req.body.userName
    const password = req.body.password

    bcrypt.hash(password, saltRounds, (error, hash) => {
        if (error) {
            console.log(error)
        }

        db.query(
            "SELECT * FROM login_system WHERE userName = ?;",
            userName,
            (err, result) => {
                if (err) {
                    res.send({ err: err })
                }

                if (result.length > 0) {
                    res.send({ message: "Username already exists" })
                }
                else {
                    db.query(
                        "INSERT INTO login_system (userName, password) VALUES (?, ?)",
                        [userName, hash],
                        (err, result) => {
                            if (err) {
                                res.send({ err: err })
                            }
                            res.send(result)
                        })
                }
            })
    })
})

app.post("/login", (req, res) => {
    const userName = req.body.userName
    const password = req.body.password

    db.query(
        "SELECT * FROM login_system WHERE userName = ?;",
        userName,
        (err, result) => {
            if (err) {
                res.send({ err: err })
            }

            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        res.send(result)
                    }
                    else {
                        res.send({ message: "Wrong username/password combination" })
                    }
                })
            }
            else {
                res.send({ message: "User doesn't exists" })
            }
        })
})

app.get("/get_msgs", (req, res) => {
    const sqlInsert = "SELECT * FROM messages"
    db.query(sqlInsert, [], (err, result) => {
        if (err) {
            res.send({ err: err })
        }

        if (result.length > 0) {
            res.send(result)
        }
    })
})

app.post("/post_msgs", (req, res) => {
    const message = req.body.message
    const userName = req.body.username

    const sqlIn = "INSERT INTO messages (userName, message) VALUES (?, ?)"
    db.query(sqlIn, [userName, message], (err, result) => {
        if (err) {
            res.send({ err: err })
        }
    })
})

app.listen(3010, () => {
    console.log('Server running on port 3010')
})