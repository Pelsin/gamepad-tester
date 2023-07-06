import {useState, useRef, useCallback, useEffect} from 'react';

type GamepadsState = {
  [index: number]: Gamepad;
};

type Timestamps = {
  [index: number]: number;
};

const useGamepads = () => {
  const [gamepads, setGamepads] = useState<GamepadsState>({});
  const timestamps = useRef<Timestamps>({});
  const processRef = useRef<number>();

  const onGamepadConnected = useCallback(
    (event: GamepadEvent) =>
      setGamepads(pads => ({...pads, [event.gamepad.index]: event.gamepad})),
    [],
  );

  const onGamepadDisconnected = useCallback(
    (event: GamepadEvent) =>
      setGamepads(pads => {
        const {[event.gamepad.index]: _, ...rest} = pads;
        return rest;
      }),
    [],
  );

  const processPads = useCallback(() => {
    if (Object.values(gamepads).length) {
      navigator
        .getGamepads()
        .filter(Boolean)
        .map(newPadState => {
          if (
            !newPadState ||
            timestamps.current[newPadState.index] === newPadState.timestamp
          )
            return;
          timestamps.current[newPadState.index] = newPadState.timestamp;
          setGamepads(pads => ({...pads, [newPadState.index]: newPadState}));
        });
    }
    processRef.current = requestAnimationFrame(processPads);
  }, [gamepads]);

  useEffect(() => {
    window.addEventListener('gamepadconnected', onGamepadConnected);
    window.addEventListener('gamepaddisconnected', onGamepadDisconnected);

    return () => {
      window.removeEventListener('gamepadconnected', onGamepadConnected);
      window.removeEventListener('gamepaddisconnected', onGamepadDisconnected);
    };
  }, [onGamepadConnected, onGamepadDisconnected]);

  useEffect(() => {
    processRef.current = requestAnimationFrame(processPads);
    return () => {
      if (processRef.current) cancelAnimationFrame(processRef.current);
    };
  }, [processPads]);

  return Object.values(gamepads);
};

export default useGamepads;
