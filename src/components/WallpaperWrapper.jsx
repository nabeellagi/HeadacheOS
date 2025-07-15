import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import interact from 'interactjs';

const Window = forwardRef(function Window({
  id,
  route = 'test',
  title = 'Untitled App',
  width = 400,
  height = 300,
  onClose,
  onMinimize,
}, ref) {
  const windowRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setPosition: (x, y) => {
      if (windowRef.current) {
        const boundedX = Math.max(0, x);
        const boundedY = Math.max(0, y);
        windowRef.current.style.transform = `translate(${boundedX}px, ${boundedY}px)`;
        windowRef.current.setAttribute('data-x', boundedX);
        windowRef.current.setAttribute('data-y', boundedY);
      }
    },
  }));

  useEffect(() => {
    const target = windowRef.current;
    const boundary = document.querySelector('.window-boundary');

    if (!target || !boundary) return;

    const draggable = interact(target).draggable({
      allowFrom: '.title-bar',
      listeners: {
        move(event) {
          const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

          const parentRect = boundary.getBoundingClientRect();
          const elRect = target.getBoundingClientRect();

          const maxX = parentRect.width - elRect.width;
          const maxY = parentRect.height - elRect.height;

          const boundedX = Math.max(0, Math.min(x, maxX));
          const boundedY = Math.max(0, Math.min(y, maxY));

          target.style.transform = `translate(${boundedX}px, ${boundedY}px)`;
          target.setAttribute('data-x', boundedX);
          target.setAttribute('data-y', boundedY);
        },
      },
    });

    return () => {
      draggable.unset();
    };
  }, []);

  return (
    <div
      ref={windowRef}
      className="absolute bg-base-100 rounded-md shadow-xl overflow-hidden select-none"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        top: '-20px',
        left: '0px',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      <div className="title-bar bg-base-300 text-sm font-semibold text-primary px-3 py-2 cursor-move flex justify-between items-center">
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
        className="w-full h-full"
        frameBorder="0"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
});

export default Window;