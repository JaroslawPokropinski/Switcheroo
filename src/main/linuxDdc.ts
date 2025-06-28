/* eslint-disable class-methods-use-this */
import { execSync } from 'child_process';
import { IDdc } from './IDdc';

class LinuxDdc implements IDdc {
  async init(): Promise<void> {
    // Initialization logic for Linux DDC
  }

  getDisplays(): string[] {
    const output = execSync('ddcutil detect').toString();
    const lines = output.split('\n');

    return lines
      .filter((line) => line.includes('Display'))
      .map((line) => {
        const match = line.match(/Display (\d+):/);
        return match ? `Display ${match[1]}` : '';
      })
      .filter((display) => display !== '');
  }

  getVCP(displayId: string, vcpCode: number): number {
    try {
      const output = execSync(
        `ddcutil getvcp ${vcpCode} --display=${displayId}`,
      ).toString();
      const match = output.match(/value: (\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    } catch (error) {
      console.error(
        `Error getting VCP code ${vcpCode} for display ${displayId}:`,
        error,
      );
    }

    return -1;
  }

  setVCP(displayId: string, vcpCode: number, value: number): void {
    try {
      execSync(`ddcutil setvcp ${vcpCode} ${value} --display=${displayId}`);
    } catch (error) {
      console.error(
        `Error setting VCP code ${vcpCode} to value ${value} for display ${displayId}:`,
        error,
      );
    }
  }
}

export const linuxDdc = new LinuxDdc();
