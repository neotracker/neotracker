/* @flow */
import { compose, getContext, mapPropsStream } from 'recompose';
import { map, switchMap } from 'rxjs/operators';

export default compose(
  getContext<*, *>({ appContext: () => null }),
  mapPropsStream((props$) =>
    props$.pipe(
      switchMap((props) =>
        props.appContext.options$.pipe(
          map((appOptions) => ({
            ...props,
            appOptions,
          })),
        ),
      ),
    ),
  ),
);
