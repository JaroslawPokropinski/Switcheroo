import { Checkbox, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { Config } from '../types';

const displayOptions = [
  { label: 'HDMI 1', value: 0x11 },
  { label: 'HDMI 2', value: 0x12 },
  { label: 'Display Port 1', value: 0x0f },
  { label: 'Display Port 2', value: 0x10 },
];

/**
 * Create electron accelerator string from the keyboard event.
 */
function getAccelerator(keyEvent: React.KeyboardEvent<HTMLInputElement>) {
  const resultArr: string[] = [];

  if (keyEvent.ctrlKey || keyEvent.metaKey) {
    resultArr.push('CmdOrCtrl');
  }

  if (keyEvent.altKey) {
    resultArr.push('Alt');
  }

  if (keyEvent.shiftKey) {
    resultArr.push('Shift');
  }

  if (!resultArr.includes(keyEvent.key)) {
    resultArr.push(keyEvent.key);
  }

  return resultArr.join('+');
}

export default function App() {
  const [displays, setDisplays] = useState<string[]>();
  const [config, setConfig] = useState<Partial<Config> | undefined>();
  const [keybindInput, setKeybindInput] = useState<string>();
  const isWin = window.electron?.ipcRenderer.getOs() === 'win32';
  const containerRef = React.useRef<HTMLDivElement>(null);

  function updateConfig(updatedValues: Partial<Config>) {
    window.electron?.ipcRenderer.sendMessage(
      'ipc-update-config',
      updatedValues,
    );

    setConfig((prev) => ({
      ...prev,
      ...updatedValues,
    }));
  }

  // Load config from the main process
  useEffect(() => {
    window.electron?.ipcRenderer.once('ipc-get-config', (arg) => {
      const asArg = arg as Partial<Config>;
      setConfig(asArg);
      setKeybindInput(asArg.keybind);
    });

    window.electron?.ipcRenderer.sendMessage('ipc-get-config');
  }, []);

  // Load displays from the main process
  useEffect(() => {
    window.electron?.ipcRenderer.once('ipc-get-displays', (arg) => {
      if (!Array.isArray(arg)) {
        throw new Error('Invalid displays');
      }

      setDisplays(arg.map((el) => String(el)));
    });

    window.electron?.ipcRenderer.sendMessage('ipc-get-displays');
  }, []);

  // Resize the window to fit the content
  useEffect(() => {
    const size = containerRef.current?.getBoundingClientRect();
    window.electron?.ipcRenderer.sendMessage('resize-window', {
      height: size?.height && Math.min(size.height, 800),
    });
  }, [config]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <Select
        style={{
          width: '100%',
          marginBottom: '20px',
        }}
        loading={displays === undefined}
        disabled={displays === undefined}
        placeholder="Select display"
        value={config?.display}
        onChange={(value) => {
          updateConfig({ display: value });
        }}
      >
        {displays?.map((display) => (
          <Select.Option key={display} value={display}>
            {display.match(/#(?<name>.+?)#/)?.groups?.name ?? 'Unknown'}
          </Select.Option>
        ))}
      </Select>

      <Select
        style={{
          width: '100%',
          marginBottom: '20px',
        }}
        value={config?.mainInput}
        placeholder="Select main input"
        onChange={(value) => {
          updateConfig({ mainInput: value });
        }}
      >
        {displayOptions.map((display) => (
          <Select.Option key={display.value} value={display.value}>
            {display.label}
          </Select.Option>
        ))}
      </Select>

      <Select
        style={{
          width: '100%',
          marginBottom: '20px',
        }}
        value={config?.secondInput}
        placeholder="Select secondary input"
        onChange={(value) => {
          window.electron?.ipcRenderer.sendMessage('ipc-update-config', {
            secondInput: value,
          });
        }}
      >
        {displayOptions.map((display) => (
          <Select.Option key={display.value} value={display.value}>
            {display.label}
          </Select.Option>
        ))}
      </Select>

      <Input
        style={{
          width: '100%',
          marginBottom: '20px',
        }}
        placeholder="Switching keybind"
        value={keybindInput}
        onFocus={() => {
          updateConfig({
            keybind: undefined,
          });
        }}
        onBlur={() => {
          updateConfig({
            keybind: keybindInput,
          });
        }}
        onKeyDown={(event) => {
          setKeybindInput(
            event.key === 'Backspace' ? undefined : getAccelerator(event),
          );
        }}
      />

      <Checkbox
        style={{
          width: '100%',
          marginBottom: '20px',
        }}
        checked={!!config?.runOnStart}
        onChange={(event) => {
          updateConfig({
            runOnStart: event.target.checked,
          });
        }}
      >
        Run on startup
      </Checkbox>

      {isWin && (
        <Checkbox
          style={{
            width: '100%',
            marginBottom: '20px',
          }}
          checked={!!config?.useVoicemeeter}
          onChange={(event) => {
            updateConfig({
              useVoicemeeter: event.target.checked,
            });
          }}
        >
          Use Voicemeeter
        </Checkbox>
      )}

      {isWin && !!config?.useVoicemeeter && (
        <Input
          style={{
            width: '100%',
            marginBottom: '20px',
          }}
          placeholder="Voicemeeter input index"
          type="number"
          value={config?.voicemeeterInputIndex}
          onChange={(event) => {
            const value = parseInt(event.target.value, 10);
            updateConfig({
              voicemeeterInputIndex: Number.isNaN(value) ? undefined : value,
            });
          }}
        />
      )}
    </div>
  );
}
