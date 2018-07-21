export interface QueuedSender {
  // tslint:disable-next-line no-any
  readonly send: (msg: any) => void;
}

const isWindows = /^win/.test(process.platform);
const logOnError = (error: Error) => {
  // tslint:disable-next-line no-console
  console.error(error);
};

// Wrapper around process.send() that will queue any messages if the internal node.js
// queue is filled with messages and only continue sending messages when the internal
// queue is free again to consume messages.
// On Windows we always wait for the send() method to return before sending the next message
// to workaround https://github.com/nodejs/node/issues/7657 (IPC can freeze process)
// tslint:disable-next-line no-any
export function createQueuedSender(childProcess: { readonly send: (msg: any, cb?: () => void) => void }): QueuedSender {
  if (isWindows) {
    // tslint:disable-next-line no-any
    const msgQueue: any[] = [];
    let isSending = false;

    const cb = (error: Error) => {
      logOnError(error);
      if (msgQueue.length > 0) {
        setImmediate(doSendLoop);
      } else {
        isSending = false;
      }
    };

    const doSendLoop = (): void => {
      // tslint:disable-next-line no-any no-array-mutation
      (childProcess.send as any)(msgQueue.shift(), cb);
    };

    // tslint:disable-next-line no-any
    const send = (msg: any): void => {
      // tslint:disable-next-line no-array-mutation
      msgQueue.push(msg); // add to the queue if the process cannot handle more messages
      if (isSending) {
        return;
      }

      isSending = true;
      doSendLoop();
    };

    return { send };
  }
  // tslint:disable-next-line no-any
  const linuxSend = (msg: any): void => {
    // tslint:disable-next-line no-any
    (childProcess.send as any)(msg, logOnError);
  };

  return { send: linuxSend };
}
