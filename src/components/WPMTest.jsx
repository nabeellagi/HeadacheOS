import React, { useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import { useWPMStore } from '../stores/useWPMStore';
import '../assets/app.css';

export default function WPMTest() {
  const {
    gameStarted, loading, timer, text, input, gameEnded,
    showWarning, pauseInput,
    setInput, setGameEnded, startGame,
    incrementTimer, setPauseInput, setShowWarning,
    calculateWPM, getRoast
  } = useWPMStore();

  const inputRef = useRef(null);
  const intervalRef = useRef(null);
  const wrongStreakRef = useRef(0);

  useEffect(() => {
    if (gameStarted && !gameEnded) {
      intervalRef.current = setInterval(() => {
        incrementTimer();
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [gameStarted, gameEnded]);

  const handleInput = (e) => {
    if (pauseInput || gameEnded) return;

    const newValue = e.target.value;
    const newChar = newValue[newValue.length - 1];
    const expectedChar = text[newValue.length - 1];

    if (newChar && newChar !== expectedChar) {
      wrongStreakRef.current += 1;
    } else {
      wrongStreakRef.current = 0;
    }

    if (wrongStreakRef.current >= 2) {
      setPauseInput(true);
      setShowWarning(true);
      setTimeout(() => {
        setPauseInput(false);
        setShowWarning(false);
        inputRef.current.focus();
      }, 2000);
      wrongStreakRef.current = 0;
      return;
    }

    setInput(newValue);

    if (newValue.length === text.length) {
      clearInterval(intervalRef.current);
      setGameEnded(true);
    }
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
                  ⚠️ 2 typos in a row. Take a breath, pausing for 2 seconds...
                </div>
              )}
            </>
          )}

          {gameEnded && (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-success">Test Complete</h2>
              <p className="text-lg font-mono">Time: {timer}s</p>
              <p className="text-lg font-mono">WPM: {calculateWPM()}</p>
              <div className="text-warning text-sm italic mt-2">{getRoast()}</div>
              <button className="btn btn-outline mt-4" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
