"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

const entries = [
  "from-top-left", "from-top-right", "from-bottom-left", "from-bottom-right",
  "from-left", "from-right", "from-top", "from-bottom",
] as const;

/* CSS-only bug silhouettes using box-shadow art */
const bugTypes = ["bb-ant", "bb-spider", "bb-beetle", "bb-roach", "bb-mosquito", "bb-snake"]; /* bb-spider = bee */

interface Blast {
  id: number;
  entry: string;
  bugType: string;
  dur: number;
  pos: number;
}

function BugBlastInner() {
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const nextId = useRef(0);

  const spawn = useCallback(() => {
    const id = nextId.current++;
    const entry = entries[Math.floor(Math.random() * entries.length)];
    const bugType = bugTypes[Math.floor(Math.random() * bugTypes.length)];
    const dur = 5 + Math.random() * 1.5;
    const pos = 15 + Math.random() * 70;

    setBlasts((prev) => [...prev, { id, entry, bugType, dur, pos }]);
    setTimeout(() => {
      setBlasts((prev) => prev.filter((b) => b.id !== id));
    }, dur * 1000 + 500);
  }, []);

  useEffect(() => {
    const t = setTimeout(spawn, 3000);
    const i = setInterval(spawn, 7000);
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
            <span className={`bb-shape ${b.bugType}`} />
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

export function BugBlastEffect() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(<BugBlastInner />, document.body);
}
