/* @flow */
import parser from 'ua-parser-js';

export default (ua: string) => {
  let userAgent = {
    ua,
    browser: {
      name: '',
      version: '',
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

  let error = null;
  try {
    userAgent = parser(ua);
  } catch (err) {
    error = err;
  }

  if (error != null) {
    return { type: 'error', userAgent, error };
  }

  return { type: 'valid', userAgent, error: undefined };
};
