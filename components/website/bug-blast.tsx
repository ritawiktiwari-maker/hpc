"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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

const bugs = ["🪲", "🐜", "🦟", "🪳", "🐛", "🦗", "🕷️", "🐞"];

interface Blast {
  id: number;
  entry: string;
  bug: string;
  dur: number;
  pos: number;
}

export function BugBlastEffect() {
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const nextId = useRef(0);

  const spawn = useCallback(() => {
    const id = nextId.current++;
    const entry = entries[Math.floor(Math.random() * entries.length)];
    const bug = bugs[Math.floor(Math.random() * bugs.length)];
    const dur = 5 + Math.random() * 1.5;
    const pos = 15 + Math.random() * 70;

    setBlasts((prev) => [...prev, { id, entry, bug, dur, pos }]);
    setTimeout(() => {
      setBlasts((prev) => prev.filter((b) => b.id !== id));
    }, dur * 1000 + 500);
  }, []);

  useEffect(() => {
    const t = setTimeout(spawn, 2000);
    const i = setInterval(spawn, 2000);
    return () => { clearTimeout(t); clearInterval(i); };
  }, [spawn]);

  return (
    <div className="bug-blast-wrap">
      {blasts.map((b) => {
        const css = { "--bd": `${b.dur}s` } as React.CSSProperties;
        const p: React.CSSProperties = {};
        if (b.entry === "from-left" || b.entry === "from-right") p.top = `${b.pos}%`;
        if (b.entry === "from-top" || b.entry === "from-bottom") p.left = `${b.pos}%`;

        return (
          <div key={b.id} className={`bb-bug ${b.entry}`} style={{ ...css, ...p }}>
            <span className="bb-emoji">{b.bug}</span>
            <span className="bb-ring" />
            <span className="bb-pop bb-pop-1" />
            <span className="bb-pop bb-pop-2" />
            <span className="bb-pop bb-pop-3" />
            <span className="bb-pop bb-pop-4" />
            <span className="bb-pop bb-pop-5" />
            <span className="bb-pop bb-pop-6" />
          </div>
        );
      })}
    </div>
  );
}
