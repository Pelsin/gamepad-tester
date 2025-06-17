import {useEffect, useState} from 'react';

type InfoType = {
  width?: string;
  label: string;
  value: string | number;
};

const Info = ({width, label, value}: InfoType) => (
  <div className="info" style={{width}}>
    <label>{label}</label>
    <p>{value}</p>
  </div>
);

type GamepadType = {
  gamepad: Gamepad;
};

type ChangedButton = {
  number: number;
  pressed: boolean;
};

const PrintGamepadButtonChanges = (
  lastButtons: readonly GamepadButton[],
  newButtons: readonly GamepadButton[],
) => {
  const changes = newButtons.reduce<ChangedButton[]>((acc, button, index) => {
    if (lastButtons[index] && lastButtons[index].pressed !== button.pressed) {
      return [...acc, {number: index, pressed: button.pressed}];
    }
    return acc;
  }, []);

  changes?.forEach(button => {
    console.log(
      `[${new Date().toLocaleTimeString()}] Button ${button.number}: ${
        button.pressed ? 'Pressed' : 'Released'
      }`,
    );
  });
};

const GamepadCard = ({gamepad}: GamepadType) => {
  const [connectedAt] = useState(new Date().toLocaleString());
  const [_, setLastButtonChange] = useState(gamepad.buttons || []);

  useEffect(() => {
    setLastButtonChange(lastButtons => {
      PrintGamepadButtonChanges(lastButtons, gamepad.buttons);
      return gamepad.buttons;
    });
  }, [gamepad.buttons]);

  return (
    <div className="gamepadCard">
      <h2>{gamepad.id}</h2>
      <div className="row">
        <Info label="Index" value={gamepad.index} />
        <Info label="Timestamp" value={gamepad.timestamp.toFixed(5)} />
        <Info label="Connected" value={connectedAt} />
      </div>
      <hr />
      <div className="row">
        {gamepad.buttons.map((button, index) => (
          <Info
            key={index}
            width="40px"
            label={`B${index}`}
            value={button.value.toFixed(2)}
          />
        ))}
      </div>
      <hr />
      <div className="row">
        {gamepad.axes.map((axi, index) => (
          <Info
            key={index}
            width="80px"
            label={`AXIS ${index}`}
            value={axi.toFixed(5)}
          />
        ))}
      </div>
    </div>
  );
};

export default GamepadCard;
