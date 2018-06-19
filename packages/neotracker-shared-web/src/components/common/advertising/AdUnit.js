/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import type { AppOptions } from '../../../AppContext';

import { mapAppOptions } from '../../../utils';

type ExternalProps = {|
  getZoneID: (appOptions: AppOptions) => number | typeof undefined,
  className?: string,
|};
type InternalProps = {|
  appOptions: AppOptions,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
class AdUnit extends React.Component<Props, void> {
  componentDidMount(): void {
    const { getZoneID, appOptions } = this.props;
    const { adclerks: { id: adclerksID } = {} } = appOptions;
    const zoneID = getZoneID(appOptions);
    if (zoneID != null && adclerksID != null) {
      const randpubc = Math.floor(Math.random() * 100000 + 1);
      const pubc = document.createElement('script');
      pubc.type = 'text/javascript';
      pubc.async = true;
      pubc.src = `//cdn.adclerks.com/core/ad2/${adclerksID}/${zoneID}?r=${randpubc}`;
      if (document.body != null) {
        document.body.appendChild(pubc);
      }
    }
  }

  render(): ?React.Element<*> {
    const { className, getZoneID, appOptions } = this.props;
    const zoneID = getZoneID(appOptions);
    return zoneID == null ? null : (
      <div className={className} id={`pubclerks_${zoneID}`} />
    );
  }
}

const enhance: HOC<*, *> = compose(
  mapAppOptions,
  pure,
);

export default (enhance(AdUnit): React.ComponentType<ExternalProps>);
