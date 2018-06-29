export const add0x = (hash: string) => (hash.startsWith('0x') ? hash : `0x${hash}`);
