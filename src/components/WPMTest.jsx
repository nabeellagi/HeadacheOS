import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { nanoid } from 'nanoid';
import '../assets/app.css'

const CHAR_SET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;:",.<>?/`~\\';

const generateText = (length = 200) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)];
  }
  return result;
};

export default function WPMTest (){
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [gameEnded, setGameEnded] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pauseInput, setPauseInput] = useState(false);

  const intervalRef = useRef(null);
  const inputRef = useRef(null);
  const wrongStreakRef = useRef(0);

  useEffect(() => {
    if (gameStarted && !gameEnded) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [gameStarted, gameEnded]);

  const startGame = () => {
    setLoading(true);
    gsap.to("#loadingText", { opacity: 1, duration: 1, repeat: -1, yoyo: true });

    setTimeout(() => {
      setText(generateText());
      setTimer(5); 
      setGameStarted(true);
      setLoading(false);
      setInput('');
      inputRef.current.focus();
      clearInterval(intervalRef.current);
    }, 5000);
  };

  const handleInput = (e) => {
    if (pauseInput || gameEnded) return;

    const newValue = e.target.value;
    const newChar = newValue[newValue.length - 1];
    const expectedChar = text[newValue.length - 1];

    // Pause if wrong 5 in a row
    if (newChar && newChar !== expectedChar) {
      wrongStreakRef.current += 1;
    } else {
      wrongStreakRef.current = 0;
    }

    if (wrongStreakRef.current >= 5) {
      setShowWarning(true);
      setPauseInput(true);
      setTimeout(() => {
        setPauseInput(false);
        setShowWarning(false);
        inputRef.current.focus();
      }, 2000);
      wrongStreakRef.current = 0;
      return;
    }

    setInput(newValue);

    // Game ends if input is complete
    if (newValue.length === text.length) {
      clearInterval(intervalRef.current);
      setGameEnded(true);
    }
  };

  const calculateWPM = () => {
    if (timer === 0) return 0;
    const correctChars = [...input].filter((char, i) => char === text[i]).length;
    return Math.round((correctChars / 5) / (timer / 60));
  };

  const getRoast = (wpm) => {
    if (wpm > 120) return "You're an alien. Go touch grass.";
    if (wpm > 80) return "Your fingers probably evolved.";
    if (wpm > 50) return "Pretty fast. Have you done this before?";
    if (wpm > 30) return "Acceptable. But meh.";
    if (wpm > 10) return "Did you just wake up?";
    return "You type like you're underwater.";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 text-center px-4">
      {!gameStarted && !loading && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Welcome to the HeadacheOS WPM Test</h1>
          <p className="text-sm opacity-60">Warning: This test uses random symbols and no words. Prepare yourself.</p>
          <button className="btn btn-primary" onClick={startGame}>Begin Test</button>
        </div>
      )}

      {loading && (
        <div id="loadingText" className="text-lg font-mono mt-10 text-base">
          Initializing scrambled memory sequence...
        </div>
      )}

      {gameStarted && (
        <div className="w-full max-w-3xl mt-6 space-y-6">
          {!gameEnded && (
            <>
              <div className="text-left text-xs font-mono text-warning">Time: {timer}s</div>
              <div className="p-4 bg-base-100 border border-base-300 rounded overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                {text.split('').map((char, idx) => {
                  const typedChar = input[idx];
                  let className = '';
                  if (typedChar == null) className = 'opacity-50';
                  else if (typedChar === char) className = 'text-success';
                  else className = 'text-error';
                  return <span key={nanoid()} className={className}>{char}</span>;
                })}
              </div>
              <textarea
                ref={inputRef}
                className="textarea textarea-bordered w-full font-mono text-sm"
                value={input}
                onChange={handleInput}
                rows={4}
                placeholder={pauseInput ? "Paused for 2s..." : "Type here..."}
                disabled={pauseInput}
              />
              <div className="text-xl font-bold">WPM: {calculateWPM()}</div>
              {showWarning && (
                <div className="text-error text-sm font-mono mt-2">
                  ⚠️ 5 typos in a row. Take a breath, pausing for 2 seconds...
                </div>
              )}
            </>
          )}

          {gameEnded && (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-success">Test Complete</h2>
              <p className="text-lg font-mono">Time: {timer}s</p>
              <p className="text-lg font-mono">WPM: {calculateWPM()}</p>
              <div className="text-warning text-sm italic mt-2">{getRoast(calculateWPM())}</div>
              <button className="btn btn-outline mt-4" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};