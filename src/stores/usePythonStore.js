import { create } from 'zustand';

export const usePythonStore = create((set) => ({
  code: `print("Hello from HeadacheOS!")`,
  filename: 'Untitled.py',
  fileList: [],
  output: '',
  rotation: 0,
  loading: true,
  pyodide: null,

  setCode: (code) => set({ code }),
  setFilename: (filename) => set({ filename }),
  setFileList: (fileList) => set({ fileList }),
  setOutput: (output) => set({ output }),
  setRotation: (rotation) => set({ rotation }),
  setLoading: (loading) => set({ loading }),
  setPyodide: (pyodide) => set({ pyodide }),
}));
