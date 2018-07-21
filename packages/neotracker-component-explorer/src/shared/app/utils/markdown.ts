// split markdown header
function splitHeader(content: string): { readonly header?: string; readonly content?: string } {
  // New line characters need to handle all operating systems.
  const lines = content.split(/\r?\n/);
  if (lines[0] !== '---') {
    return {};
  }
  let i = 1;
  // tslint:disable-next-line no-loop-statement
  for (; i < lines.length - 1; i += 1) {
    if (lines[i] === '---') {
      break;
    }
  }

  return {
    header: lines.slice(1, i + 1).join('\n'),
    content: lines.slice(i + 1).join('\n'),
  };
}

export interface Metadata {
  // tslint:disable-next-line no-any
  readonly [key: string]: any;
}

// tslint:disable-next-line export-name
export function extractMetadata(content: string): { readonly metadata: Metadata; readonly rawContent: string } {
  const mutableMetadata: Writable<Metadata> = {};
  const both = splitHeader(content);

  // if no content returned, then that means there was no header, and both.header is the content
  if (!both.content || !both.header) {
    if (!both.header) {
      // if no both returned, then that means there was no header and no content => we return the current content of the file
      return { metadata: mutableMetadata, rawContent: both.content === undefined ? content : both.content };
    }

    return { metadata: mutableMetadata, rawContent: both.header };
  }

  // New line characters => to handle all operating systems.
  const lines = both.header.split(/\r?\n/);

  // Loop that add to metadata the current content of the fields of the header
  // Like the format:
  // id:
  // title:
  // original_id:
  // tslint:disable-next-line no-loop-statement
  for (let i = 0; i < lines.length - 1; i += 1) {
    const keyvalue = lines[i].split(':');
    const key = keyvalue[0].trim();
    let value = keyvalue
      .slice(1)
      .join(':')
      .trim();
    try {
      value = JSON.parse(value);
    } catch {
      // Ignore the error as it means it's not a JSON value.
    }
    mutableMetadata[key] = value;
  }

  return { metadata: mutableMetadata, rawContent: both.content };
}
