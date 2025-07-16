import { Howl } from 'howler';

const soundCache = new Map();

/**
 * Plays a cached sound by filename.
 * @param {string} filename - Just the filename without extension, like 'click', 'boop', etc.
 */
export function clickSound(filename) {
  if (!filename) return;

  const path = `/sfx/${filename}.ogg`;

  if (soundCache.has(path)) {
    soundCache.get(path).play();
    return;
  }

  const sound = new Howl({
    src: [path],
    volume: 0.5,
    onloaderror: (id, err) => console.error('Sound load error:', err),
    onplayerror: (id, err) => {
      console.warn('Trying to unlock autoplay...');
      sound.once('unlock', () => sound.play());
    },
  });

  soundCache.set(path, sound);
  sound.play();
}
