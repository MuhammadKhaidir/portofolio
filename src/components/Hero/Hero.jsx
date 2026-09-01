import { useState, useEffect, useRef } from "react";
import './Hero.css'

/**
 * CorridorWalk
 * ------------
 * Top-down pixel-art "walk straight down a corridor, door opens, enter a new
 * scene" mechanic. Dependency-free (no libs) so it's easy to drop into an
 * existing project.
 *
 * Movement model: the corridor itself is a fixed frame (no scrolling world,
 * so there's no viewport-size math to get wrong). The character slides from
 * near the bottom of the frame up to just under the door as `progress` goes
 * 0 -> 100. The floor/wall patterns animate their background-position to
 * sell the sense of forward motion.
 *
 * WHERE TO PLUG IN YOUR OWN STUFF LATER:
 * - Swap FRAME_A / FRAME_B with your real sprite sheet (see PixelSprite).
 * - Swap the .wall/.floor background patterns for real tile art.
 * - Replace the <RoomTwo /> placeholder with your actual next scene.
 */

const WALK_SPEED = 0.55; // % progress per animation tick while holding "walk"
const DOOR_ZONE = 22; // door starts opening this many % before the end
const CHAR_START_PCT = 9; // character's `bottom` at progress 0
const CHAR_END_PCT = 75; // character's `bottom` at progress 100 (just under the door)

const COLORS = {
  H: "#2a1e14", // hair
  S: "#e8b98c", // skin
  C: "#4a6fa5", // cloak
  c: "#375080", // cloak shade
  B: "#241c1c", // boots
};

// 8 wide x 11 tall pixel grid. '.' = empty cell.
const FRAME_A = [
  "..HHHH..",
  ".HHHHHH.",
  ".HSSSSH.",
  ".HSSSSH.",
  "..CCCC..",
  ".CCcCCC.",
  ".CCcCCC.",
  ".C.cc.C.",
  ".C.cc.C.",
  "B..cc..B",
  "BB.cc.BB",
];
const FRAME_B = [...FRAME_A.slice(0, 9), ".B.cc.B.", "..BccB.."];

function PixelSprite({ frame, className, style }) {
  return (
    <div className={`pixel-sprite ${className || ""}`} style={style}>
      {frame.map((row, r) =>
        [...row].map((ch, c) =>
          ch === "." ? null : (
            <span
              key={`${r}-${c}`}
              className="pixel"
              style={{ gridRow: r + 1, gridColumn: c + 1, background: COLORS[ch] }}
            />
          )
        )
      )}
    </div>
  );
}

function RoomTwo({ onRestart }) {
  return (
    <div className="room-two">
      <div className="room-two-floor" />
      <PixelSprite frame={FRAME_A} className="character character--room" />
      <button className="restart-btn" onClick={onRestart} aria-label="Ulangi">
        ↺
      </button>
    </div>
  );
}

