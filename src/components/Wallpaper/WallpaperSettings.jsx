import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import localforage from 'localforage';
import { Icon } from '@iconify/react';
import '../../assets/app.css';

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
  'Attaching file to government report...'
];

const mockFiles = [
  'sunset-overdrive-wallpaper.jpg',
  'best-meme-ever-lol.jpeg',
  'highres-space-photo.jpeg',
  'deepfried-cat-wallpaper.jpeg',
  'totally-not-virus-wallpaper.jpg'
];

export default function WallpaperSettings() {
  const messageRef = useRef(null);
  const barRef = useRef(null);
  const subtextRef = useRef(null);
  const [message, setMessage] = useState('');
  const [subtext, setSubtext] = useState('');
  const [uploading, setUploading] = useState(false);
  const [timesFooled, setTimesFooled] = useState(1);

  useEffect(() => {
    localforage.getItem('wallpaperAttempts').then((val) => {
      if (val && typeof val === 'number') setTimesFooled(val + 1);
    });
  }, []);

  const handleMockUpload = async () => {
    setUploading(true);
    const nextAttempt = timesFooled;
    setTimesFooled(nextAttempt);
    await localforage.setItem('wallpaperAttempts', nextAttempt);
    window.dispatchEvent(new Event('wallpaper:change'));

    const totalDuration = 25;
    const steps = subtextQueue.length;

    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        setSubtext(subtextQueue[i]);
      }, (i * totalDuration * 1000) / steps);
    }

    gsap.to(barRef.current, {
      xPercent: -100,
      duration: 20,
      ease: 'linear',
      onUpdate() {
        const matrix = barRef.current.getBoundingClientRect();
        const parent = barRef.current.parentElement.getBoundingClientRect();
        if (matrix.right < parent.left + 10 && subtextRef.current) {
          subtextRef.current.style.color = 'red';
        }
      },
      onComplete() {
        setSubtext('Hold on...');
        gsap.to(barRef.current, {
          xPercent: -250,
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
          }
        });
      }
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
        <div className="grid grid-cols-3 gap-3">
          {mockFiles.map((file, idx) => (
            <div
              key={idx}
              onClick={handleMockUpload}
              className="flex flex-col items-center cursor-pointer hover:opacity-75"
            >
              <Icon icon="mdi:file-image" className="text-4xl text-error" />
              <span className="text-xs font-semibold text-center mt-1 max-w-[80px] truncate">
                {file}
              </span>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="mt-4">
           <div
              ref={barRef}
              className="w-full h-3 bg-error rounded overflow-hidden mb-3 relative"
              style={{ width: '100%' }}
            ></div>
          <p
            ref={subtextRef}
            className="text-xs text-warning text-center"
          >
            {subtext}
          </p>
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
