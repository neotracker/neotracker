// tslint:disable no-console no-default-import
import fetch from 'cross-fetch';
import _ from 'lodash';
// @ts-ignore
import cards from '../packages/neotracker-shared-web/src/components/ecosystem/main/cards';

interface Card {
  readonly title: string;
  readonly description: string;
  readonly link: string;
  readonly image: string;
  readonly cover: boolean;
}

type LinkMessage = string;
type Healthy = 0;
type LinkState = LinkMessage | Healthy;

const isMessage = (state: LinkState): state is LinkMessage => state !== 0;
const buildMessage = (url: string, reason: string) => `[BROKEN]: ${url} :: ${reason.toUpperCase()}`;

const handleResponse = (url: string, { status, statusText }: Response): LinkState => {
  if (status >= 400) {
    const reason = `Reason: Status ${status} - ${statusText}`;

    return buildMessage(url, reason);
  }

  return 0;
};

const handleError = (url: string, { message }: Error): LinkMessage => {
  const reason = message.split(', ')[1];

  return buildMessage(url, reason);
};

const fetchLinkState = async (url: string): Promise<LinkState> => {
  try {
    const res = await fetch(url);

    return handleResponse(url, res);
  } catch (err) {
    return handleError(url, err);
  }
};

const fetchStateFromCard: (card: Card) => Promise<LinkState> = _.flow(
  (c) => c.link,
  fetchLinkState,
);

const run = async (): Promise<readonly [string, number]> => {
  console.log(`Checking Ecosystem links...`);
  const linkStates = await Promise.all(_.map(cards, fetchStateFromCard));
  const messages = linkStates.filter(isMessage);

  if (messages.length > 0) {
    console.log(...messages);

    return ['Some links appeared broken', 1];
  }

  return ['Done', 0];
};

run()
  .then(([exitMessage, exitCode]) => {
    console.log(exitMessage);
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
