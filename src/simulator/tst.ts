import { checkExhaustive } from "@davidsouther/jiffies/lib/esm/assert";
import {
  Tst,
  TstLineStatement,
  TstOperation,
  TstOutputSpec,
  TstStatement,
} from "../languages/tst";
import { Bus, Chip, HIGH, Low, LOW } from "./chip/chip";
import { Clock } from "./chip/clock";
import { Output } from "./output";

export abstract class Test<IS extends TestInstruction = TestInstruction> {
  protected readonly instructions: (IS | TestInstruction)[] = [];
  protected _outputList: Output[] = [];
  protected _log: string = "";

  load(filename: string): void {}
  compareTo(filename: string): void {}
  outputFile(filename: string): void {}
  outputList(outputs: Output[]): void {
    this._outputList = outputs;
  }

  addInstruction(instruction: IS | TestInstruction) {
    this.instructions.push(instruction);
  }

  run() {
    for (const instruction of this.instructions) {
      instruction.do(this);
    }
  }

  echo(content: string) {}

  clearEcho() {}

  protected readonly breakpoints: Map<string, number> = new Map();
  addBreakpoint(variable: string, value: number) {
    this.breakpoints.set(variable, value);
  }
  clearBreakpoints() {
    this.breakpoints.clear();
  }

  output() {
    const values = this._outputList.map((output) => output.print(this));
    this._log += `|${values.join("|")}|\n`;
  }

  header() {
    const values = this._outputList.map((output) => output.header(this));
    this._log += `|${values.join("|")}|\n`;
  }

  log() {
    return this._log;
  }

  abstract hasVar(variable: string | number): boolean;
  abstract getVar(variable: string | number): number | string;
  abstract setVar(variable: string, value: number): void;
}

function isTstLineStatment(line: TstStatement): line is TstLineStatement {
  return (line as TstLineStatement).ops !== undefined;
}

export class ChipTest extends Test<ChipTestInstruction> {
  private chip = new Low();
  private clock = Clock.get();

  static from(tst: Tst): ChipTest {
    const test = new ChipTest();

    for (const line of tst.lines) {
      if (isTstLineStatment(line)) {
        test.addInstruction(ChipTest.makeLineStatement(line));
      } else {
        const repeat = new TestRepeatInstruction(line.count);
        test.addInstruction(repeat);
        for (const statement of line.statements) {
          repeat.addInstruction(ChipTest.makeLineStatement(statement));
        }
      }
    }

    return test;
  }

  private static makeLineStatement(line: TstLineStatement) {
    const statement = new TestCompoundInstruction();
    for (const op of line.ops) {
      statement.addInstruction(ChipTest.makeInstruction(op));
    }
    return statement;
  }

  private static makeInstruction(inst: TstOperation) {
    const { op } = inst;
    switch (op) {
      case "tick":
        return new TestTickInstruction();
      case "tock":
        return new TestTockInstruction();
      case "eval":
        return new TestEvalInstruction();
      case "output":
        return new TestOutputInstruction();
      case "set":
        return new TestSetInstruction(inst.id, inst.value, inst.index);
      case "output-list":
        return new TestOutputListInstruction(inst.spec);
      case "echo":
        return new TestEchoInstruction(inst.message);
      case "clear-echo":
        return new TestClearEchoInstruction();
      default:
        checkExhaustive(op, `Unknown tst operation ${op}`);
    }
  }

  with(chip: Chip): this {
    this.chip = chip;
    return this;
  }

  hasVar(variable: string | number): boolean {
    if (variable === "time") {
      return true;
    }
    variable = `${variable}`;
    // Look up built-in chip state variables
    return (
      this.chip.in(variable) !== undefined ||
      this.chip.out(variable) !== undefined
    );
  }

  getVar(variable: string | number): number | string {
    variable = `${variable}`;
    if (variable === "time") {
      return this.clock.toString();
    }
    const pin = this.chip.get(variable);
    if (!pin) return 0;
    return pin instanceof Bus ? pin.busVoltage : pin.voltage();
  }

  setVar(variable: string, value: number): void {
    // Look up built-in chip state variables
    const pinOrBus = this.chip.get(`${variable}`);
    if (pinOrBus instanceof Bus) {
      pinOrBus.busVoltage = value;
    } else {
      pinOrBus?.pull(value === 0 ? LOW : HIGH);
    }
  }

  eval(): void {
    this.chip.eval();
  }

  tick(): void {
    this.chip.eval();
    this.clock.tick();
  }

  tock(): void {
    this.chip.eval();
    this.clock.tock();
  }

  override run(): void {
    this.clock.reset();
    super.run();
  }
}

export class CPUTest extends Test<CPUTestInstruction> {
  hasVar(_variable: string | number): boolean {
    return false;
  }
  getVar(_variable: string | number): number {
    return 0;
  }
  setVar(_variable: string, _value: number): void {}
  ticktock(): void {}
}

