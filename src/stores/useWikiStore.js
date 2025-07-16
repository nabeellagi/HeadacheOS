import { create } from "zustand";

const useWikiStore = create((set) => ({
  query: "",
  results: null,
  offline: false,
  notFound: false,
  iframeUrl: null,
  loading: false,
  message: "",

  gameStarted: false,
  clickCount: 0,
  startTime: null,
  buttonPos: { top: "0px", left: "0px", scale: 1 },

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setOffline: (offline) => set({ offline }),
  setNotFound: (notFound) => set({ notFound }),
  setIframeUrl: (url) => set({ iframeUrl: url }),
  setLoading: (loading) => set({ loading }),
  setMessage: (message) => set({ message }),

  startGame: () =>
    set({
      gameStarted: true,
      clickCount: 0,
      startTime: Date.now(),
    }),

  endGame: () => set({ gameStarted: false }),

  incrementClick: () => set((state) => ({ clickCount: state.clickCount + 1 })),

  setButtonPos: (pos) => set({ buttonPos: pos }),
}));
export default useWikiStore;
