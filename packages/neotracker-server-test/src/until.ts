export const until = async (func: () => Promise<void>, timeoutMS = 60000) => {
  const start = Date.now();
  let finalError;
  // tslint:disable-next-line no-loop-statement
  while (Date.now() - start < timeoutMS) {
    try {
      await func();

      return;
    } catch (error) {
      finalError = error;
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw finalError;
};
