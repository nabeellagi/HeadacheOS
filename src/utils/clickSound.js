import { Howl } from 'howler';

const soundCache = new Map();

/**
 * Plays a cached sound by filename.
 * @param {string} filename - Just the filename without extension, like 'click', 'boop', etc.
 * @param {number} [volume=1.0] - Optional volume between 0.0 and 1.0
 */
export function clickSound(filename, volume = 1.0) {
  if (!filename) return;

  const path = `/sfx/${filename}.ogg`;

  if (soundCache.has(path)) {
    const cachedSound = soundCache.get(path);
    cachedSound.volume(volume); // update volume if changed
    cachedSound.play();
    return;
  }

  const sound = new Howl({
    src: [path],
    volume,
    onloaderror: (id, err) => console.error('Sound load error:', err),
    onplayerror: (id, err) => {
      console.warn('Trying to unlock autoplay...');
      sound.once('unlock', () => sound.play());
    },
  });

  soundCache.set(path, sound);
  sound.play();
}
