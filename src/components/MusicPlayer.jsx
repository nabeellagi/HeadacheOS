import React, { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import gsap from 'gsap';
import { Icon } from '@iconify/react';
import useMusicStore from '../stores/useMusicStore';
import '../assets/app.css';
import '@fontsource/roboto-slab';

export default function MusicPlayer() {
  const {
    currentIndex,
    volumeSlots,
    locked,
    spinNums,
    isPlaying,
    isLoading,
    songList,
    getAverageIndex,
    toggleLock,
    rollVolumes,
    setSpinNums,
    setCurrentIndex,
    setLoading,
    togglePlay,
    setPlayState,
  } = useMusicStore();

  const howlRef = useRef(null);
  const spinRef = useRef([]);
  const volumeBtnRef = useRef([]);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationIdRef = useRef(null);

  const totalVolume = volumeSlots.reduce((a, b) => a + b, 0);

  const setupVisualizer = (ctx, source) => {
    const analyser = ctx.createAnalyser();
    source.connect(analyser);
    analyser.connect(ctx.destination);
    analyser.fftSize = 64;
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    drawVisualizer();
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const renderFrame = () => {
      animationIdRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ffcc';
      const barWidth = canvas.width / dataArray.length;

      dataArray.forEach((value, i) => {
        const barHeight = (value / 255) * canvas.height;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
      });
    };

    renderFrame();
  };

  const playSong = (index) => {
    if (howlRef.current) {
      howlRef.current.stop();
    }

    setLoading(true);

    howlRef.current = new Howl({
      src: [songList[index].src],
      volume: Math.min(1, totalVolume / 100),
      html5: true,
      onload: () => setLoading(false),
      onplay: () => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const src = ctx.createMediaElementSource(howlRef.current._sounds[0]._node);
        setupVisualizer(ctx, src);
      },
    });

    howlRef.current.play();
    setPlayState(true);
  };

  useEffect(() => {
    playSong(currentIndex);
    return () => cancelAnimationFrame(animationIdRef.current);
  }, [currentIndex]);

  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(Math.min(1, totalVolume / 100));
    }
  }, [volumeSlots]);

  const handleSpin = () => {
    const randNums = [
      Math.floor(Math.random() * songList.length),
      Math.floor(Math.random() * songList.length),
      Math.floor(Math.random() * songList.length),
    ];
    setSpinNums(randNums);

    randNums.forEach((num, i) => {
      gsap.to(spinRef.current[i], {
        y: -num * 40,
        duration: 1 + i * 0.4,
        ease: 'expo.out',
        filter: 'blur(4px)',
        onComplete: () => {
          gsap.to(spinRef.current[i], { filter: 'blur(0px)', duration: 0.3 });
        }
      });
    });

    setTimeout(() => {
      setCurrentIndex(getAverageIndex(randNums));
    }, 1400);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-base-200 p-4 animate-fadeIn font-['Roboto_Slab']">
      {isLoading && <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-60 text-white text-xl z-50">Loading...</div>}
      <div className="backdrop-blur-md bg-base-300/80 p-6 rounded-xl shadow-2xl w-full max-w-lg border border-base-content">
        <h2 className="text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2">
          <Icon icon="mdi:headphones" className="text-2xl" /> HeadacheOS Player
        </h2>

        <div className="text-center mb-4">
          <p className="text-xl font-semibold">{songList[currentIndex].name}</p>
          <p className="text-md text-gray-500">by {songList[currentIndex].creator}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-base-100/90 p-4 rounded-md border border-base-content shadow-inner">
            <p className="font-semibold mb-2 flex items-center gap-2">
              <Icon icon="ic:round-volume-up" className="text-xl" /> Volume Slots (Total: {totalVolume}%)
            </p>
            <div className="grid grid-cols-5 gap-2">
              {volumeSlots.map((val, i) => (
                <div key={i} className="tooltip tooltip-top" data-tip={locked[i] ? "Locked" : "Unlocked"}>
                  <button
                    ref={el => volumeBtnRef.current[i] = el}
                    onClick={() => toggleLock(i)}
                    className={`btn btn-sm flex flex-col items-center justify-center transition-all text-lg ${locked[i] ? 'btn-warning' : 'btn-outline'}`}
                  >
                    <span>{val}</span>
                  </button>
                </div>
              ))}
            </div>

            <button className="btn btn-secondary w-full mt-3" onClick={() => {
              rollVolumes();
              volumeBtnRef.current.forEach((btn, i) => {
                if (!locked[i]) {
                  gsap.set(btn, { rotateY: 0 });
                  gsap.fromTo(
                    btn,
                    { rotateY: 0 },
                    { rotateY: 360 * 2, duration: 1, ease: 'power2.inOut' }
                  );
                }
              });
            }}>
              <Icon icon="mdi:dice-multiple" className="mr-2" /> Roll Volume
            </button>
          </div>

          <div className="flex gap-2">
            <button className="btn btn-primary flex-1" onClick={handleSpin}>
              <Icon icon="mdi:slot-machine" className="mr-2" /> Spin Song
            </button>
            <button
              className={`btn flex-1 ${isPlaying ? 'btn-error' : 'btn-success'}`}
              onClick={() => {
                if (howlRef.current) {
                  isPlaying ? howlRef.current.pause() : howlRef.current.play();
                  togglePlay();
                }
              }}
            >
              <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} className="mr-2" />
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-12 h-12 overflow-hidden border border-base-content bg-base-100 rounded shadow-lg">
                <div ref={(el) => (spinRef.current[i] = el)} className="transition-transform">
                  {[...Array(songList.length)].map((_, j) => (
                    <div key={j} className="text-center text-xl h-10 leading-10 font-bold">
                      {j}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <canvas ref={canvasRef} width={600} height={150} className="mt-6 border border-base-content rounded w-full"></canvas>
        </div>
      </div>
    </div>
  );
}
