import { create } from 'zustand';

const getPoints = (word) => {
    const len = word.length;
    if (len === 6) return 2000;
    if (len === 5) return 1200;
    if (len === 4) return 400;
    if (len === 3) return 100;
    return 0;
};

export const useGameStore = create((set, get) => ({
    useSeven: false,
    currentWord: '',
    availableLetters: [], // [{char,id}, ...]
    currentGuess: [],     // fixed length array with nulls or {char,id}
    guessedWords: new Set(),
    score: 0,
    timeLeft: 60,
    showAllWords: false,
    invalidGuess: false,
    timer: null,
    wordList: [],

    setUseSeven: (val) => set({ useSeven: val }),
    setCurrentWord: (word) => set({ currentWord: word }),
    setAvailableLetters: (letters) => set({ availableLetters: letters }),
    setCurrentGuess: (guess) => set({ currentGuess: guess }),
    setGuessedWords: (words) => set({ guessedWords: words }),
    setScore: (score) => set({ score }),
    setTimeLeft: (time) => set({ timeLeft: time }),
    setShowAllWords: (val) => set({ showAllWords: val }),
    setInvalidGuess: (val) => set({ invalidGuess: val }),
    setWordList: (list) => set({ wordList: list }),

    startTimer: () => {
        get().stopTimer();
        const timer = setInterval(() => {
            const time = get().timeLeft;
            if (time <= 1) {
                get().stopTimer();
                set({ timeLeft: 0, showAllWords: true });
            } else {
                set((state) => ({ timeLeft: state.timeLeft - 1 }));
            }
        }, 1000);
        set({ timer });
    },

    stopTimer: () => {
        const timer = get().timer;
        if (timer) clearInterval(timer);
        set({ timer: null });
    },

    resetGame: ({ chosen, scrambled }) => {
        // Initialize currentGuess as fixed length array of nulls
        const guessArray = new Array(chosen.length).fill(null);
        set({
            currentWord: chosen,
            availableLetters: scrambled,
            currentGuess: guessArray,
            guessedWords: new Set(),
            score: 0,
            timeLeft: 60,
            showAllWords: false,
            invalidGuess: false,
        });
    },

    validateGuess: (guess, base) => {
        const list = get().wordList;
        if (guess.length < 3 || guess.length > base.length) return false;
        const letters = base.split('');
        for (let char of guess) {
            const idx = letters.indexOf(char);
            if (idx === -1) return false;
            letters.splice(idx, 1);
        }
        return list.includes(guess);
    },

    submitGuess: (guess) => {
        if (typeof guess !== 'string') return;
        const lower = guess.toLowerCase();
        const state = get();

        if (!lower) return;
        if (state.guessedWords.has(lower)) {
            set({ invalidGuess: true });
            return;
        }

        const isValid = state.validateGuess(lower, state.currentWord);
        if (isValid) {
            const newSet = new Set(state.guessedWords);
            newSet.add(lower);
            // Return letters in currentGuess back to availableLetters
            const lettersToReturn = state.currentGuess.filter((l) => l !== null);
            set({
                guessedWords: newSet,
                score: state.score + getPoints(lower),
                currentGuess: new Array(state.currentWord.length).fill(null),
                invalidGuess: false,
                availableLetters: [...state.availableLetters, ...lettersToReturn],
            });
        } else {
            set({ invalidGuess: true });
        }
    },
}));
