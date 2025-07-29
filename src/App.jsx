import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { CoquetteToggle } from './CoquetteToggle';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from './store';
import WORD_LIST from './words';
import './styles/coquette.css';

const shuffleString = (str) => [...str].sort(() => Math.random() - 0.5).join('');

const getPoints = (word) => {
  const len = word.length;
  if (len === 6) return 2000;
  if (len === 5) return 1200;
  if (len === 4) return 400;
  if (len === 3) return 100;
  return 0;
};

const getAllValidWords = (base, list) => {
  return list.filter((word) => {
    if (word.length < 3 || word.length > base.length) return false;
    const letters = base.split('');
    for (let char of word) {
      const idx = letters.indexOf(char);
      if (idx === -1) return false;
      letters.splice(idx, 1);
    }
    return true;
  });
};

export default function AnagramGame() {
  const {
    useSeven,
    setUseSeven,
    currentWord,
    availableLetters,
    currentGuess,
    guessedWords,
    score,
    timeLeft,
    showAllWords,
    invalidGuess,
    setAvailableLetters,
    setCurrentGuess,
    setInvalidGuess,
    submitGuess,
    resetGame,
    startTimer,
    stopTimer,
    setWordList,
  } = useGameStore();

  const createLetterObjects = (word) =>
    word.split('').map((char, index) => ({ char, id: `${char}-${index}-${Date.now()}`, originalIndex: index }));

  // Initialize game
  useEffect(() => {
    setWordList(WORD_LIST);
    newGame();
    return stopTimer;
  }, [useSeven]);

  // Handle timer end
  useEffect(() => {
    if (timeLeft === 0) stopTimer();
  }, [timeLeft]);

  // Move letter from available to guess
  const moveLetterToGuess = useCallback(
    (letter) => {
      const newGuess = [...currentGuess];
      const firstEmpty = newGuess.findIndex((l) => l === null);
      if (firstEmpty === -1) return;

      newGuess[firstEmpty] = letter;
      setCurrentGuess(newGuess);
      setAvailableLetters(availableLetters.filter(l => l.id !== letter.id));
      setInvalidGuess(false);
    },
    [currentGuess, availableLetters, setCurrentGuess, setAvailableLetters, setInvalidGuess]
  );

  // Move letter from guess back to available
  const moveLetterToAvailable = useCallback(
    (letter) => {
      const newGuess = [...currentGuess];
      const idx = newGuess.findIndex((l) => l && l.id === letter.id);
      if (idx === -1) return;

      newGuess[idx] = null;
      setCurrentGuess(newGuess);
      setAvailableLetters([...availableLetters, letter]);
      setInvalidGuess(false);
    },
    [currentGuess, availableLetters, setCurrentGuess, setAvailableLetters, setInvalidGuess]
  );

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e) => {
      if (timeLeft === 0) return;

      if (e.key === 'Enter') {
        submitGuess(currentGuess.map((l) => (l ? l.char : '')).join(''));
      } else if (e.key === 'Backspace') {
        // Remove last filled slot (right to left)
        const lastFilledIndex = [...currentGuess]
          .reverse()
          .findIndex((l) => l !== null);
        if (lastFilledIndex === -1) return;

        const idx = currentGuess.length - 1 - lastFilledIndex;
        const letter = currentGuess[idx];
        moveLetterToAvailable(letter);
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        const key = e.key.toLowerCase();
        // Find the letter in currentGuess first (to remove it)
        const guessIndex = currentGuess.findIndex((l) => l && l.char === key);
        if (guessIndex !== -1) {
          // Remove from guess and return to available
          const letter = currentGuess[guessIndex];
          moveLetterToAvailable(letter);
          return;
        }

        // If not in guess, try to add from available letters
        const letter = availableLetters.find((l) => l.char === key);
        if (letter) {
          moveLetterToGuess(letter);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [availableLetters, currentGuess, timeLeft, submitGuess, moveLetterToGuess, moveLetterToAvailable]);

  const newGame = () => {
    const wordLength = useSeven ? 7 : 6;
    const candidates = WORD_LIST.filter((w) => w.length === wordLength);
    let chosen = candidates[Math.floor(Math.random() * candidates.length)];
    let scrambled = shuffleString(chosen);
    while (scrambled === chosen) scrambled = shuffleString(chosen);

    resetGame({
      chosen,
      scrambled: createLetterObjects(scrambled),
    });
    startTimer();
  };

  const shuffleLetters = () => {
    const allLetters = [...availableLetters, ...currentGuess.filter(Boolean)];
    const shuffled = shuffleString(allLetters.map((l) => l.char)).split('');
    // Preserve original indices when reshuffling
    const newLetters = shuffled.map((char, i) => ({
      char,
      id: `${char}-${i}-${Date.now()}`,
      originalIndex: i
    }));
    setAvailableLetters(newLetters);
    setCurrentGuess(new Array(currentWord.length).fill(null));
    setInvalidGuess(false);
  };

  const clearGuess = () => {
    const lettersToReturn = currentGuess.filter(Boolean);
    setAvailableLetters([...availableLetters, ...lettersToReturn]);
    setCurrentGuess(new Array(currentWord.length).fill(null));
    setInvalidGuess(false);
  };

  const currentGuessWord = currentGuess.map((l) => (l ? l.char : '')).join('');
  const isAlreadyGuessed = guessedWords.has(currentGuessWord.toLowerCase());

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-screen-sm mx-auto">
      <h1 className="text-4xl font-bold">Anagram Game</h1>
      <div className="flex flex-row gap-6 items-center mt-2">
        {/* Coquette Theme Switch */}
        <div className="flex flex-row gap-2 items-center">
          <CoquetteToggle />
        </div>
        {/* 6/7 Switch */}
        <div className="flex flex-row gap-2 items-center">
          <span className="text-sm">67</span>
          <Switch checked={useSeven} onCheckedChange={setUseSeven} />
        </div>
      </div>

      <div className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-600' : ''}`}>
        Time: {timeLeft}s
      </div>

      {/* Alert Section - Fixed positioning */}
      <div className="h-16 flex items-center justify-center w-full">
        <AnimatePresence>
          {invalidGuess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Alert variant="destructive" className="w-fit">
                <AlertTitle className="sr-only">Invalid</AlertTitle>
                <AlertDescription>
                  {isAlreadyGuessed
                    ? 'You already guessed that word!'
                    : 'Not a valid word!'}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Card className="w-full">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-4 items-center justify-center">
            {/* Guess Row - Fixed layout */}
            <div className="flex gap-2">
              {Array.from({ length: currentWord.length }).map((_, i) => {
                const letter = currentGuess[i];
                return (
                  <div
                    key={`guess-slot-${i}`}
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border rounded flex items-center justify-center"
                  >
                    {letter ? (
                      <motion.div
                        key={letter.id}
                        layoutId={letter.id}
                        className="w-full h-full flex items-center justify-center cursor-pointer select-none hover:bg-gray-50 rounded"
                        onClick={() => moveLetterToAvailable(letter)}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {letter.char.toUpperCase()}
                      </motion.div>
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Letter Bank Row - Fixed layout */}
            <div className="flex gap-2">
              {Array.from({ length: currentWord.length }).map((_, i) => {
                // Find letter that belongs in this original position
                const letter = availableLetters.find(l => l.originalIndex === i);
                return (
                  <div
                    key={`bank-slot-${i}`}
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 border rounded flex items-center justify-center"
                  >
                    {letter ? (
                      <motion.div
                        key={letter.id}
                        layoutId={letter.id}
                        className="w-full h-full flex items-center justify-center cursor-pointer select-none hover:bg-gray-50 rounded"
                        onClick={() => moveLetterToGuess(letter)}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {letter.char.toUpperCase()}
                      </motion.div>
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={() => submitGuess(currentGuessWord)}>
              Submit
            </Button>
            <Button onClick={shuffleLetters} variant="secondary">
              Shuffle
            </Button>
            <Button onClick={clearGuess} variant="ghost">
              Clear
            </Button>
          </div>

          <div className="text-center text-lg font-semibold">Score: {score}</div>

          {timeLeft === 0 && (
            <div className="flex justify-center">
              <Button onClick={newGame}>Play Again</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="w-full">
        <h2 className="font-semibold text-lg mb-2">Guessed Words:</h2>
        <div className="flex flex-wrap gap-2">
          {[...guessedWords].map((word) => (
            <span key={word} className="text-sm bg-gray-100 px-2 py-1 rounded">
              {word} +{getPoints(word)}
            </span>
          ))}
        </div>
      </div>

      {showAllWords && (
        <div className="w-full max-h-60 overflow-y-auto mt-4">
          <h3 className="font-medium">All Possible Words:</h3>
          {getAllValidWords(currentWord, WORD_LIST)
            .sort((a, b) => b.length - a.length || a.localeCompare(b))
            .map((word) => {
              const isGuessed = guessedWords.has(word);
              return (
                <div key={word} className="flex items-center gap-2 text-sm py-1">
                  <span className={isGuessed ? "font-semibold text-green-600" : ""}>
                    {word}
                  </span>
                  {isGuessed ? (
                    <Checkbox checked disabled className="pointer-events-none" />
                  ) : (
                    <span className="text-gray-500">+{getPoints(word)}</span>
                  )}
                </div>
              );
            })}
        </div>
      )}

    </div>
  );
}