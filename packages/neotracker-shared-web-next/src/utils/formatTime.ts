import * as timeago from 'timeago.js';

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export const formatTime = (time: number) => {
  let value;
  const timeMS = time * 1000;
  // tslint:disable-next-line: prefer-conditional-expression
  if (Date.now() - timeMS > TWO_DAYS_MS) {
    value = new Date(timeMS).toLocaleString();
  } else {
    value = timeago.format(timeMS);
  }

  return value;
};
