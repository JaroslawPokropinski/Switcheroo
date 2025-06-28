import { IDdc } from './IDdc';

class WindowsDdc implements IDdc {
  ddcci: typeof import('@hensm/ddcci') | null = null;

  async init() {
    if (this.ddcci) {
      return;
    }
    try {
      this.ddcci = await import('@hensm/ddcci');
    } catch {
      throw new Error(
        'Failed to load @hensm/ddcci. Please ensure it is installed and available.',
      );
    }
  }

  getDisplays() {
    if (!this.ddcci) {
      throw new Error('DDCCI failad to initialize.');
    }

    return this.ddcci.getMonitorList();
  }

  getVCP(displayId: string, vcpCode: number) {
    if (!this.ddcci) {
      throw new Error('DDCCI failad to initialize.');
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
