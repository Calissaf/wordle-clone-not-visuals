const {createPool} = require('mysql');

const pool = createPool({
    host: "127.0.0.1",
    user: "wordleuser",
    password: "Firebrand.1",
    connectionLimit: 10 // optional
})

let userChoice = "";
let computerChoice = "";
let attemps = 0;
let maxAttempts = 5;

function generateComputerChoice() {
    let wordCount = 0;
    let wordCountQuery = `SELECT COUNT(id) AS word_count FROM wordlist.words`; // change to allowed_words when finished
    let randomNumberChoice = 0;

    pool.query(wordCountQuery, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        }

        var data = JSON.parse(JSON.stringify(result));
        // console.log(`data ${data[0].word_count}`);
        wordCount = parseInt(data[0].word_count);

        findRandomNumber();
        findRandomWord();
    })

    function findRandomNumber() {
        randomNumberChoice = Math.floor(Math.random() *  wordCount) + 1;
        // console.log(`column length ${columnLength}`);
        // console.log(`random number choice ${randomNumberChoice}`);  
    }

    function findRandomWord () {

        let computerChoiceQuery = `SELECT word FROM wordlist.words WHERE id = ${randomNumberChoice}`;

        pool.query(computerChoiceQuery, (err, result) => {
            if (err) {
                console.log(err);
                throw err;
            }
    
            //console.log(result);
    
            var data = JSON.parse(JSON.stringify(result));
            console.log(`computer choice result: ${data[0].word}`)
            computerChoice = data[0].word;
            //return computerChoice;
        })
    }
}

function generateUserChoice() {
    const prompt = require('prompt-sync')();
    const userInput = prompt("Enter a 5 letter word: ");

    let wordID = 0;

    // console.log(`user input: ${userInput}`);
    // console.log(`user input length: ${userInput.length}`);
    // console.log(`regex: ${onlyLetters(userInput)}`);

    if (userInput.length == 5 && onlyLetters(userInput)) {
        userInput.toLowerCase();
        let checkWordAllowedQuery = `SELECT id FROM wordlist.words WHERE word = "${userInput}";`;

        // console.log(`user input: ${userInput}`);

        pool.query(checkWordAllowedQuery, (err, result) => {
            if (err) {
                console.log(err);
                throw err;
            }

            var data = JSON.parse(JSON.stringify(result));

            console.log(data[0].id);
            if (data[0].id != null)
            {
                wordID = parseInt(data[0].id);
            }

        })

        console.log(`word id: ${wordID}`)
    
        if (wordID > 0) {
            userChoice = userInput;
            attemps++;
            console.log(`user choice: ${userChoice}`);
            console.log(`attemps: ${attemps}`);
        } else {
            console.log("word not recognised");
            //generateUserChoice();
        }

    } else {
        console.log("input doesn't meet requirements");
        //generateUserChoice();
    }

}

function onlyLetters(checkString) {
    return /^[A-Za-z]+$/.test(checkString); 
}

generateComputerChoice();
//generateUserChoice();


