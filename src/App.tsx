import './App.css';
import GamepadCard from './components/GamepadCard';
import useGamepads from './hooks/useGamepads';

function App() {
  const gamepads = useGamepads();

  return (
    <>
      {!gamepads.length && (
        <h1 className="title">
          Connect a gamepad and
          <br />
          press any button to start
        </h1>
      )}
      {gamepads.map(GamepadCard)}
    </>
  );
}

export default App;
