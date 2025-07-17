import { create } from 'zustand';

const useCatStore = create((set) => ({
  fileList: [],
  selectedImage: null,
  isViewerOpen: false,
  searchQuery: '',
  qteStage: null,

  setFileList: (newList) => set({ fileList: newList }),
  addToFileList: (files) =>
    set((state) => ({
      fileList: [...state.fileList, ...files.filter(
        (file) => !state.fileList.some((f) => f.name === file.name)
      )],
    })),
  setSelectedImage: (image) => set({ selectedImage: image }),
  setIsViewerOpen: (val) => set({ isViewerOpen: val }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setQteStage: (stage) => set({ qteStage: stage }),
  resetQTE: () =>
    set({ selectedImage: null, qteStage: null, isViewerOpen: false }),
}));
export default useCatStore;