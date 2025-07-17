import localforage from 'localforage';

const store = localforage.createInstance({
  name: 'headacheos_pyfiles',
});

export const saveFile = async (filename, code) => {
  await store.setItem(filename, code);
  const keys = await store.keys();
  const recentKeys = keys.filter(k => k !== filename).concat(filename);

  if (recentKeys.length > 3) {
    const toDelete = recentKeys.slice(0, recentKeys.length - 3);
    for (const key of toDelete) {
      await store.removeItem(key);
    }
    return recentKeys.slice(-3);
  }
  return recentKeys;
};

export const loadFile = (filename) => store.getItem(filename);
export const getFileList = () => store.keys();
