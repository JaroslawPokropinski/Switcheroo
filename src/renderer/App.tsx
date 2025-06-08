import { Checkbox, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
import { Config } from '../types';

const displayOptions = [
  { label: 'HDMI 1', value: 0x11 },
  { label: 'HDMI 2', value: 0x12 },
  { label: 'Display Port 1', value: 0x0f },
  { label: 'Display Port 2', value: 0x10 },
];

export default function App() {
  const [displays, setDisplays] = useState<string[]>();
  // const [selectedDisplay, setSelectedDisplay] = useState<string | undefined>();
  // const [selectedInput, setSelectedInput] = useState<number | undefined>();
  // const [selectedSecondInput, setSelectedSecondInput] = useState<
  //   number | undefined
  // >();
  const [config, setConfig] = useState<Partial<Config> | undefined>();

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

  useEffect(() => {
    window.electron?.ipcRenderer.once('ipc-get-config', (arg) => {
      const asArg = arg as Partial<Config>;
      setConfig(asArg);
    });

    window.electron?.ipcRenderer.sendMessage('ipc-get-config');
  }, []);

  useEffect(() => {
    window.electron?.ipcRenderer.once('ipc-get-displays', (arg) => {
      if (!Array.isArray(arg)) {
        throw new Error('Invalid displays');
      }

      setDisplays(arg.map((el) => String(el)));
    });

    window.electron?.ipcRenderer.sendMessage('ipc-get-displays');
  }, []);

  return (
    <div
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
        value={config?.keybind}
        onKeyUp={(event) => {
          updateConfig({
            keybind: event.key === 'Backspace' ? undefined : event.key,
          });
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
    </div>
  );
}
