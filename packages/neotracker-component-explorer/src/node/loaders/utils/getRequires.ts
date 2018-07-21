// Need to supply the regex test as a string for reuse in unit tests
// Currently, trying to change flags throws a TypeError
// Slated for change in ES6, but not possible now:
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/RegExp#Description
const IMPORT_ANYTHING_REGEX = /from\s+"([^"]+)";?|from\s+'([^']+)';?/g;

export const getRequires = (code: string): ReadonlyArray<string> => {
  const mutableRequires: string[] = [];

  code.replace(IMPORT_ANYTHING_REGEX, (_requireExprMatch, p1, p2) => {
    if (p1) {
      mutableRequires.push(p1);
    } else if (p2) {
      mutableRequires.push(p2);
    }

    return '';
  });

  return mutableRequires;
};
