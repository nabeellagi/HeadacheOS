import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Icon } from "@iconify/react";
import "../assets/app.css";
import { clickSound } from "../utils/clickSound";

const CAT_API = "https://api.thecatapi.com/v1/images/search?limit=15";

export default function CatExplorer() {
  const [fileList, setFileList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const viewerRef = useRef(null);

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

  const fetchCatFiles = async () => {
    try {
      const response = await fetch(CAT_API);
      const data = await response.json();
      const newFiles = data.map((cat) => {
        const ext = cat.url.split(".").pop().split("?")[0];
        return { name: `${cat.id}.${ext}`, url: cat.url };
      });

      // Deduplicate on the fly
      const seen = new Set(fileList.map((file) => file.name));
      const filteredFiles = newFiles.filter((file) => !seen.has(file.name));

      setFileList((prev) => [...prev, ...filteredFiles]);
    } catch (err) {
      console.error("Failed to fetch cat files:", err);
    }
  };

  const openViewer = (file) => {
    setSelectedImage(file);
    setIsViewerOpen(true);
  };

  const filteredList = fileList.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 w-full h-full flex flex-col gap-4 items-center justify-start font-sans">
      <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-base-content">
          📁 Image Viewer
        </h1>
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
              onClick={() => {
                openViewer(file);
                clickSound('Retro3');
            }}
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
              <span className="text-sm font-semibold truncate">
                {selectedImage.name}
              </span>
              <button
                className="btn btn-xs btn-error gap-1"
                onClick={() => {
                    setIsViewerOpen(false);
                    clickSound('Retro4')
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
