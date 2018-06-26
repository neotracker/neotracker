export interface HotServer {
  readonly start: () => Promise<void>;
  readonly stop: () => Promise<void>;
}
