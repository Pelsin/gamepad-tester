import './App.css';
import GamepadCard from './components/GamepadCard';
import useGamepads from './hooks/useGamepads';

function App() {
  const gamepads = useGamepads();

  return (
    <>
      <h1 className="title">Gamepad tester</h1>
      {gamepads.map(GamepadCard)}
    </>
  );
}

export default App;
