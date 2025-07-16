import { create } from 'zustand';

const songList = [
  { name: 'Beach', creator: 'swarajthegreat', src: '/music/Beach.mp3' },
  { name: 'Dawn', creator: 'swarajthegreat', src: '/music/Dawn.mp3' },
  { name: 'Evening', creator: 'swarajthegreat', src: '/music/Evening.mp3' },
  { name: 'Gazing', creator: 'swarajthegreat', src: '/music/Gazing.mp3' },
  { name: 'Midnight', creator: 'swarajthegreat', src: '/music/Midnight.mp3' },
];

const getAverageIndex = (nums) => {
  const avg = Math.floor(nums.reduce((a, b) => a + b, 0) / nums.length);
  return Math.min(songList.length - 1, avg);
};

const useMusicStore = create((set, get) => ({
  currentIndex: 0,
  volumeSlots: [10, 10, 10, 10, 10],
  locked: [false, false, false, false, false],
  spinNums: [0, 0, 0],
  isPlaying: true,
  isLoading: false,
  songList,
  getAverageIndex,
  toggleLock: (index) => {
    const { locked } = get();
    const updated = [...locked];
    updated[index] = !updated[index];
    set({ locked: updated });
  },
  rollVolumes: () => {
    const { locked } = get();
    const newSlots = get().volumeSlots.map((v, i) =>
      locked[i] ? v : Math.floor(Math.random() * 21)
    );
    set({ volumeSlots: newSlots });
  },
  setSpinNums: (nums) => set({ spinNums: nums }),
  setCurrentIndex: (idx) => set({ currentIndex: idx }),
  setLoading: (loading) => set({ isLoading: loading }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlayState: (val) => set({ isPlaying: val }),
}));

export default useMusicStore;
