/* @flow */
// $FlowFixMe
import { NEO_ASSET_HASH, GAS_ASSET_HASH } from '@neotracker/shared-utils';
import locale2 from 'locale2';

import { getBest } from '../../../../utils';

const NAME_MAP = {
  [NEO_ASSET_HASH]: 'NEO',
  [GAS_ASSET_HASH]: 'GAS',
};

const getName = (name, lang) => {
  const nameObj = name.find((n) => n.lang === lang);
  return nameObj == null ? null : nameObj.name;
};

type NameLangs = $ReadOnlyArray<{ +name: string, +lang: string }>;

const parseSymbol = (symbol: string): NameLangs | string => {
  try {
    return JSON.parse(symbol);
  } catch (error) {
    return symbol;
  }
};

// TODO: INTL
export default (symbol: NameLangs | string, hash: string) => {
  let name = symbol;
  if (typeof name === 'string') {
    name = parseSymbol(name);
  }
  let finalName = NAME_MAP[hash];
  if (finalName == null && typeof name === 'string') {
    finalName = name;
  } else if (finalName == null && typeof name !== 'string') {
    const langs = name.map((n) => n.lang);
    const lang = getBest(langs, locale2);

    if (lang == null) {
      const enLang = getBest(langs, 'en');
      if (enLang != null) {
        finalName = getName(name, enLang);
      }
    } else {
      finalName = getName(name, lang);
    }

    if (finalName == null) {
      if (name.length > 0) {
        finalName = name[0].name;
      } else {
        finalName = hash;
      }
    }
  }

  return finalName;
};
