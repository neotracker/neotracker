import ts from 'typescript';

interface ContextOptions {
  readonly program: ts.Program;
}
export class Context {
  private mutableProgram: ts.Program;
  private mutableChecker: ts.TypeChecker;

  public constructor({ program }: ContextOptions) {
    this.mutableProgram = program;
    this.mutableChecker = program.getTypeChecker();
  }

  public get program(): ts.Program {
    return this.mutableProgram;
  }

  public get checker(): ts.TypeChecker {
    return this.mutableChecker;
  }

  public updateProgram(program: ts.Program): void {
    this.mutableProgram = program;
    this.mutableChecker = program.getTypeChecker();
  }
}
