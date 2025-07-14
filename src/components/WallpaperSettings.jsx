import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import localforage from 'localforage';

const subtextQueue = [
  'Extracting EXIF metadata...',
  'Bypassing user permissions...',
  'Leaking IP to clipboard...',
  'Pinging North Korean DNS...',
  'Compiling spyware.exe...',
  'Storing password in plaintext...',
  'Formatting cloud drive...',
  'Rendering monkey NFT...',
  'Uploading to Reddit...',
  'Attaching file to government report...',
];

export default function WallpaperSettings() {
  const messageRef = useRef(null);
  const barRef = useRef(null);
  const subtextRef = useRef(null);
  const [message, setMessage] = useState('');
  const [subtext, setSubtext] = useState('');
  const [uploading, setUploading] = useState(false);
  const [timesFooled, setTimesFooled] = useState(1);

  // Fetch number of attempts from localForage
  useEffect(() => {
    localforage.getItem('wallpaperAttempts').then((val) => {
      if (val && typeof val === 'number') setTimesFooled(val + 1);
    });
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    // Update attempt count
    const nextAttempt = timesFooled;
    setTimesFooled(nextAttempt);
    await localforage.setItem('wallpaperAttempts', nextAttempt);

    // Dispatch fake wallpaper change
    window.dispatchEvent(new Event('wallpaper:change'));

    // Subtext sync by percent
    const totalDuration = 25; // seconds
    const steps = subtextQueue.length;
    const percentInterval = 100 / steps;

    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        setSubtext(subtextQueue[i]);
      }, (i * totalDuration * 1000) / steps);
    }

    // Animate progress from 100% to 0% over 20 seconds
    gsap.to(barRef.current, {
      width: '0%',
      duration: 20,
      ease: 'linear',
      onUpdate() {
        const width = parseFloat(barRef.current.style.width);
        if (width < 10 && subtextRef.current) {
          subtextRef.current.style.color = 'red';
        }
      },
      onComplete() {
        // Animate to -50% with final drama
        setSubtext('Wait what...');
        gsap.to(barRef.current, {
          width: '-50%',
          backgroundColor: 'red',
          duration: 5,
          onComplete: () => {
            const mockMessage = `This is the ${nextAttempt}${ordinal(nextAttempt)} time you were fooled. Your image sucks lol, use ours instead.`;
            setMessage(mockMessage);
            setUploading(false);
            gsap.fromTo(
              messageRef.current,
              { opacity: 0, scale: 0.9 },
              { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
            );
          },
        });
      },
    });
  };

  const ordinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return (
    <div className="w-[400px] h-[400px] p-6 bg-base-100 text-base-content font-mono border-2 border-error shadow-xl overflow-hidden relative">
      <h1 className="text-xl font-bold mb-2">Change Your Wallpaper</h1>
      <p className="mb-4 text-sm text-gray-500">Upload a wallpaper (this is your only hope)</p>

      {!uploading && (
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            required
          />
          <button type="submit" className="btn btn-error w-full">
            Upload Image
          </button>
        </form>
      )}

      {uploading && (
        <div className="mt-4">
          <div className="w-full h-3 bg-base-300 rounded overflow-hidden mb-3">
            <div
              ref={barRef}
              className="h-full bg-error transition-all"
              style={{ width: '100%' }}
            ></div>
          </div>
          <p ref={subtextRef} className="text-xs text-warning text-center">{subtext}</p>
        </div>
      )}

      {message && (
        <div
          ref={messageRef}
          className="absolute inset-0 flex items-center justify-center text-center text-error text-lg font-bold bg-black bg-opacity-80 p-4"
        >
          {message}
        </div>
      )}
    </div>
  );
}
