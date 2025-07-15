import React, { useEffect, useRef, useState } from 'react';
import interact from 'interactjs';
import { Icon } from '@iconify/react';
import Window from './Window.jsx'; // Adjust the path as needed

const GRID_SIZE = 100;
const NUM_COLS = 8;

const initialApps = [
  { id: 1, name: 'Calculator', icon: 'mdi:calculator', x: 0, y: 0, route: 'calculator', width:400, height:600 },
  { id: 2, name: 'Notes', icon: 'mdi:notebook-outline', x: 2, y: 0, route: 'notes', width:400, height:300 },
  { id: 3, name: 'Wallpaper Manager', icon: 'mingcute:greatwall-fill', x: 2, y: 2, route: 'wallpaper', width:400, height:400 },
  { id: 4, name: 'Clock?', icon: 'tabler:clock-filled', x: 4, y: 2, route: 'clock', width:600, height:400 },
  { id: 5, name: 'Browser', icon: 'ic:twotone-settings-applications', x: 6, y: 2, route: 'browser', width:600, height:600 },

];

export default function DraggableGrid() {
  const [apps, setApps] = useState(initialApps);
  const [openWindows, setOpenWindows] = useState([]);
  const containerRef = useRef(null);

  // Initialize interactjs for draggable icons
  useEffect(() => {
    interact('.draggable').draggable({
      modifiers: [
        interact.modifiers.snap({
          targets: [interact.snappers.grid({ x: GRID_SIZE, y: GRID_SIZE })],
          range: Infinity,
          relativePoints: [{ x: 0, y: 0 }],
        }),
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true,
        }),
      ],
      listeners: {
        move(event) {
          const target = event.target;
          const id = Number(target.dataset.id);
          const deltaX = event.dx;
          const deltaY = event.dy;

          const app = apps.find(a => a.id === id);
          if (!app) return;

          const newX = app.x * GRID_SIZE + deltaX;
          const newY = app.y * GRID_SIZE + deltaY;

          const snappedX = Math.round(newX / GRID_SIZE);
          const snappedY = Math.round(newY / GRID_SIZE);

          const isOccupied = apps.some(
            a => a.id !== id && a.x === snappedX && a.y === snappedY
          );
          if (isOccupied) return;

          setApps(prev =>
            prev.map(a =>
              a.id === id ? { ...a, x: snappedX, y: snappedY } : a
            )
          );
        },
      },
    });
  }, [apps]);

  // Handle icon click to open window
  const handleIconClick = (app) => {
    if (openWindows.some(w => w.id === app.id)) return;
    setOpenWindows(prev => [...prev, { ...app }]);
  };

  const closeWindow = (id) => {
    setOpenWindows(prev => prev.filter(w => w.id !== id));
  };

  const minimizeWindow = (id) => {
    // Currently just closes, you can change to a "minimized" state
    closeWindow(id);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen p-6 md:p-12 overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${NUM_COLS}, ${GRID_SIZE}px)`,
        gridAutoRows: `${GRID_SIZE}px`,
        gap: '2px',
        position: 'relative',
      }}
    >
      {/* Draggable App Icons */}
      {apps.map(app => (
        <div
          key={app.id}
          onClick={() => handleIconClick(app)}
          className="select-none draggable flex flex-col items-center justify-center bg-base-100 rounded-2xl shadow-md hover:bg-base-300 cursor-pointer transition duration-300 hover:scale-[1.05] active:scale-100"
          data-id={app.id}
          style={{
            width: `${GRID_SIZE}px`,
            height: `${GRID_SIZE}px`,
            position: 'absolute',
            transform: `translate(${app.x * GRID_SIZE}px, ${app.y * GRID_SIZE}px)`,
          }}
        >
          <Icon icon={app.icon} width={32} height={32} />
          <span className="text-xs mt-1 text-center text-semibold">{app.name}</span>
        </div>
      ))}

      {/* Windows Layered Over */}
      {openWindows.map(win => (
        <Window
          key={win.id}
          id={win.id}
          title={win.name}
          route={win.route}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          width={win.width}
          height={win.height}
        />
      ))}
    </div>
  );
}
