import React, { useEffect, useState, useRef } from 'react';
import WORD_LIST from './words'; // Assume you have a JS array export from your words.js
import './style.css';

const shuffle = (str) => [...str].sort(() => Math.random() - 0.5).join('');

const getPoints = (word) => {
  const len = word.length;
  if (len === 6) return 2000;
  if (len === 5) return 1200;
  if (len === 4) return 400;
  if (len === 3) return 100;
  return 0;
};

const isValidGuess = (guess, base) => {
  if (guess.length < 3 || guess.length > base.length) return false;
  const baseLetters = base.split('');
  for (let char of guess) {
    const index = baseLetters.indexOf(char);
    if (index === -1) return false;
    baseLetters.splice(index, 1);
  }
  return WORD_LIST.includes(guess);
};

const getAllValidWords = (base) => {
  return WORD_LIST.filter(word => {
    if (word.length < 3 || word.length > base.length) return false;
    const baseLetters = base.split('');
    for (let char of word) {
      const index = baseLetters.indexOf(char);
      if (index === -1) return false;
      baseLetters.splice(index, 1);
    }
    return true;
  });
};

export default function AnagramGame() {
  const [useSeven, setUseSeven] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [availableLetters, setAvailableLetters] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [guessedWords, setGuessedWords] = useState(new Set());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showAllWords, setShowAllWords] = useState(false);
  const [invalidGuess, setInvalidGuess] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    startGame();
    return () => clearInterval(timerRef.current);
  }, [useSeven]);

  useEffect(() => {
    if (timeLeft === 0) {
      clearInterval(timerRef.current);
      setShowAllWords(true);
    }
  }, [timeLeft]);

  const startGame = () => {
    const wordLength = useSeven ? 7 : 6;
    const candidates = WORD_LIST.filter(w => w.length === wordLength);
    let chosen = candidates[Math.floor(Math.random() * candidates.length)];
    let scrambled = shuffle(chosen);
    while (scrambled === chosen) scrambled = shuffle(chosen);
    setCurrentWord(chosen);
    setAvailableLetters(scrambled.split(''));
    setCurrentGuess([]);
    setGuessedWords(new Set());
    setScore(0);
    setTimeLeft(60);
    setShowAllWords(false);
    setInvalidGuess(false);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
  };

  const handleTileClick = (index) => {
    const char = availableLetters[index];
    if (!char) return;
    const newAvailable = [...availableLetters];
    newAvailable[index] = null;
    setAvailableLetters(newAvailable);
    setCurrentGuess([...currentGuess, char]);
    setInvalidGuess(false);
  };

  const handleGuessClick = (index) => {
    const char = currentGuess[index];
    const newGuess = [...currentGuess];
    newGuess.splice(index, 1);
    const newAvailable = [...availableLetters];
    const replaceIndex = newAvailable.indexOf(null);
    if (replaceIndex !== -1) {
      newAvailable[replaceIndex] = char;
    } else {
      newAvailable.push(char);
    }
    setCurrentGuess(newGuess);
    setAvailableLetters(newAvailable);
    setInvalidGuess(false);
  };

  const submitGuess = () => {
    const guess = currentGuess.join('').toLowerCase();
    if (!guess || guessedWords.has(guess)) {
      setCurrentGuess([]);
      setInvalidGuess(false);
      return;
    }

    if (isValidGuess(guess, currentWord)) {
      const points = getPoints(guess);
      setScore(score + points);
      setGuessedWords(new Set([...guessedWords, guess]));
      setInvalidGuess(false);

      const newAvailable = [...availableLetters];
      for (let char of currentGuess) {
        const indexToReplace = newAvailable.indexOf(null);
        if (indexToReplace !== -1) {
          newAvailable[indexToReplace] = char;
        } else {
          newAvailable.push(char);
        }
      }
      setAvailableLetters(newAvailable);
      setCurrentGuess([]);
    } else {
      setInvalidGuess(true);
    }
  };

  const shuffleLetters = () => {
    const restoredLetters = availableLetters.map((c, i) => c ?? currentGuess.shift());
    setAvailableLetters(shuffle(restoredLetters).split(''));
    setCurrentGuess([]);
    setInvalidGuess(false);
  };

  const letterClass = `letters-${currentWord.length}`;

  return (
    <div className="container">
      <div className="topbar">
        <h1>Anagram Game</h1>
        <div className="toggle-wrapper">
          <span className="label">6</span>
          <label className="switch">
            <input type="checkbox" checked={useSeven} onChange={e => setUseSeven(e.target.checked)} />
            <span className="slider round"></span>
          </label>
          <span className="label">7</span>
        </div>
      </div>
      <div className="timer" style={{ color: timeLeft <= 10 ? 'red' : 'inherit' }}>
        Time: {timeLeft}s
      </div>
      <div className={`guess-box ${letterClass}`}>
        {Array.from({ length: currentWord.length }).map((_, i) => (
          <div key={i} className="tile-slot">
            {currentGuess[i] && (
              <span className="tile tile-guess" onClick={() => handleGuessClick(i)}>
                {currentGuess[i].toUpperCase()}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className={`letter-bank ${letterClass}`}>
        {Array.from({ length: currentWord.length }).map((_, i) => (
          <div key={i} className="tile-slot">
            {availableLetters[i] && (
              <span className="tile" onClick={() => handleTileClick(i)}>
                {availableLetters[i].toUpperCase()}
              </span>
            )}
          </div>
        ))}
      </div>
      {invalidGuess && (
        <div style={{ color: 'crimson', fontSize: '1.2rem', marginTop: '0.5rem' }}>
          Not a valid word!
        </div>
      )}
      <div>
        <button className="submit-btn" onClick={submitGuess}>Submit</button>
        <button className="submit-btn" onClick={shuffleLetters}>Shuffle</button>
      </div>
      <div className="score">Score: {score}</div>
      {timeLeft === 0 && (
        <button onClick={startGame} style={{ display: 'inline-block' }}>Play Again</button>
      )}
      <div className="guess-list">
        {[...guessedWords].map(word => (
          <div key={word}>{word} +{getPoints(word)}</div>
        ))}
      </div>
      {showAllWords && (
        <div className="all-words" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
          <h3>All possible words:</h3>
          {getAllValidWords(currentWord).sort((a, b) => b.length - a.length || a.localeCompare(b)).map(word => (
            <div key={word}>{word} ({getPoints(word)}) {guessedWords.has(word) ? '✓' : ''}</div>
          ))}
        </div>
      )}
    </div>
  );
}