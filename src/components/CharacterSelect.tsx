import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sword, Sparkles } from 'lucide-react';
import knightImg from '../assets/knight.jpeg';
import mageImg from '../assets/mage.webp';

type Character = 'knight' | 'mage';

interface CharacterSelectProps {
  onSelectCharacter: (character: Character) => void;
}

export default function CharacterSelect({ onSelectCharacter }: CharacterSelectProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [showStoneGlow, setShowStoneGlow] = useState(false);

  const handleAttack = () => {
    if (isAttacking || !selectedCharacter) return;
    setIsAttacking(true);
    setShowStoneGlow(true);
    setTimeout(() => {
      setIsAttacking(false);
      setShowStoneGlow(false);
    }, 1000);
  };

  const handleBeginQuest = () => {
    if (!selectedCharacter) return;
    onSelectCharacter(selectedCharacter);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-green-200 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-32 w-40 h-40 bg-yellow-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mb-12 text-center"
      >
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl pixel-text">
          Knight's Circular Energy
        </h1>
        <div className="retro-box mx-auto w-fit px-6 py-2">
          <p className="text-xl text-white drop-shadow-lg pixel-text">~ Choose Your Champion ~</p>
        </div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-12 mb-12 relative z-10">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`relative cursor-pointer transition-all duration-300 ${
            selectedCharacter === 'knight' ? 'scale-110' : 'scale-100 hover:scale-105'
          }`}
          onClick={() => setSelectedCharacter('knight')}
        >
          <div className={`relative w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 retro-border ${
            selectedCharacter === 'knight' ? 'border-red-500 selected-glow-red' : 'border-white'
          }`}>
            <img
              src={knightImg}
              alt="Knight"
              className={`w-full h-full object-cover transition-transform duration-300 ${
                selectedCharacter === 'knight' && isAttacking ? 'animate-slash' : ''
              }`}
            />
            {selectedCharacter === 'knight' && showStoneGlow && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-red-500 rounded-full animate-stone-glow shadow-red"></div>
            )}
            {selectedCharacter === 'knight' && (
              <div className="absolute top-2 left-2 bg-red-600/90 text-white px-2 py-1 text-xs font-bold rounded pixel-text">
                SELECTED
              </div>
            )}
          </div>
          <div className="text-center mt-4 retro-box">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg pixel-text">KNIGHT</h3>
            <p className="text-white/80 text-sm pixel-text">Warrior of Steel</p>
            <div className="mt-2 flex justify-center gap-2 text-xs">
              <span className="bg-red-600 text-white px-2 py-1 rounded pixel-text">ATK: 8</span>
              <span className="bg-blue-600 text-white px-2 py-1 rounded pixel-text">DEF: 9</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`relative cursor-pointer transition-all duration-300 ${
            selectedCharacter === 'mage' ? 'scale-110' : 'scale-100 hover:scale-105'
          }`}
          onClick={() => setSelectedCharacter('mage')}
        >
          <div className={`relative w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 retro-border ${
            selectedCharacter === 'mage' ? 'border-purple-500 selected-glow-purple' : 'border-white'
          }`}>
            <img
              src={mageImg}
              alt="Mage"
              className={`w-full h-full object-cover transition-transform duration-300 ${
                selectedCharacter === 'mage' && isAttacking ? 'animate-cast' : ''
              }`}
            />
            {selectedCharacter === 'mage' && showStoneGlow && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-purple-500 rounded-full animate-stone-glow shadow-purple"></div>
            )}
            {selectedCharacter === 'mage' && (
              <div className="absolute top-2 left-2 bg-purple-600/90 text-white px-2 py-1 text-xs font-bold rounded pixel-text">
                SELECTED
              </div>
            )}
          </div>
          <div className="text-center mt-4 retro-box">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg pixel-text">MAGE</h3>
            <p className="text-white/80 text-sm pixel-text">Master of Arcane</p>
            <div className="mt-2 flex justify-center gap-2 text-xs">
              <span className="bg-purple-600 text-white px-2 py-1 rounded pixel-text">MAG: 10</span>
              <span className="bg-blue-600 text-white px-2 py-1 rounded pixel-text">DEF: 6</span>
            </div>
          </div>
        </motion.div>
      </div>

      {selectedCharacter && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <button
            onClick={handleAttack}
            disabled={isAttacking}
            className={`px-8 py-4 text-xl font-bold text-white rounded-xl shadow-2xl transition-all duration-300 flex items-center gap-3 retro-border pixel-text ${
              selectedCharacter === 'knight'
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
            } ${isAttacking ? 'scale-95 opacity-70' : 'scale-100 hover:scale-105'}`}
          >
            {selectedCharacter === 'knight' ? (
              <>
                <Sword className={isAttacking ? 'animate-spin' : ''} />
                {isAttacking ? 'SLASHING!' : 'TEST ATTACK'}
              </>
            ) : (
              <>
                <Sparkles className={isAttacking ? 'animate-pulse' : ''} />
                {isAttacking ? 'CASTING!' : 'TEST SPELL'}
              </>
            )}
          </button>

          <button
            onClick={handleBeginQuest}
            className="px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 retro-border pixel-text animate-pulse-slow"
          >
            ▶ BEGIN QUEST ◀
          </button>
        </motion.div>
      )}
    </div>
  );
}
