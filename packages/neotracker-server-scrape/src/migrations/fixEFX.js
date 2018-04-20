/* @flow */
import type { Monitor } from '@neo-one/monitor';

import { type Context } from '../types';

import { fixIssued } from './common';

const EFX_HASH = 'acbc532904b6b51b5ea6d19b803d78af70e7e6f9';

export default (context: Context, monitor: Monitor, checkpoint: string) =>
  fixIssued(context, monitor, checkpoint, EFX_HASH);
