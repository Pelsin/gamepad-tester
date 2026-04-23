import {useState} from 'react';
import DebugCard from './DebugCard';

type InfoType = {width?: string; label: string; value: string | number};

const Info = ({width, label, value}: InfoType) => (
  <div className="info" style={{width}}>
    <label>{label}</label>
    <p>{value}</p>
  </div>
);

type AxisCircleType = {x: number; y: number; labelX: string; labelY: string};

const AxisCircle = ({x, y, labelX, labelY}: AxisCircleType) => {
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const dotX = cx + x * r;
  const dotY = cy + y * r;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}>
      <div style={{display: 'flex', gap: '8px'}}>
        <Info width="60px" label={labelX} value={x.toFixed(3)} />
        <Info width="60px" label={labelY} value={y.toFixed(3)} />
      </div>
      <svg width={size} height={size}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="currentColor"
          strokeWidth={1.5}
          fill="none"
          opacity={0.4}
        />
        <line
          x1={cx}
          y1={cy - r}
          x2={cx}
          y2={cy + r}
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.3}
        />
        <line
          x1={cx - r}
          y1={cy}
          x2={cx + r}
          y2={cy}
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.3}
        />
        <circle cx={dotX} cy={dotY} r={5} fill="currentColor" />
      </svg>
    </div>
  );
};

type GamepadType = {gamepad: Gamepad};

const GamepadCard = ({gamepad}: GamepadType) => {
  const [connectedAt] = useState(new Date().toLocaleString());
  const [showDebug, setShowDebug] = useState(false);

  return (
    <>
      <button onClick={() => setShowDebug(!showDebug)}>
        {showDebug ? 'Hide Debug' : 'Show Debug'}
      </button>
      {showDebug ? (
        <DebugCard gamepad={gamepad} />
      ) : (
        <div className="card">
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
            {Array.from(
              {length: Math.ceil(gamepad.axes.length / 2)},
              (_, i) => (
                <AxisCircle
                  key={i}
                  x={gamepad.axes[i * 2] ?? 0}
                  y={gamepad.axes[i * 2 + 1] ?? 0}
                  labelX={`AXIS ${i * 2}`}
                  labelY={`AXIS ${i * 2 + 1}`}
                />
              ),
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GamepadCard;
