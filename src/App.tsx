import { useState } from 'react';
import CharacterSelect from './components/CharacterSelect';
import MysticRiverQuest from './components/MysticRiverQuest';

type Character = 'knight' | 'mage';
type GameState = 'select' | 'quest';

function App() {
  const [gameState, setGameState] = useState<GameState>('select');
  const [selectedCharacter, setSelectedCharacter] = useState<Character>('knight');

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setGameState('quest');
  };

  const handleReturnHome = () => {
    setGameState('select');
  };

  return (
    <>
      {gameState === 'select' && (
        <CharacterSelect onSelectCharacter={handleSelectCharacter} />
      )}
      {gameState === 'quest' && (
        <MysticRiverQuest character={selectedCharacter} onReturnHome={handleReturnHome} />
      )}
    </>
  );
}

export default App;
