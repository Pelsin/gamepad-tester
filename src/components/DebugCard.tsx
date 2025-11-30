import React, {useEffect, useRef, useState} from 'react';

type DebugCardProps = {gamepad: Gamepad};

type ChangedButton = {number: number; pressed: boolean; timestamp: string};

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

const formatTimestamp = (): string => {
  return formatter.format(new Date());
};

const PrintGamepadButtonChanges = (
  lastButtons: readonly GamepadButton[],
  newButtons: readonly GamepadButton[],
): ChangedButton[] => {
  const changes = newButtons.reduce<ChangedButton[]>((acc, button, index) => {
    if (lastButtons[index] && lastButtons[index].pressed !== button.pressed) {
      return [
        ...acc,
        {number: index, pressed: button.pressed, timestamp: formatTimestamp()},
      ];
    }
    return acc;
  }, []);

  return changes;
};

const formatLogEntry = (log: ChangedButton): string => {
  return `[${log.timestamp}] Button ${log.number}: ${log.pressed ? 'Pressed' : 'Released'}`;
};

const DebugCard = ({gamepad}: DebugCardProps) => {
  const lastButtonsRef = useRef(gamepad.buttons || []);
  const [logs, setLogs] = useState<ChangedButton[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const changes = PrintGamepadButtonChanges(
      lastButtonsRef.current,
      gamepad.buttons,
    );
    if (changes.length > 0) {
      setLogs(prev => [...changes, ...prev].slice(0, MAX_LOGS));
    }
    lastButtonsRef.current = gamepad.buttons;
  }, [gamepad.buttons]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = 0;
    }
  }, [logs]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const getFilteredLogs = () => {
    if (!searchTerm) {
      return logs;
    }

    try {
      return logs.filter(log => {
        const logString = formatLogEntry(log);
        return logString.toLowerCase().includes(searchTerm.toLowerCase());
      });
    } catch {
      return logs;
    }
  };

  const filteredLogs = getFilteredLogs();

  const logText =
    filteredLogs.length === 0
      ? searchTerm
        ? 'No results found...'
        : 'Press any button to see logs...'
      : filteredLogs.map(log => formatLogEntry(log)).join('\n');

  return (
    <div className="card">
      <h2>{gamepad.id}</h2>
      <div style={{marginBottom: '10px'}}>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={handleFilterChange}
        />
      </div>
      <textarea
        ref={textareaRef}
        value={logText}
        readOnly
        style={{resize: 'none'}}
        rows={20}
      />
    </div>
  );
};

export default DebugCard;
