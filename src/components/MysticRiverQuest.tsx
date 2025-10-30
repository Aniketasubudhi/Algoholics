import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RefreshCcw, Sparkles, Shield, Swords, Home } from "lucide-react";
import knightImg from '../assets/knight.jpeg';
import mageImg from '../assets/mage.webp';

type Character = 'knight' | 'mage';

interface MysticRiverQuestProps {
  character: Character;
  onReturnHome: () => void;
}

function parseList(s: string, fallback: number[]): number[] {
  try {
    if (!s.trim()) return fallback;
    return s
      .split(/[,\s]+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .map(Number)
      .filter((x) => Number.isFinite(x));
  } catch {
    return fallback;
  }
}

function mod(a: number, n: number) {
  return ((a % n) + n) % n;
}

function findStrictPositiveStart(gain: number[], cost: number[]) {
  const n = gain.length;
  if (n === 0 || cost.length !== n) return { start: -1, total: -Infinity, possible: false };

  let total = 0;
  let start = 0;
  let tank = 0;
  for (let i = 0; i < n; i++) {
    const delta = gain[i] - cost[i];
    total += delta;
    if (tank + delta <= 0) {
      start = i + 1;
      tank = 0;
    } else {
      tank += delta;
    }
  }
  if (start >= n) start = -1;
  if (total <= 0) return { start: -1, total, possible: false };

  if (start >= 0) {
    let energy = 0;
    for (let k = 0; k < n; k++) {
      const i = (start + k) % n;
      energy += gain[i];
      energy -= cost[i];
      if (energy <= 0) return { start: -1, total, possible: false };
    }
    return { start, total, possible: true };
  }
  return { start: -1, total, possible: false };
}

function simulateRun(gain: number[], cost: number[], start: number) {
  const n = gain.length;
  let energy = 0;
  const steps: { idx: number; preCostEnergy: number; postCostEnergy: number }[] = [];
  let failAt: number | null = null;
  for (let k = 0; k < n; k++) {
    const i = (start + k) % n;
    energy += gain[i];
    const pre = energy;
    energy -= cost[i];
    const post = energy;
    steps.push({ idx: i, preCostEnergy: pre, postCostEnergy: post });
    if (post <= 0) {
      failAt = (i + 1) % n;
      break;
    }
  }
  return { steps, failAt, success: failAt === null };
}

function polarToXY(theta: number, radius: number, S: number) {
  const cx = S / 2;
  const cy = S / 2;
  const x = cx + radius * Math.cos(theta);
  const y = cy + radius * Math.sin(theta);
  return { x, y };
}

export default function MysticRiverQuest({ character, onReturnHome }: MysticRiverQuestProps) {
  const [gainStr, setGainStr] = useState("4, 6, 3, 5, 7, 2");
  const [costStr, setCostStr] = useState("3, 5, 4, 6, 3, 2");
  const gain = useMemo(() => parseList(gainStr, [4, 6, 3, 5, 7, 2]), [gainStr]);
  const cost = useMemo(() => parseList(costStr, [3, 5, 4, 6, 3, 2]), [costStr]);
  const n = Math.min(gain.length, cost.length);

  const { start: greedyStart, possible } = useMemo(() => findStrictPositiveStart(gain.slice(0, n), cost.slice(0, n)), [gain, cost, n]);

  const [startIndex, setStartIndex] = useState(0);
  useEffect(() => {
    if (n > 0) setStartIndex(greedyStart >= 0 ? greedyStart : 0);
  }, [greedyStart, n]);

  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(900);
  const [cursorStep, setCursorStep] = useState(0);
  const [visited, setVisited] = useState<number[]>([]);
  const [energy, setEnergy] = useState(0);
  const [failAt, setFailAt] = useState<number | null>(null);
  const [questComplete, setQuestComplete] = useState(false);

  const S = 540;
  const R = 200;

  const stones = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const theta = (2 * Math.PI * i) / n - Math.PI / 2;
      const { x, y } = polarToXY(theta, R, S);
      return { i, x, y, theta };
    });
  }, [n]);

  const trace = useMemo(() => simulateRun(gain.slice(0, n), cost.slice(0, n), startIndex), [gain, cost, n, startIndex]);

  useEffect(() => {
    if (!playing || n === 0) return;
    setVisited([]);
    setEnergy(0);
    setFailAt(null);
    setCursorStep(0);
    setQuestComplete(false);

    let k = 0;
    const id = setInterval(() => {
      if (k >= trace.steps.length) {
        clearInterval(id);
        setPlaying(false);
        if (trace.success) {
          setQuestComplete(true);
        }
        return;
      }
      const step = trace.steps[k];
      setVisited((v) => [...new Set([...v, step.idx])]);
      setEnergy(step.postCostEnergy);
      setCursorStep(k + 1);
      if (step.postCostEnergy <= 0) {
        setFailAt(step.idx);
        clearInterval(id);
        setPlaying(false);
        return;
      }
      k++;
    }, speedMs);
    return () => clearInterval(id);
  }, [playing, speedMs, trace, n]);

  function randomize() {
    const len = Math.max(5, Math.min(14, n || 8));
    const g = Array.from({ length: len }, () => Math.floor(2 + Math.random() * 9));
    const c = Array.from({ length: len }, () => Math.floor(1 + Math.random() * 8));
    setGainStr(g.join(", "));
    setCostStr(c.join(", "));
  }

  const currentIdx = n ? trace.steps[Math.min(cursorStep, trace.steps.length - 1)]?.idx ?? startIndex : 0;
  const characterColor = character === 'knight' ? 'red' : 'purple';
  const characterImg = character === 'knight' ? knightImg : mageImg;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 text-white p-6 retro-game">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between retro-box p-4 bg-slate-900/50"
        >
          <div className="flex items-center gap-3">
            <Swords className="w-7 h-7 text-yellow-400" />
            <h1 className="text-2xl md:text-3xl font-bold pixel-text">MYSTIC RIVER CROSSING</h1>
          </div>
          <button
            onClick={onReturnHome}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2 transition-all retro-border pixel-text"
          >
            <Home className="w-4 h-4" />
            MENU
          </button>
        </motion.header>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.section
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-4"
          >
            <div className="retro-box bg-slate-900/70 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-yellow-400 pb-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                <h2 className="font-bold pixel-text">YOUR HERO</h2>
              </div>
              <div className="flex gap-3">
                <img src={characterImg} alt={character} className="w-20 h-20 rounded-lg border-2 border-yellow-400 object-cover" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold pixel-text uppercase">{character}</h3>
                  <div className="text-xs text-slate-300 pixel-text">
                    {character === 'knight' ? 'Warrior of Steel' : 'Master of Arcane'}
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className={`bg-${characterColor}-600 px-2 py-1 rounded pixel-text`}>LVL 5</span>
                    <span className="bg-yellow-600 px-2 py-1 rounded pixel-text">HP: ∞</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="retro-box bg-slate-900/70 p-4 space-y-3">
              <h2 className="font-bold pixel-text border-b border-yellow-400 pb-2">QUEST SETUP</h2>
              <label className="block text-sm pixel-text">Energy at each stone</label>
              <input
                value={gainStr}
                onChange={(e) => setGainStr(e.target.value)}
                className="w-full border-2 border-slate-600 bg-slate-800 rounded-lg px-3 py-2 outline-none focus:border-yellow-400 pixel-text"
              />
              <label className="block text-sm pixel-text">Cost to next stone</label>
              <input
                value={costStr}
                onChange={(e) => setCostStr(e.target.value)}
                className="w-full border-2 border-slate-600 bg-slate-800 rounded-lg px-3 py-2 outline-none focus:border-yellow-400 pixel-text"
              />

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className={`px-4 py-2 rounded-lg shadow retro-border pixel-text flex items-center gap-2 ${
                    playing ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {playing ? "PAUSE" : "START"}
                </button>
                <button
                  onClick={() => {
                    setVisited([]);
                    setCursorStep(0);
                    setEnergy(0);
                    setFailAt(null);
                    setQuestComplete(false);
                  }}
                  className="px-4 py-2 rounded-lg shadow bg-slate-700 hover:bg-slate-600 retro-border pixel-text flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  RESET
                </button>
                <button
                  onClick={randomize}
                  className="px-4 py-2 rounded-lg shadow bg-blue-600 hover:bg-blue-700 retro-border pixel-text flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  RANDOM
                </button>
              </div>

              <div className="pt-2">
                <label className="text-xs pixel-text">Speed: {((1500 - speedMs) / 10).toFixed(0)}%</label>
                <input
                  type="range"
                  min={300}
                  max={1400}
                  step={100}
                  value={speedMs}
                  onChange={(e) => setSpeedMs(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-slate-800 border-2 border-green-500 rounded-lg p-2">
                  <div className="text-[10px] text-slate-400 pixel-text">OPTIMAL START</div>
                  <div className="text-lg font-bold text-green-400 pixel-text">{possible ? greedyStart : "NONE"}</div>
                </div>
                <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-2">
                  <div className="text-[10px] text-slate-400 pixel-text">START</div>
                  <select
                    value={startIndex}
                    onChange={(e) => setStartIndex(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 mt-1 pixel-text"
                  >
                    {Array.from({ length: n }, (_, i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="retro-box bg-slate-900/70 p-4">
              <h2 className="font-bold pixel-text mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                ENERGY STATUS
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden border-2 border-slate-600">
                  <div
                    className={`h-full transition-all duration-300 ${energy > 0 ? "bg-green-500" : "bg-red-500"}`}
                    style={{ width: `${Math.min(100, Math.max(0, (energy / 20) * 100))}%` }}
                  />
                </div>
                <div className={`text-lg font-mono font-bold pixel-text ${energy > 0 ? "text-green-400" : "text-red-400"}`}>
                  {energy.toFixed(0)}
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-2 pixel-text">
                {trace.success ? "✓ Quest is completable from this start" : "✗ Quest will fail from this start"}
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="retro-box bg-slate-900/70 p-4">
              <h2 className="font-bold pixel-text mb-3 text-center text-xl">⚔ THE MYSTIC RIVER ⚔</h2>
              <div className="relative mx-auto" style={{ width: S, height: S }}>
                <div
                  className="absolute inset-0 rounded-full river-animation"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(59,130,246,0.1) 35%, rgba(59,130,246,0.2) 50%, rgba(14,165,233,0.3) 65%, rgba(6,182,212,0.4) 80%)",
                  }}
                />

                {stones.map(({ i, x, y }) => {
                  const active = visited.includes(i);
                  const failedHere = failAt !== null && (failAt === i || mod(i - 1, n) === failAt);
                  return (
                    <motion.div
                      key={i}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      style={{ left: x, top: y }}
                    >
                      <div
                        className={`w-16 h-16 rounded-full shadow-lg grid place-items-center border-4 text-sm font-bold select-none pixel-text transition-all ${
                          failedHere
                            ? "bg-red-900 border-red-500 animate-shake"
                            : active
                            ? `bg-${characterColor}-200 border-${characterColor}-500 stone-glow-${characterColor}`
                            : "bg-slate-700 border-slate-500"
                        }`}
                      >
                        {i}
                      </div>
                      <div className="mt-1 text-center text-[10px] text-slate-300 pixel-text bg-slate-900/80 rounded px-1">
                        +{gain[i]} / -{cost[i]}
                      </div>
                    </motion.div>
                  );
                })}

                <svg className="absolute inset-0 pointer-events-none" width={S} height={S}>
                  {stones.map((s, idx) => {
                    if (n === 0) return null;
                    const a = s;
                    const b = stones[(idx + 1) % n];
                    const visitedEdge = visited.includes(a.i);
                    return (
                      <line
                        key={idx}
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke={visitedEdge ? "#10b981" : "#475569"}
                        strokeWidth={visitedEdge ? 4 : 2}
                        strokeDasharray={visitedEdge ? "" : "4 6"}
                        opacity={0.6}
                        className={visitedEdge ? "path-glow" : ""}
                      />
                    );
                  })}
                </svg>

                <AnimatePresence mode="wait">
                  {n > 0 && (
                    <motion.div
                      key={currentIdx}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                      style={{
                        left: stones[currentIdx]?.x ?? S / 2,
                        top: stones[currentIdx]?.y ?? S / 2,
                      }}
                    >
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 grid place-items-center shadow-2xl border-4 border-yellow-300 character-bounce`}>
                        <img src={characterImg} alt={character} className="w-12 h-12 rounded-full object-cover" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {questComplete && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 bg-black/50 grid place-items-center"
                  >
                    <div className="retro-box bg-yellow-600 p-8 text-center">
                      <h2 className="text-4xl font-bold pixel-text mb-4">🎉 QUEST COMPLETE! 🎉</h2>
                      <p className="pixel-text text-lg">The hero has crossed the mystic river!</p>
                    </div>
                  </motion.div>
                )}

                {failAt !== null && !playing && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 bg-black/50 grid place-items-center"
                  >
                    <div className="retro-box bg-red-900 p-8 text-center border-4 border-red-500">
                      <h2 className="text-4xl font-bold pixel-text mb-4">💀 QUEST FAILED 💀</h2>
                      <p className="pixel-text text-lg">Energy depleted at stone {failAt}</p>
                      <p className="pixel-text text-sm mt-2">Try a different starting stone!</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="retro-box bg-slate-900/70 p-4"
        >
          <h2 className="font-bold pixel-text mb-3">📜 JOURNEY LOG</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-yellow-400 border-b-2 border-yellow-400">
                  <th className="py-2 pr-4 pixel-text">STEP</th>
                  <th className="py-2 pr-4 pixel-text">STONE</th>
                  <th className="py-2 pr-4 pixel-text">GAIN</th>
                  <th className="py-2 pr-4 pixel-text">COST</th>
                  <th className="py-2 pr-4 pixel-text">ENERGY</th>
                  <th className="py-2 pr-4 pixel-text">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {trace.steps.map((s, k) => (
                  <tr key={k} className={`border-t border-slate-700 ${s.postCostEnergy > 0 ? "" : "bg-red-900/30"}`}>
                    <td className="py-2 pr-4 font-mono pixel-text">{k + 1}</td>
                    <td className="py-2 pr-4 pixel-text">{s.idx}</td>
                    <td className="py-2 pr-4 text-green-400 pixel-text">+{gain[s.idx]}</td>
                    <td className="py-2 pr-4 text-red-400 pixel-text">-{cost[s.idx]}</td>
                    <td className={`py-2 pr-4 font-mono pixel-text ${s.postCostEnergy > 0 ? "text-green-400" : "text-red-400"}`}>
                      {s.postCostEnergy}
                    </td>
                    <td className="py-2 pr-4 pixel-text">{s.postCostEnergy > 0 ? "✓ OK" : "✗ FAIL"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
