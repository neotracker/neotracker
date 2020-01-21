// tslint:disable
import { labels } from './labels';

const getVersionPrecision = (version: string) => version.split('.').length;

const getChunk = (version: string, precision: number) => {
  const delta = precision - getVersionPrecision(version);

  // 2) "9" -> "9.0" (for precision = 2)
  const newVersion = version + new Array(delta + 1).join('.0');

  // 3) "9.0" -> ["000000000"", "000000009"]
  return newVersion
    .split('.')
    .map((chunk) => new Array(20 - chunk.length).join('0') + chunk)
    .reverse();
};

const compareVersions = (a: string, b: string) => {
  // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
  let precision = Math.max(getVersionPrecision(a), getVersionPrecision(b));
  const chunkA = getChunk(a, precision);
  const chunkB = getChunk(b, precision);
  // iterate in reverse order by reversed chunks array
  // eslint-disable-next-line
  while (--precision >= 0) {
    // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
    if (chunkA[precision] > chunkB[precision]) {
      return 1;
    } else if (chunkA[precision] < chunkB[precision]) {
      return -1;
    }
  }

  return 0;
};

// TODO: Test me
type Comparison = '>' | '>=' | '=' | '<=' | '<';
const checkVersion = (versionA: string, comparison: Comparison, versionB: string) => {
  const result = compareVersions(versionA, versionB);
  switch (comparison) {
    case '>':
      return result > 0;
    case '<':
      return result < 0;
    case '>=':
      return result >= 0;
    case '<=':
      return result <= 0;
    case '=':
      return result === 0;
    // Should never hit this case
    default:
      return false;
  }
};

const convertLabels = (uaIn: IUAParser.IResult): Record<string, string | undefined> => ({
  [labels.UA]: uaIn.ua,
  [labels.UA_BROWSER_NAME]: uaIn.browser.name,
  [labels.UA_BROWSER_VERSION]: uaIn.browser.version,
  [labels.UA_DEVICE_MODEL]: uaIn.device.model,
  [labels.UA_DEVICE_TYPE]: uaIn.device.type,
  [labels.UA_DEVICE_VENDOR]: uaIn.device.vendor,
  [labels.UA_ENGINE_NAME]: uaIn.engine.name,
  [labels.UA_ENGINE_VERSION]: uaIn.engine.version,
  [labels.UA_OS_NAME]: uaIn.os.name,
  [labels.UA_OS_VERSION]: uaIn.os.version,
  [labels.UA_CPU_ARCHITECTURE]: uaIn.cpu.architecture,
});

export const ua = {
  checkVersion,
  convertLabels,
};
