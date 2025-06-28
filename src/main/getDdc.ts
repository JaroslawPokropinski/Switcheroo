import { linuxDdc } from './linuxDdc';
import { windowsDdc } from './windowsDdc';

export function getDdc() {
  if (process.platform === 'win32') {
    return windowsDdc;
  }

  if (process.platform === 'linux') {
    return linuxDdc;
  }

  throw new Error(`Unsupported platform: ${process.platform}`);
}
