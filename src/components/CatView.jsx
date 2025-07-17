import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Icon } from "@iconify/react";
import "../assets/app.css";
import { clickSound } from "../utils/clickSound";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

const CAT_API = "https://api.thecatapi.com/v1/images/search?limit=15";

export default function CatExplorer() {
  const [fileList, setFileList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const viewerRef = useRef(null);
  const [qteStage, setQteStage] = useState(null);
  const holdTimer = useRef(null);
  const spaceCount = useRef(0);
  const tippyInstance = useRef(null);
  const hoverTip = useRef(null);

  useEffect(() => {
    fetchCatFiles();
  }, []);

  useEffect(() => {
    if (isViewerOpen) {
      gsap.fromTo(
        viewerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [isViewerOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
      }

      if (qteStage === "space" && e.code === "Space") {
        spaceCount.current += 1;
        const remaining = 3 - spaceCount.current;

        if (remaining < 0) {
          setQteStage("done");
          return;
        }

        if (tippyInstance.current) {
          tippyInstance.current.setContent(`${remaining} more left!`);
        }

        clickSound("Beep");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [qteStage]);

  useEffect(() => {
    if (qteStage === "space") {
      let timer = setTimeout(() => {
        if (spaceCount.current >= 3) {
          setQteStage("done");
        } else {
          failQTE();
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [qteStage]);

  useEffect(() => {
    if (qteStage === "done") {
      setIsViewerOpen(true);
      setQteStage(null);
    }
  }, [qteStage]);

  const fetchCatFiles = async () => {
    try {
      const response = await fetch(CAT_API);
      const data = await response.json();
      const newFiles = data.map((cat) => {
        const ext = cat.url.split(".").pop().split("?")[0];
        return { name: `${cat.id}.${ext}`, url: cat.url };
      });

      const seen = new Set(fileList.map((file) => file.name));
      const filteredFiles = newFiles.filter((file) => !seen.has(file.name));

      setFileList((prev) => [...prev, ...filteredFiles]);
    } catch (err) {
      console.error("Failed to fetch cat files:", err);
    }
  };

  const failQTE = () => {
    if (selectedImage) {
      setFileList((prev) => prev.filter((file) => file.name !== selectedImage.name));
    }
    setQteStage(null);
    setSelectedImage(null);
    if (tippyInstance.current) {
      tippyInstance.current.setContent("You failed! Image deleted!");
      tippyInstance.current.show();
    }
    clickSound("Beep");
  };

  const beginQTE = (file, iconEl) => {
    setSelectedImage(file);
    setQteStage("hold");

    if (tippyInstance.current) tippyInstance.current.destroy();
    tippyInstance.current = tippy(iconEl, {
      content: "Hold for 5 seconds...",
      showOnCreate: true,
      trigger: "manual",
    });

    let holdStart = Date.now();

    const checkHold = () => {
      if (Date.now() - holdStart >= 5000) {
        setQteStage("space");
        spaceCount.current = 0;
        if (tippyInstance.current) tippyInstance.current.destroy();
        tippyInstance.current = tippy(iconEl, {
          content: "Now press SPACE 3x within 5s!",
          showOnCreate: true,
          trigger: "manual",
        });
      } else {
        failQTE();
      }
    };

    holdTimer.current = setTimeout(checkHold, 5000);
  };

  const handleIconMouseDown = (file, e) => {
    const iconEl = e.currentTarget;
    beginQTE(file, iconEl);
  };

  const handleIconMouseUp = () => {
    clearTimeout(holdTimer.current);
    if (qteStage === "hold") {
      failQTE();
    }
  };

  const handleMouseEnter = (e) => {
    const iconEl = e.currentTarget;
    if (hoverTip.current) hoverTip.current.destroy();
    hoverTip.current = tippy(iconEl, {
      content: "Hold for 5 seconds, if not — file deleted!",
      showOnCreate: true,
      trigger: "manual",
      duration: 1500,
    });
  };

  const handleMouseLeave = () => {
    if (hoverTip.current) {
      hoverTip.current.destroy();
      hoverTip.current = null;
    }
  };

  const filteredList = fileList.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 w-full h-full flex flex-col gap-4 items-center justify-start font-sans">
      <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-base-content">Image Viewer</h1>
        <input
          type="text"
          className="input input-bordered input-sm w-full sm:w-64"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="w-full max-w-5xl mt-2 overflow-auto rounded-lg shadow-inner">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 p-2 overflow-y-auto">
          {filteredList.map((file) => (
            <div
              key={file.name}
              className="flex flex-col items-center text-center p-3 rounded-lg transition hover:bg-base-200 cursor-pointer"
              onMouseDown={(e) => handleIconMouseDown(file, e)}
              onMouseUp={handleIconMouseUp}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Icon icon="mdi:file-image" className="text-4xl text-secondary" />
              <span className="text-xs mt-1 w-full truncate">{file.name}</span>
            </div>
          ))}
        </div>
      </div>

      {isViewerOpen && selectedImage && (
        <div
          ref={viewerRef}
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-base-100 w-full max-w-3xl rounded-xl shadow-2xl relative">
            <div className="flex justify-between items-center px-4 py-3 border-b border-base-300">
              <span className="text-sm font-semibold truncate">{selectedImage.name}</span>
              <button
                className="btn btn-xs btn-error gap-1"
                onClick={() => {
                  setIsViewerOpen(false);
                  clickSound("Retro4");
                }}
              >
                <Icon icon="mdi:close" />
                Close
              </button>
            </div>

            <div className="flex items-center justify-center bg-base-200 w-full max-h-[75vh]">
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="object-contain w-full max-h-[75vh] transition-all duration-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}