window.onload = async function () {
    startGame();
};


let currentWord = "";
let scrambled = "";
let guessedWords = new Set();
let score = 0;
let timeLeft = 60;
let timerInterval = null;
let availableLetters = [];
let currentGuess = [];

function shuffle(str) {
    return [...str].sort(() => Math.random() - 0.5).join('');
}

function isValidGuess(guess, base) {
    if (guess.length < 3 || guess.length > base.length) return false;
    const baseLetters = base.split('');
    for (let char of guess) {
        const index = baseLetters.indexOf(char);
        if (index === -1) return false;
        baseLetters.splice(index, 1);
    }
    return WORD_LIST.includes(guess);
}


function getPoints(word) {
    const len = word.length;
    if (len === 6) return 2000;
    if (len === 5) return 1200;
    if (len === 4) return 400;
    if (len === 3) return 100;
    return 0;
}

function renderTiles() {
    const bank = document.getElementById("letterBank");
    const guess = document.getElementById("guessBox");

    bank.innerHTML = "";
    guess.innerHTML = "";

    const maxTiles = currentWord.length;

    // Render available letter slots
    for (let i = 0; i < maxTiles; i++) {
        const slot = document.createElement("div");
        slot.className = "tile-slot";

        const char = availableLetters[i];
        if (char !== null && char !== undefined) {
            const tile = document.createElement("span");
            tile.className = "tile";
            tile.textContent = char.toUpperCase();
            tile.onclick = () => {
                currentGuess.push(char);
                availableLetters[i] = null;
                renderTiles();
            };
            slot.appendChild(tile);
        }

        bank.appendChild(slot);
    }

    // Render guess letter slots
    for (let i = 0; i < maxTiles; i++) {
        const slot = document.createElement("div");
        slot.className = "tile-slot";

        if (currentGuess[i]) {
            const char = currentGuess[i];
            const tile = document.createElement("span");
            tile.className = "tile tile-guess";
            tile.textContent = char.toUpperCase();
            tile.onclick = () => {
                const indexToReplace = availableLetters.indexOf(null);
                if (indexToReplace !== -1) {
                    availableLetters[indexToReplace] = char;
                } else {
                    availableLetters.push(char); // fallback
                }
                currentGuess.splice(i, 1);
                renderTiles();
            };
            slot.appendChild(tile);
        }

        guess.appendChild(slot);
    }
}


function submitGuess() {
    const guess = currentGuess.join("").toLowerCase();
    if (guessedWords.has(guess)) {
        currentGuess = [];
        renderTiles();
        return;
    }

    if (isValidGuess(guess, currentWord)) {
        guessedWords.add(guess);
        const points = getPoints(guess);
        score += points;
        document.getElementById("score").textContent = "Score: " + score;
        const list = document.getElementById("guessList");
        const entry = document.createElement("div");
        entry.textContent = `${guess} +${points}`;
        list.appendChild(entry);
    }
    // Restore each letter to the first available null slot
    for (let char of currentGuess) {
        const indexToReplace = availableLetters.indexOf(null);
        if (indexToReplace !== -1) {
            availableLetters[indexToReplace] = char;
        } else {
            availableLetters.push(char); // fallback
        }
    }


    currentGuess = [];
    renderTiles();
}



function startGame() {
    availableLetters = [];
    const useSeven = document.getElementById("useSeven").checked;
    const wordLength = useSeven ? 7 : 6;
    const candidates = WORD_LIST.filter(w => w.length === wordLength);
    currentWord = candidates[Math.floor(Math.random() * candidates.length)];
    scrambled = shuffle(currentWord);
    while (scrambled === currentWord) scrambled = shuffle(currentWord);
    availableLetters = scrambled.split('');
    currentGuess = [];
    renderTiles();


    document.getElementById("score").textContent = "Score: 0";
    document.getElementById("timer").textContent = "Time: 60s";
    document.getElementById("guessList").innerHTML = "";
    document.getElementById("allWords").innerHTML = "";
    document.getElementById("restartBtn").style.display = "none";

    guessedWords = new Set();
    score = 0;
    timeLeft = 60;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = `Time: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}



function getAllValidWords(base, wordList) {
    return wordList.filter(word => {
        if (word.length < 3 || word.length > base.length) return false;
        const baseLetters = base.split('');
        for (let char of word) {
            const index = baseLetters.indexOf(char);
            if (index === -1) return false;
            baseLetters.splice(index, 1);
        }
        return true;
    });
}

function endGame() {
    document.getElementById("restartBtn").style.display = "inline-block";

    const possibleWords = getAllValidWords(currentWord, WORD_LIST);
    const sorted = possibleWords.sort((a, b) => b.length - a.length || a.localeCompare(b));
    const html = sorted.map(word => {
        const points = getPoints(word);
        const mark = guessedWords.has(word) ? "✓" : "";
        return `<div>${word} (${points}) ${mark}</div>`;
    }).join("");
    document.getElementById("allWords").innerHTML = `<h3>All possible words:</h3>${html}`;
}

document.getElementById("useSeven").addEventListener("change", startGame);

startGame();