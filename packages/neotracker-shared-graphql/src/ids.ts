export const toGlobalID = (type: string, id: number): string => [type, id].join(':');

interface ResolvedGlobalID {
  readonly type: string;
  readonly id: number;
}

export const fromGlobalID = (globalID: string): ResolvedGlobalID => {
  const delimiterPos = globalID.indexOf(':');

  return {
    type: globalID.substring(0, delimiterPos),
    id: parseInt(globalID.substring(delimiterPos + 1), 10),
  };
};
