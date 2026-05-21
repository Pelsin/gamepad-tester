import {useState} from 'react';
import DebugCard from './DebugCard';

const STANDARD_AXIS_LABELS = ['Left X', 'Left Y', 'Right X', 'Right Y'];
const STANDARD_STICK_TITLES = ['Left Stick', 'Right Stick'];
const TRIGGER_INDICES = new Set([6, 7]);

type InfoType = {width?: string; label: string; value: string | number};

const Info = ({width, label, value}: InfoType) => (
  <div className="info" style={{width}}>
    <label>{label}</label>
    <p>{value}</p>
  </div>
);

type ButtonCellProps = {
  index: number;
  value: number;
  pressed: boolean;
  isTrigger: boolean;
};

const ButtonCell = ({index, value, pressed, isTrigger}: ButtonCellProps) => {
  const fillHeight = Math.min(100, Math.max(0, value * 100));
  return (
    <div
      className={`btn-cell${pressed ? ' pressed' : ''}${
        isTrigger ? ' btn-cell-trigger' : ''
      }`}>
      {isTrigger && (
        <div className="btn-cell-fill" style={{height: `${fillHeight}%`}} />
      )}
      <div className="btn-cell-content">
        <span className="btn-cell-label">B{index}</span>
        <span className="btn-cell-value">{value.toFixed(2)}</span>
      </div>
    </div>
  );
};

type AxisCircleProps = {
  title: string;
  x: number;
  y: number;
  labelX: string;
  labelY: string;
  pressed?: boolean;
  uid: string;
};

const AxisCircle = ({
  title,
  x,
  y,
  labelX,
  labelY,
  pressed,
  uid,
}: AxisCircleProps) => {
  const size = 150;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const dotX = cx + x * r;
  const dotY = cy + y * r;
  const magnitude = Math.min(1, Math.sqrt(x * x + y * y));
  const angle = Math.atan2(y, x) * (180 / Math.PI);

  return (
    <div className="stick">
      <div className="stick-header">
        <span className="stick-title">{title}</span>
        {pressed && <span className="stick-pressed-pill">Pressed</span>}
      </div>
      <svg width={size} height={size} className="stick-svg">
        <defs>
          <radialGradient id={`stick-grad-${uid}`}>
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.25)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill={`url(#stick-grad-${uid})`} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="currentColor"
          strokeWidth={1.5}
          fill="none"
          opacity={0.4}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.66}
          stroke="currentColor"
          strokeWidth={0.5}
          fill="none"
          opacity={0.2}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.33}
          stroke="currentColor"
          strokeWidth={0.5}
          fill="none"
          opacity={0.2}
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
        <line
          x1={cx}
          y1={cy}
          x2={dotX}
          y2={dotY}
          stroke="rgb(99, 102, 241)"
          strokeWidth={1.5}
          opacity={0.7}
        />
        <circle
          cx={dotX}
          cy={dotY}
          r={7}
          fill={pressed ? 'rgb(244, 114, 182)' : 'rgb(99, 102, 241)'}
          stroke="white"
          strokeWidth={1.5}
        />
      </svg>
      <div className="stick-values">
        <Info width="56px" label={labelX} value={x.toFixed(3)} />
        <Info width="56px" label={labelY} value={y.toFixed(3)} />
        <Info width="56px" label="MAG" value={magnitude.toFixed(3)} />
        <Info width="56px" label="ANG" value={`${Math.round(angle)}°`} />
      </div>
    </div>
  );
};

type VibrationEffectParams = {
  duration: number;
  startDelay?: number;
  strongMagnitude: number;
  weakMagnitude: number;
};

type VibrationActuator = {
  // eslint-disable-next-line no-unused-vars
  playEffect?(_type: string, _params: VibrationEffectParams): Promise<unknown>;
  reset?(): Promise<unknown>;
};

type GamepadWithVibration = Gamepad & {
  vibrationActuator?: VibrationActuator | null;
};

