"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const corners = [
  "from-top-left",
  "from-top-right",
  "from-bottom-left",
  "from-bottom-right",
] as const;

const bugEmojis = ["🪲", "🐜", "🦟", "🪳", "🐛", "🦗"];
const particleColors = ["#7CB342", "#42A5F5", "#FF9800", "#8BC34A", "#4FC3F7"];

interface BlastEvent {
  id: number;
  corner: string;
  bug: string;
  duration: number;
}

export function BugBlastEffect() {
  const [blasts, setBlasts] = useState<BlastEvent[]>([]);
  const nextId = useRef(0);

  const spawnBlast = useCallback(() => {
    const id = nextId.current++;
    const corner = corners[Math.floor(Math.random() * corners.length)];
    const bug = bugEmojis[Math.floor(Math.random() * bugEmojis.length)];
    const duration = 3 + Math.random() * 1.5;

    setBlasts((prev) => [...prev, { id, corner, bug, duration }]);

    setTimeout(() => {
      setBlasts((prev) => prev.filter((b) => b.id !== id));
    }, duration * 1000 + 200);
  }, []);

  useEffect(() => {
    // First blast after 3s
    const firstTimer = setTimeout(spawnBlast, 3000);
    // Then one bug every 3-4 seconds
    const interval = setInterval(() => {
      spawnBlast();
    }, 3000 + Math.random() * 1000);

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
          "--blast-delay": "0s",
        } as React.CSSProperties;

        const particles = Array.from({ length: 6 }).map((_, i) => {
          const angle = i * 60 + Math.random() * 30;
          const dist = 25 + Math.random() * 35;
          const px = Math.cos((angle * Math.PI) / 180) * dist;
          const py = Math.sin((angle * Math.PI) / 180) * dist;
          return {
            key: i,
            style: {
              "--blast-duration": `${blast.duration}s`,
              "--px": `${px}px`,
              "--py": `${py}px`,
              background:
                particleColors[
                  Math.floor(Math.random() * particleColors.length)
                ],
            } as React.CSSProperties,
          };
        });

        return (
          <div key={blast.id}>
            <div className={`bug-blast-bug ${blast.corner}`} style={style}>
              {blast.bug}
            </div>
            <div className={`bug-blast-ring ${blast.corner}`} style={style} />
            {particles.map((p) => (
              <div
                key={p.key}
                className={`bug-blast-particle ${blast.corner}`}
                style={p.style}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