export class VMTest extends Test<VMTestInstruction> {
  hasVar(_variable: string | number): boolean {
    return false;
  }
  getVar(_variable: string | number): number {
    return 0;
  }
  setVar(_variable: string, _value: number): void {}
  vmstep(): void {}
}

export interface TestInstruction {
  do(test: Test): void;
}

export class TestSetInstruction implements TestInstruction {
  constructor(
    private variable: string,
    private value: number,
    private index?: number | undefined
  ) {}
  do(test: Test): void {
    let variable = this.variable;
    if (this.index !== undefined) {
      variable += `[${this.index}]`;
    }
    test.setVar(variable, this.value);
  }
}

export class TestOutputInstruction implements TestInstruction {
  do(test: Test): void {
    test.output();
  }
}

export class TestOutputListInstruction implements TestInstruction {
  private outputs: Output[] = [];

  constructor(specs: TstOutputSpec[] = []) {
    for (const spec of specs) {
      this.addOutput(spec);
    }
  }

  addOutput(inst: TstOutputSpec) {
    this.outputs.push(
      new Output(
        inst.id,
        inst.style,
        inst.width,
        inst.lpad,
        inst.rpad,
        inst.builtin,
        inst.address
      )
    );
  }

  do(test: Test): void {
    test.outputList(this.outputs);
    test.header();
  }
}

export class TestCompoundInstruction implements TestInstruction {
  protected readonly instructions: TestInstruction[] = [];

  addInstruction(instruction: TestInstruction) {
    this.instructions.push(instruction);
  }

  do(test: Test): void {
    for (const instruction of this.instructions) {
      instruction.do(test);
    }
  }
}

export class TestRepeatInstruction extends TestCompoundInstruction {
  constructor(public readonly repeat: number) {
    super();
  }

  override do(test: Test): void {
    for (let i = 0; i < this.repeat; i++) {
      super.do(test);
    }
  }
}

export class Condition {
  constructor(
    public readonly x: string | number,
    public readonly y: string | number,
    public readonly op: "<" | "<=" | "=" | ">=" | ">" | "<>"
  ) {}

  check(test: Test): boolean {
    const x = test.hasVar(this.x) ? test.getVar(this.x) : this.x;
    const y = test.hasVar(this.y) ? test.getVar(this.y) : this.y;

    if (typeof x === "string" || typeof y === "string") {
      switch (this.op) {
        case "=":
          return `${x}` === `${y}`;
        case "<>":
          return `${x}` !== `${y}`;
      }
    } else {
      switch (this.op) {
        case "<":
          return x < y;
        case "<=":
          return x <= y;
        case ">":
          return x > y;
        case ">=":
          return x >= y;
        case "=":
          return x === y;
        case "<>":
          return x !== y;
      }
    }
    return false;
  }
}

export class TestWhileInstruction extends TestCompoundInstruction {
  constructor(public readonly condition: Condition) {
    super();
  }

  override do(test: Test): void {
    while (this.condition.check(test)) {
      for (const instruction of this.instructions) {
        instruction.do(test);
      }
    }
  }
}

export class TestEchoInstruction implements TestInstruction {
  constructor(public readonly content: string) {}
  do(test: Test) {
    test.echo(this.content);
  }
}

export class TestClearEchoInstruction implements TestInstruction {
  do(test: Test) {
    test.clearEcho();
  }
}

export class TestBreakpointInstruction implements TestInstruction {
  constructor(
    public readonly variable: string,
    public readonly value: number
  ) {}

  do(test: Test) {
    test.addBreakpoint(this.variable, this.value);
  }
}

export class TestClearBreakpointsInstruction implements TestInstruction {
  do(test: Test) {
    test.clearBreakpoints();
  }
}

export interface ChipTestInstruction extends TestInstruction {
  _chipTestInstruction_: true;
  do(test: ChipTest): void;
}

export class TestEvalInstruction implements ChipTestInstruction {
  readonly _chipTestInstruction_ = true;
  do(test: ChipTest): void {
    test.eval();
  }
}

export class TestTickInstruction implements ChipTestInstruction {
  readonly _chipTestInstruction_ = true;
  do(test: ChipTest): void {
    test.tick();
  }
}

export class TestTockInstruction implements ChipTestInstruction {
  readonly _chipTestInstruction_ = true;
  do(test: ChipTest): void {
    test.tock();
  }
}

export interface CPUTestInstruction extends TestInstruction {
  _cpuTestInstruction_: true;
  do(test: CPUTest): void;
}

export class TestTickTockInstruction implements CPUTestInstruction {
  readonly _cpuTestInstruction_ = true;
  do(test: CPUTest) {
    test.ticktock();
  }
}

export interface VMTestInstruction extends TestInstruction {
  _vmTestInstruction_: true;
  do(test: VMTest): void;
}

export class TestVMStepInstruction implements VMTestInstruction {
  readonly _vmTestInstruction_ = true;
  do(test: VMTest) {
    test.vmstep();
  }
}
