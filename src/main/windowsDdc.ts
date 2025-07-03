import { IDdc } from './IDdc';

const REFRESH_INTERVAL = 10000;

class WindowsDdc implements IDdc {
  ddcci: typeof import('@hensm/ddcci') | null = null;

  async init() {
    if (this.ddcci) {
      return;
    }

    try {
      this.ddcci = await import('@hensm/ddcci');

      // refresh every 10 seconds to make sure it keeps working after system sleep
      setInterval(() => {
        try {
          // eslint-disable-next-line no-underscore-dangle
          this.ddcci?._refresh();
        } catch {
          // ignore
        }
      }, REFRESH_INTERVAL);
    } catch {
      throw new Error(
        'Failed to load @hensm/ddcci. Please ensure it is installed and available.',
      );
    }
  }

  getDisplays() {
    if (!this.ddcci) {
      throw new Error('DDCCI failed to initialize.');
    }

    return this.ddcci.getMonitorList();
  }

  getVCP(displayId: string, vcpCode: number) {
    if (!this.ddcci) {
      throw new Error('DDCCI failed to initialize.');
    }

    return this.ddcci.getVCP(displayId, vcpCode);
  }

  setVCP(displayId: string, vcpCode: number, value: number) {
    if (!this.ddcci) {
      throw new Error('DDCCI failad to initialize.');
    }

    return this.ddcci.setVCP(displayId, vcpCode, value);
  }
}

export const windowsDdc = new WindowsDdc();
