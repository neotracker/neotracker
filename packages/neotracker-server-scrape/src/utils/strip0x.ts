export const strip0x = (hash: string) => (hash.startsWith('0x') ? hash.slice('0x'.length) : hash);
