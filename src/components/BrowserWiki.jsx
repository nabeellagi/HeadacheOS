import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import "../assets/app.css";

function BrowserWiki() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [offline, setOffline] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [gameStarted, setGameStarted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [buttonPos, setButtonPos] = useState({
    top: "0px",
    left: "0px",
    scale: 1,
  });

  const searchRef = useRef(null);
  const browserRef = useRef(null);
  const loaderRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    gsap.from(browserRef.current, { opacity: 0, y: 50, duration: 1 });
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "CapsLock") {
      e.preventDefault();
      return;
    }
    if (e.key === " ") {
      e.preventDefault();
      const randomSpaces = " ".repeat(Math.floor(Math.random() * 4) + 1);
      setQuery((prev) => prev + randomSpaces);
    }
    if (e.key === "Enter") {
      initiateGame();
    }
  };

  const handleInput = (e) => {
    let val = e.target.value;
    val = val.replace(/[A-Z]/g, (c) => c.toLowerCase());
    setQuery(val);
  };

  const initiateGame = () => {
    setGameStarted(true);
    setClickCount(0);
    setStartTime(Date.now());
    gsap.to(buttonRef.current, { scale: 0.8, duration: 0.3 });
  };

  const handleGameClick = () => {
    if (!gameStarted) {
      initiateGame();
      return;
    }

    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed > 10) {
      setGameStarted(false);
      setMessage("⏰ Too slow! Try again.");
      gsap.to(buttonRef.current, { scale: 1, duration: 0.3 });
      return;
    }

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 4) {
      setGameStarted(false);
      gsap.to(buttonRef.current, { scale: 1, duration: 0.3 });
      searchWiki();
    } else {
      const maxTop = window.innerHeight - 100;
      const maxLeft = window.innerWidth - 200;
      const randomTop = Math.floor(Math.random() * maxTop);
      const randomLeft = Math.floor(Math.random() * maxLeft);

      setButtonPos({
        top: `${randomTop}px`,
        left: `${randomLeft}px`,
        scale: 0.8,
      });
      gsap.to(buttonRef.current, {
        top: randomTop,
        left: randomLeft,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  };

  const searchWiki = async () => {
    const offlineChance = Math.random();
    const notFoundChance = Math.random();
    const adChance = Math.random();

    setLoading(true);
    setResults(null);
    setOffline(false);
    setNotFound(false);
    setMessage("");

    gsap.fromTo(
      loaderRef.current,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" }
    );

    setTimeout(async () => {
      if (offlineChance < 0.5) {
        setOffline(true);
        setLoading(false);
        setMessage("⚠️ Hey, is it offline or online? Idk, do something");
        return;
      }

      try {
        const res = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
            query
          )}&format=json&origin=*`
        );
        const data = await res.json();

        if (notFoundChance < 0.1 || data.query.search.length === 0) {
          setNotFound(true);
          setResults(null);
          setMessage("❌ 404? Maybe lost in the void...");
        } else {
          setResults(data.query.search);
          if (adChance < 1 / 6)
            setMessage("🤑 Tired of Wikipedia? Pay 9999 gold");
        }
      } catch (e) {
        setResults(null);
        setMessage("🚫 Unexpected error occurred");
      }

      setLoading(false);
    }, 1000);
  };

  const openArticle = (title) => {
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    setIframeUrl(url);
  };

  return (
    <div
      ref={browserRef}
      className="mockup-browser border bg-base-200 max-w-full w-full min-h-[90vh] shadow-lg relative"
    >
      <div className="mockup-browser-toolbar">
        <div className="input">https://headacheOS.search/wiki</div>
      </div>
      <div className="flex flex-col gap-4 p-4 w-full">
        {!iframeUrl && (
          <>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Search Wikipedia..."
                className="input input-bordered w-full"
              />
              <button
                ref={buttonRef}
                onClick={handleGameClick}
                className="btn btn-primary fixed z-50"
                style={{
                  top: buttonPos.top,
                  left: buttonPos.left,
                  transform: `scale(${buttonPos.scale})`,
                }}
              >
                {gameStarted ? `Click Me (${clickCount}/4)` : "Search"}
              </button>
            </div>

            {loading && (
              <div
                ref={loaderRef}
                className="flex justify-center items-center p-4"
              >
                <span className="loading loading-bars loading-lg"></span>
              </div>
            )}

            {message && !loading && (
              <div className="alert alert-info shadow-md text-center">
                {message}
              </div>
            )}

            {results && !loading && (
              <ul className="menu bg-base-100 rounded-box w-full shadow-md">
                {results.map((result) => (
                  <li key={result.pageid}>
                    <a
                      onClick={() => openArticle(result.title)}
                      className="text-info hover:underline"
                    >
                      {result.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {iframeUrl && (
          <div className="relative w-full h-[70vh]">
            <button
              onClick={() => setIframeUrl(null)}
              className="btn btn-error absolute top-2 left-2 z-10"
            >
              ← Back
            </button>
            <iframe
              src={iframeUrl}
              title="Wikipedia Viewer"
              className="w-full h-full rounded-lg border border-base-content"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowserWiki;
