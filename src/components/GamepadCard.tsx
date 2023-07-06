const GamepadCard = (gamepad: Gamepad, gamepadIndex: number) => {
  return (
    <div key={gamepadIndex} className="gamepadCard">
      <h2>{gamepad.id}</h2>
      {/* <p>Timestamp: {gamepad.timestamp.toFixed(5)}</p> */}
      <div className="buttonWrapper">
        {gamepad.buttons.map((button, buttonIndex) => (
          <p
            key={buttonIndex}
            className="buttonInfo">{`B${buttonIndex}: ${button.value.toFixed(
            2,
          )}`}</p>
        ))}
      </div>
      <hr />
      <div className="buttonWrapper">
        {gamepad.axes.map((axi, axiIndex) => (
          <p
            key={axiIndex}
            className="buttonInfo">{`Axis ${axiIndex}: ${axi.toFixed(5)}`}</p>
        ))}
      </div>
    </div>
  );
};

export default GamepadCard;