const playVibration = (
  gamepad: Gamepad,
  duration: number,
  strong: number,
  weak: number,
) => {
  const actuator = (gamepad as GamepadWithVibration).vibrationActuator;
  if (!actuator?.playEffect) return;
  actuator
    .playEffect('dual-rumble', {
      duration,
      strongMagnitude: strong,
      weakMagnitude: weak,
    })
    .catch(() => {});
};

type GamepadType = {gamepad: Gamepad};

const GamepadCard = ({gamepad}: GamepadType) => {
  const [connectedAt] = useState(new Date().toLocaleString());
  const [showDebug, setShowDebug] = useState(false);
  const isStandard = gamepad.mapping === 'standard';
  const canVibrate = Boolean(
    (gamepad as GamepadWithVibration).vibrationActuator?.playEffect,
  );

  const stickCount = Math.ceil(gamepad.axes.length / 2);
  const cardUid = `${gamepad.index}`;

  return (
    <>
      {showDebug ? (
        <DebugCard gamepad={gamepad} onHide={() => setShowDebug(false)} />
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <h2>{gamepad.id}</h2>
              <div className="card-badges">
                <span
                  className={`badge${isStandard ? ' badge-good' : ' badge-warn'}`}>
                  {gamepad.mapping || 'unknown'} mapping
                </span>
                <span className="badge badge-good">connected</span>
                {canVibrate && (
                  <span className="badge badge-info">rumble</span>
                )}
              </div>
            </div>
            <div className="card-actions">
              <button
                className="action-btn"
                disabled={!canVibrate}
                onClick={() => playVibration(gamepad, 400, 1, 0.6)}
                title={
                  canVibrate
                    ? 'Rumble for 400ms'
                    : 'Vibration not supported'
                }>
                Test Rumble
              </button>
              <button
                className="action-btn"
                onClick={() => setShowDebug(true)}>
                Debug Log
              </button>
            </div>
          </div>

          <div className="row card-meta">
            <Info label="Index" value={gamepad.index} />
            <Info label="Buttons" value={gamepad.buttons.length} />
            <Info label="Axes" value={gamepad.axes.length} />
            <Info label="Timestamp" value={gamepad.timestamp.toFixed(2)} />
            <Info label="Connected" value={connectedAt} />
          </div>

          <hr />
          <h3 className="section-title">Buttons</h3>
          <div className="btn-grid">
            {gamepad.buttons.map((button, index) => (
              <ButtonCell
                key={index}
                index={index}
                value={button.value}
                pressed={button.pressed}
                isTrigger={isStandard && TRIGGER_INDICES.has(index)}
              />
            ))}
          </div>

          <hr />
          <h3 className="section-title">Sticks</h3>
          <div className="row sticks-row">
            {Array.from({length: stickCount}, (_, i) => {
              const pressedIndex = i === 0 ? 10 : i === 1 ? 11 : -1;
              const pressed =
                isStandard && gamepad.buttons[pressedIndex]?.pressed;
              const stickTitle =
                isStandard && STANDARD_STICK_TITLES[i]
                  ? STANDARD_STICK_TITLES[i]
                  : `Stick ${i + 1}`;
              const labelX =
                isStandard && STANDARD_AXIS_LABELS[i * 2]
                  ? STANDARD_AXIS_LABELS[i * 2]
                  : `AXIS ${i * 2}`;
              const labelY =
                isStandard && STANDARD_AXIS_LABELS[i * 2 + 1]
                  ? STANDARD_AXIS_LABELS[i * 2 + 1]
                  : `AXIS ${i * 2 + 1}`;
              return (
                <AxisCircle
                  key={i}
                  uid={`${cardUid}-${i}`}
                  title={stickTitle}
                  x={gamepad.axes[i * 2] ?? 0}
                  y={gamepad.axes[i * 2 + 1] ?? 0}
                  labelX={labelX}
                  labelY={labelY}
                  pressed={pressed}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default GamepadCard;