export default function CorridorWalk() {
  const [progress, setProgress] = useState(0); // 0 - 100
  const [isWalking, setIsWalking] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [doorOpen, setDoorOpen] = useState(false);
  const [scene, setScene] = useState("corridor"); // 'corridor' | 'room'
  const [fading, setFading] = useState(false);
  const [everWalked, setEverWalked] = useState(false);

  const isWalkingRef = useRef(false);
  const sceneRef = useRef("corridor");
  useEffect(() => {
    isWalkingRef.current = isWalking;
  }, [isWalking]);
  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  // Main animation loop: advances progress while the player holds "walk".
  useEffect(() => {
    let raf;
    const tick = () => {
      if (isWalkingRef.current && sceneRef.current === "corridor") {
        setProgress((p) => Math.min(p + WALK_SPEED, 100));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Footstep frame toggle while walking.
  useEffect(() => {
    if (!isWalking) {
      setWalkFrame(0);
      return;
    }
    const id = setInterval(() => setWalkFrame((f) => (f === 0 ? 1 : 0)), 150);
    return () => clearInterval(id);
  }, [isWalking]);

  // Door opens as the player gets close; reaching the end starts the transition.
  useEffect(() => {
    if (progress >= 100 - DOOR_ZONE) setDoorOpen(true);
    if (progress >= 100 && scene === "corridor") {
      setIsWalking(false);
      setFading(true);
      setTimeout(() => {
        setScene("room");
        setProgress(0);
        setDoorOpen(false);
      }, 550);
      setTimeout(() => setFading(false), 700);
    }
  }, [progress, scene]);

  // Keyboard controls (desktop): hold ArrowUp / W to walk.
  useEffect(() => {
    const isWalkKey = (e) => e.key === "ArrowUp" || e.key === "w" || e.key === "W";
    const down = (e) => {
      if (isWalkKey(e)) {
        e.preventDefault();
        setIsWalking(true);
        setEverWalked(true);
      }
    };
    const up = (e) => {
      if (isWalkKey(e)) setIsWalking(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Pointer controls (mouse + touch, unified): hold anywhere on the scene to walk.
  const startWalk = (e) => {
    e.preventDefault();
    setIsWalking(true);
    setEverWalked(true);
  };
  const stopWalk = () => setIsWalking(false);

  const restart = () => {
    setScene("corridor");
    setProgress(0);
    setDoorOpen(false);
    setFading(false);
  };

  const charBottom = CHAR_START_PCT + (progress / 100) * (CHAR_END_PCT - CHAR_START_PCT);
  const scrollPx = progress * 6;
  const doorScale = 1 + progress / 260;

  return (
    <div className="corridor-app">
      <style>{`
        .corridor-app {
          --u: 4px;
          --void: #0d0b12;
          --floor-a: #3a3448;
          --floor-b: #443c58;
          --wall-stone: #2a2636;
          --wall-mortar: #1c1926;
          --door-wood: #6b4226;
          --door-wood-dark: #4a2c18;
          --door-metal: #b8b0a0;
          --torch: rgba(242, 166, 90, 0.35);
          --ui-text: #f4ede0;
          display: flex;
          justify-content: center;
          padding: 16px;
          background: #050409;
          font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
        }
        @media (min-width: 640px) {
          .corridor-app { --u: 5px; }
        }
        .game-frame {
          position: relative;
          width: min(94vw, 380px);
          aspect-ratio: 3 / 4;
          border-radius: 4px;
          box-shadow:
            0 0 0 4px #14111c,
            0 0 0 8px #060509,
            inset 0 0 0 2px rgba(255,255,255,0.04),
            0 20px 40px rgba(0,0,0,0.5);
          overflow: hidden;
          background: var(--void);
          touch-action: none;
          -webkit-user-select: none;
          user-select: none;
          cursor: pointer;
        }
        .scene { position: absolute; inset: 0; overflow: hidden; }
        .wall {
          position: absolute;
          top: 0; bottom: 0;
          width: 22%;
          background-image:
            repeating-linear-gradient(var(--torch) 0 6px, transparent 6px 160px),
            repeating-linear-gradient(0deg, var(--wall-mortar) 0 3px, transparent 3px 34px),
            repeating-linear-gradient(90deg, var(--wall-mortar) 0 3px, transparent 3px 44px),
            linear-gradient(var(--wall-stone), var(--wall-stone));
          background-position-y: var(--scroll, 0px);
        }
        .wall--left { left: 0; }
        .wall--right { right: 0; }
        .floor {
          position: absolute;
          top: 0; bottom: 0;
          left: 22%; right: 22%;
          background-image:
            repeating-linear-gradient(0deg, var(--floor-a) 0 40px, var(--floor-b) 40px 80px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0 2px, transparent 2px 40px);
          background-position-y: var(--scroll, 0px);
        }
        .door {
          position: absolute;
          top: 0;
          left: 22%; right: 22%;
          height: 17%;
          display: flex;
          overflow: hidden;
          transform-origin: 50% 0%;
        }
        .door-panel {
          width: 50%;
          height: 100%;
          background:
            repeating-linear-gradient(90deg, transparent 0 18px, rgba(0,0,0,0.18) 18px 20px),
            linear-gradient(var(--door-wood), var(--door-wood-dark));
          transition: transform 0.75s cubic-bezier(.65,0,.35,1);
          position: relative;
        }
        .door-panel::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 8px; height: 8px;
          background: var(--door-metal);
          border-radius: 1px;
        }
        .door-panel--left::after { right: 10px; }
        .door-panel--right::after { left: 10px; }
        .door.open .door-panel--left { transform: translateX(-100%); }
        .door.open .door-panel--right { transform: translateX(100%); }
        .character {
          position: absolute;
          left: 50%;
          transform: translate(-50%, 0);
          z-index: 5;
          filter: drop-shadow(0 3px 0 rgba(0,0,0,0.4));
        }
        .character--room { bottom: 45%; }
        .pixel-sprite {
          display: grid;
          grid-template-columns: repeat(8, var(--u));
          grid-template-rows: repeat(11, var(--u));
        }
        .pixel { width: 100%; height: 100%; }
        .hint {
          position: absolute;
          left: 0; right: 0;
          bottom: 14px;
          text-align: center;
          color: var(--ui-text);
          font-size: 11px;
          letter-spacing: 0.02em;
          text-shadow: 0 2px 0 rgba(0,0,0,0.6);
          opacity: 0.85;
          transition: opacity 0.6s ease;
          pointer-events: none;
        }
        .hint.hidden { opacity: 0; }
        .vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at 50% 60%, transparent 45%, rgba(0,0,0,0.55) 100%);
        }
        .fade-overlay {
          position: absolute;
          inset: 0;
          background: var(--void);
          opacity: 0;
          transition: opacity 0.55s ease;
          pointer-events: none;
          z-index: 20;
        }
        .fade-overlay.active { opacity: 1; }
        .room-two { position: absolute; inset: 0; }
        .room-two-floor {
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(0deg, #5a4632 0 40px, #684f38 40px 80px),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 40px);
        }
        .restart-btn {
          position: absolute;
          top: 10px; right: 10px;
          width: 30px; height: 30px;
          border-radius: 3px;
          border: none;
          background: rgba(0,0,0,0.45);
          color: var(--ui-text);
          font-size: 16px;
          line-height: 30px;
          padding: 0;
          cursor: pointer;
        }
      `}</style>

      <div
        className="game-frame"
        style={{ "--scroll": `${scrollPx}px` }}
        onPointerDown={scene === "corridor" ? startWalk : undefined}
        onPointerUp={stopWalk}
        onPointerLeave={stopWalk}
        onPointerCancel={stopWalk}
      >
        {scene === "corridor" ? (
          <div className="scene">
            <div className="wall wall--left" />
            <div className="wall wall--right" />
            <div className="floor" />
            <div
              className={`door ${doorOpen ? "open" : ""}`}
              style={{ transform: `scale(${doorScale})` }}
            >
              <div className="door-panel door-panel--left" />
              <div className="door-panel door-panel--right" />
            </div>
            <PixelSprite
              frame={walkFrame === 0 ? FRAME_A : FRAME_B}
              className="character"
              style={{ bottom: `${charBottom}%` }}
            />
            <div className="vignette" />
            <div className={`hint ${everWalked ? "hidden" : ""}`}>tahan untuk jalan</div>
          </div>
        ) : (
          <RoomTwo onRestart={restart} />
        )}
        <div className={`fade-overlay ${fading ? "active" : ""}`} />
      </div>
    </div>
  );
}