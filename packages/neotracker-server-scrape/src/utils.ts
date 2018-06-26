export const add0x = (hash: string) => (hash.startsWith('0x') ? hash : `0x${hash}`);

export const strip0x = (hash: string) => (hash.startsWith('0x') ? hash.slice('0x'.length) : hash);
