import { create } from 'zustand';

const CHAR_SET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;:",.<>?/`~\\';

const generateText = (length = 200) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)];
  }
  return result;
};

export const useWPMStore = create((set, get) => ({
  gameStarted: false,
  loading: false,
  timer: 0,
  text: '',
  input: '',
  gameEnded: false,
  showWarning: false,
  pauseInput: false,
  wrongStreak: 0,

  setInput: (val) => set({ input: val }),
  setGameStarted: (val) => set({ gameStarted: val }),
  setLoading: (val) => set({ loading: val }),
  setTimer: (val) => set({ timer: val }),
  setText: (val) => set({ text: val }),
  setGameEnded: (val) => set({ gameEnded: val }),
  setShowWarning: (val) => set({ showWarning: val }),
  setPauseInput: (val) => set({ pauseInput: val }),
  setWrongStreak: (val) => set({ wrongStreak: val }),

  incrementTimer: () => set((state) => ({ timer: state.timer + 1 })),

  startGame: () => {
    set({ loading: true });

    setTimeout(() => {
      set({
        text: generateText(),
        input: '',
        timer: 5,
        gameStarted: true,
        gameEnded: false,
        loading: false,
        wrongStreak: 0,
        pauseInput: false,
        showWarning: false
      });
    }, 5000);
  },

  calculateWPM: () => {
    const { input, text, timer } = get();
    if (timer === 0) return 0;
    const correctChars = [...input].filter((char, i) => char === text[i]).length;
    return Math.round((correctChars / 5) / (timer / 60));
  },

  getRoast: () => {
    const wpm = get().calculateWPM();
    if (wpm > 120) return "You're an alien. Go touch grass.";
    if (wpm > 80) return "Your fingers probably evolved.";
    if (wpm > 50) return "Pretty fast. Have you done this before?";
    if (wpm > 30) return "Acceptable. But meh.";
    if (wpm > 10) return "Did you just wake up?";
    return "You type like you're underwater.";
  }
}));
