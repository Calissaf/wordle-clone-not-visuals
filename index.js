const {createPool} = require('mysql');

const pool = createPool({
    host: "127.0.0.1",
    user: "wordleuser",
    password: "Firebrand.1",
    connectionLimit: 10 // optional
})

pool.query(`SELECT * FROM wordlist.words`, (err, result) => {
    return console.log(result)
});
