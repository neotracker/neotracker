import * as appRootDir from 'app-root-dir';
import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import { parse, print } from 'graphql';
import * as path from 'path';

class QueryPersistor {
  public constructor(private readonly outputPath: string) {
    fs.ensureDirSync(this.outputPath);
  }

  public readonly persistQuery = (textIn: string): string => {
    const text = print(parse(textIn));
    const sha256 = crypto.createHash('sha256');
    const queryID = sha256.update(JSON.stringify(text)).digest('hex');
    this.writeOne(queryID, text);

    return queryID;
  };

  private writeOne(queryID: string, text: string): void {
    fs.writeFileSync(path.resolve(this.outputPath, `${queryID}.graphql`), text);
  }
}

const OUTPUT_PATH = path.resolve(
  appRootDir.get(),
  'packages',
  'neotracker-server-graphql',
  'src',
  '__generated__',
  'queries',
);

export const queryPersistor = new QueryPersistor(OUTPUT_PATH);
