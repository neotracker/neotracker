import { UAParser } from 'ua-parser-js';

export const getUA = (uaIn: string | ReadonlyArray<string> | undefined) => {
  const nonNullUA = uaIn === undefined ? '' : uaIn;
  const ua = Array.isArray(nonNullUA) ? nonNullUA[0] : nonNullUA;

  let userAgent: IUAParser.IResult = {
    ua,
    browser: {
      name: '',
      version: '',
      major: '',
    },
    device: {
      model: '',
      type: '',
      vendor: '',
    },
    engine: {
      name: '',
      version: '',
    },
    os: {
      name: '',
      version: '',
    },
    cpu: {
      architecture: '',
    },
  };

  let error;
  try {
    userAgent = new UAParser(ua).getResult();
  } catch (err) {
    error = err;
  }

  if (error != undefined) {
    return { type: 'error', userAgent, error };
  }

  return { type: 'valid', userAgent, error: undefined };
};
