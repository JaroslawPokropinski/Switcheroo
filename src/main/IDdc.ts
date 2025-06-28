export interface IDdc {
  init(): Promise<void>;
  getDisplays(): string[];
  getVCP(displayId: string, vcpCode: number): number;
  setVCP(displayId: string, vcpCode: number, value: number): void;
}
