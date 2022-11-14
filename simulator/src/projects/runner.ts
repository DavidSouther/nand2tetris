import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import {
  isOk,
  Ok,
  Err,
  isErr,
  Result,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { Assignments, Assignment } from "@computron5k/projects/index.js";
import { Runner, RunResult } from "@computron5k/runner/index.js";
import { HDL, HdlParse } from "../languages/hdl.js";
import { Tst, TST } from "../languages/tst.js";
import { build as buildChip } from "../chip/builder.js";
import { ChipTest } from "../tst.js";
import { ParseError } from "../languages/base.js";
import { Chip } from "../chip/chip.js";

export interface AssignmentFiles extends Assignment {
  hdl: string;
  tst: string;
  cmp: string;
}

export interface AssignmentParse extends AssignmentFiles {
  maybeParsedHDL: Result<HdlParse, ParseError>;
  maybeParsedTST: Result<Tst, ParseError>;
}

export interface AssignmentBuild extends AssignmentParse {
  maybeChip: Result<Chip, Error>;
  maybeTest: Result<ChipTest, Error>;
}

export interface AssignmentRun extends AssignmentBuild {
  pass: boolean;
  out: string;
  shadow?: RunResult;
}

export const hasTest = ({
  name,
  ext,
}: {
  name: string;
  ext: string;
}): boolean =>
  Assignments[name as keyof typeof Assignments] !== undefined &&
  [".hdl", ".tst"].includes(ext);

/** Try parsing the loaded files. */
export const maybeParse = (file: AssignmentFiles): AssignmentParse => {
  const maybeParsedHDL = HDL.parse(file.hdl);
  const maybeParsedTST = TST.parse(file.tst);
  return { ...file, maybeParsedHDL, maybeParsedTST };
};

/** After parsing the assignment, compile the Chip and Tst. */
export const maybeBuild = (file: AssignmentParse): AssignmentBuild => {
  const maybeChip = isOk(file.maybeParsedHDL)
    ? buildChip(Ok(file.maybeParsedHDL))
    : Err(new Error("HDL Was not parsed"));
  const maybeTest = isOk(file.maybeParsedTST)
    ? Ok(ChipTest.from(Ok(file.maybeParsedTST)))
    : Err(new Error("TST Was not parsed"));
  return { ...file, maybeChip, maybeTest };
};

/** If the assignment parsed, run it! */
export const tryRun =
  (fs: FileSystem) =>
  async (assignment: AssignmentBuild): Promise<AssignmentRun> => {
    if (isErr(assignment.maybeChip)) {
      return {
        ...assignment,
        pass: false,
        out: Err(assignment.maybeChip).message,
      };
    }
    if (isErr(assignment.maybeTest)) {
      return {
        ...assignment,
        pass: false,
        out: Err(assignment.maybeTest).message,
      };
    }
    const test = Ok(assignment.maybeTest)
      .with(Ok(assignment.maybeChip))
      .setFileSystem(fs);
    await test.run();
    const out = test.log();
    const pass = out.trim() === assignment.cmp.trim();
    return { ...assignment, out, pass };
  };

/** Parse & execute a Nand2tetris assignment, possibly also including the Java output in shadow mode. */
export const runner = (fs: FileSystem, ideRunner?: Runner) => {
  const tryRunWithFs = tryRun(fs);
  return async (assignment: AssignmentFiles): Promise<AssignmentRun> => {
    const jsRunner = async () =>
      tryRunWithFs(await maybeBuild(await maybeParse(assignment)));
    const javaRunner = async () => ideRunner?.hdl(assignment);

    const [jsRun, shadow] = await Promise.all([jsRunner(), javaRunner()]);
    return { ...jsRun, shadow };
  };
};

/** Run all tests for a given Nand2Tetris project. */
export async function runTests(
  files: Array<Assignment>,
  loadAssignment: (file: Assignment) => Promise<AssignmentFiles>,
  fs: FileSystem,
  n2tInstallPath: string
): Promise<AssignmentRun[]> {
  const ideRunner = await Runner.try_init(n2tInstallPath);
  const run = runner(fs, ideRunner);
  return Promise.all(
    files.map(loadAssignment).map(async (assignment) => run(await assignment))
  );
}