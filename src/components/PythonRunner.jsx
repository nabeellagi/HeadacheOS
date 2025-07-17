import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import gsap from "gsap";
import tippy from "tippy.js";
import { Icon } from "@iconify/react";
import { usePythonStore } from "../stores/usePythonStore";
import { saveFile, loadFile, getFileList } from "../utils/pyFileStore";

import "tippy.js/dist/tippy.css";
import "../assets/app.css";
import { clickSound } from "../utils/clickSound";

export default function PythonRunner() {
  const {
    code,
    filename,
    fileList,
    output,
    rotation,
    loading,
    pyodide,
    setCode,
    setFilename,
    setFileList,
    setOutput,
    setRotation,
    setLoading,
    setPyodide,
  } = usePythonStore();

  const runnerRef = useRef(null);
  const loaderRef = useRef(null);
  const editorRef = useRef(null);
  const outputRef = useRef(null);
  const containerRef = useRef(null);
  const tippyRef = useRef(null);

  // Load Pyodide
  useEffect(() => {
    const load = async () => {
      const pkg = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/",
      });
      setPyodide(pkg);
      setLoading(false);
    };

    if (!window.loadPyodide) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.js";
      script.onload = load;
      document.body.appendChild(script);
    } else {
      load();
    }
  }, []);

  // Animations
  useEffect(() => {
    if (tippyRef.current) {
      tippy(tippyRef.current, {
        content: "💡 Ctrl + Shift: Rotate editor!",
        placement: "left",
        animation: "shift-away",
        theme: "light-border",
      });
    }
    if (runnerRef.current) {
      gsap.fromTo(
        runnerRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 0.2,
        }
      );
    }
    gsap.from(editorRef.current, {
      x: -50,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.6,
    });
    gsap.from(outputRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: "sine.out",
      delay: 1,
    });
  }, [loading]);

  useEffect(() => {
    if (loaderRef.current) {
      gsap.to(loaderRef.current, {
        opacity: 1,
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, []);

  useEffect(() => {
    const handleRotate = (e) => {
      clickSound("Retro3");
      if (e.ctrlKey && e.shiftKey) {
        const chance = Math.floor(Math.random() * 10);
        if (chance === 0) {
          setRotation(0);
        } else {
          clickSound("Spin", 0.4);
          const randomAngle = [90, 180, 270][Math.floor(Math.random() * 3)];
          setRotation((r) => (r + randomAngle) % 360);
        }
      }
    };
    window.addEventListener("keydown", handleRotate);
    return () => window.removeEventListener("keydown", handleRotate);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        rotate: rotation,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  }, [rotation]);

  // Load file list on mount
  useEffect(() => {
    getFileList().then(setFileList);
  }, []);

  // Save code
  useEffect(() => {
    const timeout = setTimeout(async () => {
      const updatedList = await saveFile(filename, code);
      setFileList(updatedList);
    }, 500);
    return () => clearTimeout(timeout);
  }, [code, filename]);

  const runCode = async () => {
    clickSound("Beep", 0.5);
    if (!pyodide) return;
    try {
      await pyodide.loadPackagesFromImports(code);
      pyodide.runPython(`
        import sys
        from io import StringIO
        sys.stdout = sys.__stdout__ = StringIO()
        sys.stderr = sys.__stderr__ = StringIO()
      `);
      pyodide.runPython(code);
      const captured = pyodide.runPython("sys.stdout.getvalue()");
      setOutput(captured || "[No output]");
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
  };

  const openFile = async (name) => {
    const content = await loadFile(name);
    setFilename(name);
    setCode(content || "");
  };

  if (loading) {
    return (
      <div className="w-[800px] h-[800px] flex items-center justify-center mx-auto mt-6 bg-base-100 rounded-xl shadow-xl border border-base-content/10 scale-x-[-1]">
        <div
          ref={loaderRef}
          className="flex flex-col items-center gap-4 opacity-70 text-accent"
        >
          <Icon icon="eos-icons:three-dots-loading" width="48" height="48" />
          <span className="font-mono text-sm text-base-content/60">
            Loading Pyodide v0.28.0...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={tippyRef}
        className="absolute top-2 right-3 z-50 cursor-help text-sm opacity-70"
      >
        <Icon icon="mdi:rotate-3d" width="20" />
      </div>

      <div ref={containerRef}>
        <div
          ref={runnerRef}
          className="w-[800px] h-[800px] bg-base-100 scale-x-[-1] shadow-xl border border-base-content/20 rounded-xl p-4 mx-auto mt-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-error w-3 h-3 rounded-full"></div>
              <div className="bg-warning w-3 h-3 rounded-full"></div>
              <div className="bg-success w-3 h-3 rounded-full"></div>
              <span className="ml-3 font-mono text-sm opacity-80 text-base-content">
                {filename}
              </span>
            </div>
            <span className="text-xs text-base-content/50 font-mono">
              HeadacheOS Shell
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {fileList.map((file) => (
              <button
                key={file}
                onClick={() => openFile(file)}
                className={`btn btn-sm btn-outline text-xs font-mono ${
                  file === filename ? "btn-active" : ""
                }`}
              >
                <Icon icon="mdi:file-code-outline" className="mr-1" />
                {file}
              </button>
            ))}
          </div>

          <div
            ref={editorRef}
            className="flex-1 border border-base-content/20 rounded-lg overflow-hidden bg-base-200 scale-x-[1]"
          >
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              theme="vs-dark"
              onChange={(val) => setCode(val || "")}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                lineNumbers: "on",
                fontFamily: "monospace",
                padding: { top: 10 },
              }}
            />
          </div>

          <div className="mt-4 flex justify-between items-center">
            <input
              type="text"
              className="input input-bordered input-sm w-1/2 font-mono"
              value={filename}
              onChange={(e) => {
                clickSound("Retro3");
                setFilename(e.target.value);
              }}
            />
            <button
              onClick={runCode}
              className="btn btn-info btn-sm rounded-md gap-2 hover:scale-105 transition-all duration-200"
            >
              <Icon icon="mdi:play" width="18" />
              Run
            </button>
          </div>

          <div
            ref={outputRef}
            className="mt-4 bg-base-200 p-3 rounded-lg font-mono text-sm whitespace-pre-wrap text-base-content overflow-auto h-40 border border-base-content/10"
          >
            <strong className="block mb-1 text-base-content/70">Output:</strong>
            <pre className="break-words">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
