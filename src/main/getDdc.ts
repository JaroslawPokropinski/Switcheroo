import { IDdc } from './IDdc';
import { linuxDdc } from './linuxDdc';
import { windowsDdc } from './windowsDdc';

let isInit = false;

const ddcMap: Record<string, IDdc | undefined> = {
  win32: windowsDdc,
  linux: linuxDdc,
};

export function getDdc() {
  const ddc = ddcMap[process.platform];

  if (!ddc) {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }

  if (!isInit) {
    isInit = true;
    ddc.init();
  }

  return ddc;
}
