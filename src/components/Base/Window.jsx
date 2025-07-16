import React, { useEffect, useRef, useState } from 'react';

export default function Window({
  id,
  route,
  title = 'Untitled App',
  width = 400,
  height = 300,
  onClose,
  onMinimize,
}) {
  const windowRef = useRef(null);
  const dragFrameRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const target = windowRef.current;
    const dragFrame = dragFrameRef.current;
    const boundary = document.querySelector('.window-boundary');

    if (!target || !dragFrame || !boundary) return;

    const onMouseDown = (e) => {
      if (!dragFrame.contains(e.target)) return;
      setIsDragging(true);
      offsetRef.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      };
      e.preventDefault(); // Prevent iframe focus steal
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const newX = Math.max(
        0,
        Math.min(e.clientX - offsetRef.current.x, boundary.offsetWidth - width)
      );
      const newY = Math.max(
        0,
        Math.min(e.clientY - offsetRef.current.y, boundary.offsetHeight - height)
      );
      setPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    dragFrame.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      dragFrame.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, pos.x, pos.y, width, height]);

  return (
    <div
      ref={windowRef}
      className="absolute bg-base-100 rounded-md shadow-xl overflow-hidden select-none"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        zIndex: 1000,
      }}
    >
      <div
        ref={dragFrameRef}
        className="absolute inset-0 border-2 border-transparent hover:border-primary z-20"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="absolute top-0 left-0 w-full h-4 cursor-move"
          style={{ pointerEvents: 'auto' }}
        ></div>
      </div>

      <div className="title-bar bg-base-300 text-sm font-semibold text-primary px-3 py-2 flex justify-between items-center z-10 relative">
        <span className="truncate w-full">{title}</span>
        <div className="flex gap-2 ml-2 shrink-0">
          <button
            onClick={onMinimize}
            className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500"
          />
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"
          />
        </div>
      </div>

      <iframe
        src={`/window/${route}`}
        className="w-full h-full z-0 relative"
        frameBorder="0"
        title={title}
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
}