"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* Entry positions: corners + sides */
const entries = [
  "from-top-left",
  "from-top-right",
  "from-bottom-left",
  "from-bottom-right",
  "from-left",
  "from-right",
  "from-top",
  "from-bottom",
] as const;

/* SVG bug shapes (simple silhouettes) */
const bugSvgs = [
  // Ant
  `<path d="M12 2C11 2 10 3 10 4L8 6L6 5L5 6L7 8L6 10C5 10 4 11 4 12C4 13 5 14 6 14L7 16L5 18L6 19L8 17L10 18C10 19 11 20 12 20C13 20 14 19 14 18L16 17L18 19L19 18L17 16L18 14C19 14 20 13 20 12C20 11 19 10 18 10L17 8L19 6L18 5L16 6L14 4C14 3 13 2 12 2Z"/>`,
  // Spider
  `<path d="M12 8C10.3 8 9 9.3 9 11C9 12.7 10.3 14 12 14C13.7 14 15 12.7 15 11C15 9.3 13.7 8 12 8ZM12 15C10.9 15 10 15.9 10 17C10 18.1 10.9 19 12 19C13.1 19 14 18.1 14 17C14 15.9 13.1 15 12 15ZM6 6L3 3M18 6L21 3M6 13L2 14M18 13L22 14M7 17L4 21M17 17L20 21M9 9L5 8M15 9L19 8" stroke="currentColor" stroke-width="1.5" fill="currentColor"/>`,
  // Beetle
  `<path d="M12 3C10.5 3 9 4 9 5.5L9 7C7.5 8 7 9.5 7 11L7 15C7 17.8 9.2 20 12 20C14.8 20 17 17.8 17 15L17 11C17 9.5 16.5 8 15 7L15 5.5C15 4 13.5 3 12 3ZM12 7L12 19M9 11L15 11M9 14L15 14" stroke="currentColor" stroke-width="0.5" fill="currentColor"/>`,
  // Cockroach
  `<path d="M12 2L10 4L8 3L7 4L9 6L8 8C7 8.5 6 10 6 12L6 16C6 18.5 8.5 21 12 21C15.5 21 18 18.5 18 16L18 12C18 10 17 8.5 16 8L15 6L17 4L16 3L14 4L12 2ZM10 10L14 10M10 13L14 13M10 16L14 16" stroke="currentColor" stroke-width="0.5" fill="currentColor"/>`,
  // Mosquito
  `<path d="M12 6C11 6 10 7 10 8L10 12C10 13 10.5 14 11 14.5L11 18L10 21L12 20L14 21L13 18L13 14.5C13.5 14 14 13 14 12L14 8C14 7 13 6 12 6ZM8 8L5 5M16 8L19 5M8 11L4 12M16 11L20 12M12 3L12 6" stroke="currentColor" stroke-width="1" fill="currentColor"/>`,
];

interface BlastEvent {
  id: number;
  entry: string;
  bugIndex: number;
  duration: number;
  yOffset: number; // random vertical offset for side entries
}

export function BugBlastEffect() {
  const [blasts, setBlasts] = useState<BlastEvent[]>([]);
  const nextId = useRef(0);

  const spawnBlast = useCallback(() => {
    const id = nextId.current++;
    const entry = entries[Math.floor(Math.random() * entries.length)];
    const bugIndex = Math.floor(Math.random() * bugSvgs.length);
    const duration = 5 + Math.random() * 1.5; // 5-6.5s total
    const yOffset = 20 + Math.random() * 60; // random % for side entries

    setBlasts((prev) => [...prev, { id, entry, bugIndex, duration, yOffset }]);

    setTimeout(() => {
      setBlasts((prev) => prev.filter((b) => b.id !== id));
    }, duration * 1000 + 300);
  }, []);

  useEffect(() => {
    const firstTimer = setTimeout(spawnBlast, 3000);
    const interval = setInterval(spawnBlast, 4000 + Math.random() * 2000);
    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [spawnBlast]);

  return (
    <div className="bug-blast-container">
      {blasts.map((blast) => {
        const style = {
          "--blast-duration": `${blast.duration}s`,
        } as React.CSSProperties;

        // For side/top/bottom entries, set random position along the edge
        const posStyle: React.CSSProperties = {};
        if (blast.entry === "from-left" || blast.entry === "from-right") {
          posStyle.top = `${blast.yOffset}%`;
        }
        if (blast.entry === "from-top" || blast.entry === "from-bottom") {
          posStyle.left = `${blast.yOffset}%`;
        }

        const particles = Array.from({ length: 8 }).map((_, i) => {
          const angle = i * 45 + Math.random() * 20;
          const dist = 30 + Math.random() * 50;
          const px = Math.cos((angle * Math.PI) / 180) * dist;
          const py = Math.sin((angle * Math.PI) / 180) * dist;
          return { key: i, px, py };
        });

        return (
          <div key={blast.id}>
            {/* The bug - uses currentColor so CSS can control light/dark */}
            <div
              className={`bug-blast-bug ${blast.entry}`}
              style={{ ...style, ...posStyle }}
            >
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                className="bug-blast-svg"
                dangerouslySetInnerHTML={{ __html: bugSvgs[blast.bugIndex] }}
              />
            </div>
            {/* Blast ring */}
            <div
              className={`bug-blast-ring ${blast.entry}`}
              style={{ ...style, ...posStyle }}
            />
            {/* Debris particles */}
            {particles.map((p) => (
              <div
                key={p.key}
                className={`bug-blast-particle ${blast.entry}`}
                style={{
                  ...style,
                  ...posStyle,
                  "--px": `${p.px}px`,
                  "--py": `${p.py}px`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
