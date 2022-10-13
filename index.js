const {createPool} = require('mysql');
const prompt = require('prompt-sync')();

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
    let wordCountQuery = `SELECT COUNT(id) AS word_count FROM wordlist.allowed_words`; // change to allowed_words when finished
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

        let computerChoiceQuery = `SELECT word FROM wordlist.allowed_words WHERE id = ${randomNumberChoice}`;

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
            generateUserChoice();
        })
    }
}

function generateUserChoice() {
    const userInput = prompt("Enter a 5 letter word: ");

    let wordID = 0;

    // console.log(`user input: ${userInput}`);
    // console.log(`user input length: ${userInput.length}`);
    // console.log(`regex: ${onlyLetters(userInput)}`);

    if (userInput.length == 5 && onlyLetters(userInput)) {
        userInput.toLowerCase();
        let checkWordAllowedQuery = `SELECT IFNULL((SELECT id FROM wordlist.allowed_words WHERE word = "${userInput}"), 0) AS id;`;

        // console.log(`user input: ${userInput}`);

        pool.query(checkWordAllowedQuery, (err, result) => {
            if (err) {
                console.log(err);
                throw err;
            }

            var data = JSON.parse(JSON.stringify(result));

            //console.log(data);
            wordID = parseInt(data[0].id);

            checkWordID();
        })

    } else {
        console.log("input doesn't meet requirements");
        generateUserChoice();
    }

    function checkWordID() {
        if (wordID > 0) {
            userChoice = userInput;
            attemps++;
            // console.log(`user choice: ${userChoice}`);
            console.log(`attemps: ${attemps}`);
            checkWin();
        } else {
            console.log("word not recognised");
            generateUserChoice();
        } 
    }

}

function onlyLetters(checkString) {
    return /^[A-Za-z]+$/.test(checkString); 
}

function checkWin() {
    //console.log(`user choice: ${userChoice}`)
    //console.log(`computer choice: ${computerChoice}`)

    if (userChoice === computerChoice){
        console.log("Winner!!");
        console.log(`You took ${attemps} attemps`);
        return;
    }

    let sumTotal = 0;
    let userChoiceArray = Array.from(userChoice);
    let computerChoiceArray = Array.from(computerChoice);
    let winPositions = [0,0,0,0,0];
    let winPositionColors = ["grey", "grey", "grey", "grey", "grey"];
    let checkedLetters = ["", "", "", "", ""];

    for (let i = 0; i < userChoiceArray.length; i++) {
        if(userChoiceArray[i] === computerChoiceArray[i]){
            winPositions[i] = 2;
            winPositionColors[i] = "green";
            if (checkedLetters.includes(userChoiceArray[i]) == false) {
                checkedLetters[i] = userChoiceArray[i];
            }
        }
    }

    console.log(`checked chars: ${checkedLetters}`)

    for (let j = 0; j < userChoiceArray.length; j++) {
        let letterOccurencesInComputerChoice = (computerChoice.match(/userChoiceArray[i]/g) || []).length;
        
        if (computerChoice.includes(userChoiceArray[j]) && checkedLetters.includes(userChoiceArray[j]) == false || computerChoice.includes(userChoiceArray[j]) && checkedLetters.includes(userChoiceArray[j]) == true && letterOccurencesInComputerChoice > 1 && winPositions[j] == 0) {
            winPositions[j] = 1;
            winPositionColors[j] = "yellow";
        }

        sumTotal += winPositions[j];
        
    }
    
    console.log(`letter: ${userChoiceArray}\ncolor: ${winPositionColors}`);

    if (sumTotal == 10)
            {
                console.log("Winner!!");
                return;
            } else if (attemps < maxAttempts) {
                console.log(`${attemps} attempt, ${(maxAttempts - attemps)} attemps remaining`);
                generateUserChoice();
            } else {
                console.log(`no attempts left word was: ${computerChoice}`);
                return;
            }

}

generateComputerChoice();


