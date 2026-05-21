import React, {useEffect, useMemo, useRef, useState} from 'react';

type DebugCardProps = {gamepad: Gamepad; onHide: () => void};

type EventKind = 'press' | 'release';

type ButtonEvent = {
  id: number;
  button: number;
  kind: EventKind;
  value: number;
  timestamp: string;
};

const MAX_LOGS = 10000;

const formatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  fractionalSecondDigits: 3,
} as Intl.DateTimeFormatOptions);

const formatTimestamp = (): string => formatter.format(new Date());

const diffButtons = (
  prev: readonly GamepadButton[],
  next: readonly GamepadButton[],
  startId: number,
): ButtonEvent[] => {
  const events: ButtonEvent[] = [];
  const timestamp = formatTimestamp();
  for (let i = 0; i < next.length; i++) {
    const a = prev[i];
    const b = next[i];
    if (a && a.pressed !== b.pressed) {
      events.push({
        id: startId + events.length,
        button: i,
        kind: b.pressed ? 'press' : 'release',
        value: b.value,
        timestamp,
      });
    }
  }
  return events;
};

const formatEvent = (e: ButtonEvent): string =>
  `[${e.timestamp}] B${e.button} ${e.kind === 'press' ? 'Press' : 'Release'} (${e.value.toFixed(2)})`;

const DebugCard = ({gamepad, onHide}: DebugCardProps) => {
  const lastButtonsRef = useRef(gamepad.buttons || []);
  const nextIdRef = useRef(0);
  const [logs, setLogs] = useState<ButtonEvent[]>([]);
  const [search, setSearch] = useState('');
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<'all' | 'press' | 'release'>('all');
  const [copyMsg, setCopyMsg] = useState('');

  useEffect(() => {
    if (paused) {
      lastButtonsRef.current = gamepad.buttons;
      return;
    }
    const changes = diffButtons(
      lastButtonsRef.current,
      gamepad.buttons,
      nextIdRef.current,
    );
    if (changes.length > 0) {
      nextIdRef.current += changes.length;
      setLogs(prev => [...changes.reverse(), ...prev].slice(0, MAX_LOGS));
    }
    lastButtonsRef.current = gamepad.buttons;
  }, [gamepad.buttons, paused]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return logs.filter(e => {
      if (filter !== 'all' && e.kind !== filter) return false;
      if (!needle) return true;
      return formatEvent(e).toLowerCase().includes(needle);
    });
  }, [logs, search, filter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);

  const handleClear = () => {
    setLogs([]);
    nextIdRef.current = 0;
  };

  const handleCopy = async () => {
    const text = filtered.map(formatEvent).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg('Copied!');
    } catch {
      setCopyMsg('Copy failed');
    }
    setTimeout(() => setCopyMsg(''), 1500);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <h2>{gamepad.id}</h2>
          <div className="card-badges">
            <span className="badge badge-info">
              {logs.length} event{logs.length === 1 ? '' : 's'}
            </span>
            {filtered.length !== logs.length && (
              <span className="badge">{filtered.length} shown</span>
            )}
            {paused && <span className="badge badge-warn">paused</span>}
          </div>
        </div>
        <div className="card-actions">
          <button
            className="action-btn"
            onClick={() => setPaused(p => !p)}
            title={paused ? 'Resume capturing' : 'Pause capturing'}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="action-btn"
            onClick={handleCopy}
            disabled={!filtered.length}>
            {copyMsg || 'Copy'}
          </button>
          <button
            className="action-btn"
            onClick={handleClear}
            disabled={!logs.length}>
            Clear
          </button>
          <button className="action-btn" onClick={onHide}>
            Hide Debug
          </button>
        </div>
      </div>

      <div className="debug-controls">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={handleSearch}
        />
        <div className="debug-filters">
          {(['all', 'press', 'release'] as const).map(opt => (
            <button
              key={opt}
              className={`filter-chip${filter === opt ? ' active' : ''}`}
              onClick={() => setFilter(opt)}>
              {opt[0].toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="debug-log">
        {filtered.length === 0 ? (
          <div className="debug-log-empty">
            {logs.length === 0
              ? 'Press any button to capture events...'
              : 'No events match the current filter.'}
          </div>
        ) : (
          filtered.map(e => (
            <div key={e.id} className={`debug-log-row debug-log-${e.kind}`}>
              <span className="debug-log-time">{e.timestamp}</span>
              <span className="debug-log-btn">B{e.button}</span>
              <span className="debug-log-kind">
                {e.kind === 'press' ? 'Press' : 'Release'}
              </span>
              <span className="debug-log-value">{e.value.toFixed(2)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DebugCard;
