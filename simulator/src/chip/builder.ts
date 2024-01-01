import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import {
  Err,
  isErr,
  isOk,
  Ok,
  Result,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { HDL, HdlParse } from "../languages/hdl.js";
import { getBuiltinChip, hasBuiltinChip } from "./builtins/index.js";
import { Chip, Connection } from "./chip.js";

const UNKNOWN_HDL_ERROR = `HDL statement has a syntax error`;

function pinWidth(start: number, end: number | undefined): number | undefined {
  if (end === undefined) {
    return undefined;
  }
  if (end >= start) {
    return end - start + 1;
  }
  if (start > 0 && end === 0) {
    return 1;
  }
  throw new Error(`Bus specification has start > end (${start} > ${end})`);
}

export interface CompilationError {
  message: string;
}

export async function parse(
  code: string
): Promise<Result<Chip, CompilationError>> {
  const parsed = HDL.parse(code.toString());
  if (isErr(parsed)) {
    return Err({
      message: Err(parsed).message ?? UNKNOWN_HDL_ERROR,
    });
  }
  return build(Ok(parsed));
}

export async function loadChip(
  name: string,
  fs?: FileSystem
): Promise<Result<Chip, CompilationError>> {
  if (hasBuiltinChip(name) || fs === undefined) {
    return getBuiltinChip(name);
  }
  try {
    const file = await fs.readFile(`${name}.hdl`);
    const maybeParsedHDL = HDL.parse(file);
    const chip = isOk(maybeParsedHDL)
      ? build(Ok(maybeParsedHDL), fs)
      : Err(new Error("HDL Was not parsed"));
    return chip;
  } catch (e) {
    return Err(new Error(`Could not load chip ${name}.hdl` /*, { cause: e }*/));
  }
}

function isConstant(pinName: string): boolean {
  return (
    pinName.toLowerCase() === "false" ||
    pinName.toLowerCase() === "true" ||
    pinName === "0" ||
    pinName === "1"
  );
}

export async function build(
  parts: HdlParse,
  fs?: FileSystem
): Promise<Result<Chip, CompilationError>> {
  if (parts.parts === "BUILTIN") {
    return getBuiltinChip(parts.name.toString());
  }

  const buildChip = new Chip(
    parts.ins.map(({ pin, width }) => ({ pin: pin.toString(), width })),
    parts.outs.map(({ pin, width }) => ({ pin: pin.toString(), width })),
    parts.name.toString(),
    [],
    parts.clocked
  );

  const internalPins: Map<string, boolean> = new Map();

  for (const part of parts.parts) {
    const builtin = await loadChip(part.name.toString(), fs);
    if (isErr(builtin)) {
      return Err({ message: UNKNOWN_HDL_ERROR });
    }
    const partChip = Ok(builtin);

    const wires: Connection[] = [];
    for (const { lhs, rhs } of part.wires) {
      if (
        !(
          buildChip.isInPin(rhs.pin.toString()) ||
          buildChip.isOutPin(rhs.pin.toString()) ||
          isConstant(rhs.pin.toString())
        )
      ) {
        if (partChip.isInPin(lhs.pin.toString())) {
          // internal pin is being used
          if (!internalPins.has(rhs.pin.toString())) {
            internalPins.set(rhs.pin.toString(), false);
          }
        } else if (partChip.isOutPin(lhs.pin.toString())) {
          // internal pin is being defined
          internalPins.set(rhs.pin.toString(), true);
        }
      }
      wires.push({
        to: {
          name: lhs.pin.toString(),
          start: lhs.start ?? 0,
          width: pinWidth(lhs.start ?? 0, lhs.end),
        },
        from: {
          name: rhs.pin.toString(),
          start: rhs.start ?? 0,
          width: pinWidth(rhs.start ?? 0, rhs.end),
        },
      });
    }

    try {
      buildChip.wire(partChip, wires);
    } catch (e) {
      return Err(e as Error);
    }
  }

  for (const [name, isDefined] of internalPins) {
    if (!isDefined) {
      return Err({ message: `Undefined internal pin name: ${name}` });
    }
  }

  return Ok(buildChip);
}
