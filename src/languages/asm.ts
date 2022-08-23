import { assertExists } from "@davidsouther/jiffies/lib/esm/assert";
import ohm from "ohm-js";
import raw from "raw.macro";
import {
  ASSIGN,
  ASSIGN_ASM,
  ASSIGN_OP,
  COMMANDS,
  COMMANDS_ASM,
  COMMANDS_OP,
  JUMP,
  JUMP_ASM,
  JUMP_OP,
} from "../simulator/cpu/alu";
import { KEYBOARD, SCREEN } from "../simulator/cpu/memory";
import { makeC } from "../util/asm";
import { grammars, makeParser, baseSemantics } from "./base";

export const asmGrammar = raw("./grammars/asm.ohm");
export const grammar = ohm.grammar(asmGrammar, grammars);
export const asmSemantics = grammar.extendSemantics(baseSemantics);

// reload ...

export interface Asm {
  instructions: AsmInstruction[];
}

export type AsmInstruction =
  | AsmAInstruction
  | AsmCInstruction
  | AsmLabelInstruction;

export type AsmAInstruction = AsmALabelInstruction | AsmAValueInstruction;
export interface AsmALabelInstruction {
  type: "A";
  label: string;
}

export interface AsmAValueInstruction {
  type: "A";
  value: number;
}

function isALabelInstruction(
  inst: AsmAInstruction
): inst is AsmALabelInstruction {
  return (inst as AsmALabelInstruction).label !== undefined;
}

export interface AsmCInstruction {
  type: "C";
  op: COMMANDS_OP;
  isM: boolean;
  store?: ASSIGN_OP;
  jump?: JUMP_OP;
}

export interface AsmLabelInstruction {
  type: "L";
  label: string;
}

asmSemantics.addAttribute<Asm>("asm", {
  Root(asm) {
    return {
      instructions: asm
        .child(0)
        .children.map(({ instruction }) => instruction as AsmInstruction),
    };
  },
});

asmSemantics.addAttribute<AsmInstruction>("instruction", {
  AInstruction(_at, val): AsmAInstruction {
    try {
      return {
        type: "A",
        value: val.value,
      };
    } catch (e) {}
    try {
      return {
        type: "A",
        label: val.name,
      };
    } catch (e) {}

    throw new Error(`AsmAInstruction must have either a name or a value`);
  },
  CInstruction(assignN, opN, jmpN): AsmCInstruction {
    const assign = assignN.child(0)?.child(0)?.sourceString as ASSIGN_ASM;
    const op = opN.sourceString as COMMANDS_ASM;
    const jmp = jmpN.child(0)?.child(1)?.sourceString as JUMP_ASM;
    const isM =
      assignN.sourceString.includes("M") || opN.sourceString.includes("M");
    const inst: AsmCInstruction = {
      type: "C",
      op: COMMANDS.asm[op],
      isM,
    };
    if (jmp) inst.jump = JUMP.asm[jmp];
    if (assign) inst.store = ASSIGN.asm[assign];
    return inst;
  },
  Label(_o, { name }, _c): AsmLabelInstruction {
    return {
      type: "L",
      label: name,
    };
  },
});

export function fillLabel(asm: Asm) {
  const symbols = new Map<string, number>([
    ["R0", 0],
    ["R1", 1],
    ["R2", 2],
    ["R3", 3],
    ["R4", 4],
    ["R5", 5],
    ["R6", 6],
    ["R7", 7],
    ["R8", 8],
    ["R9", 9],
    ["R10", 10],
    ["R11", 11],
    ["R12", 12],
    ["R13", 13],
    ["R14", 14],
    ["R15", 15],
    ["SP", 0],
    ["LCL", 1],
    ["ARG", 2],
    ["THIS", 3],
    ["THAT", 4],
    ["SCREEN", SCREEN],
    ["KBD", KEYBOARD],
  ]);

  function transmuteAInstruction(instruction: AsmALabelInstruction) {
    const value = assertExists(symbols.get(instruction.label));
    (instruction as unknown as AsmAValueInstruction).value = value;
    delete (instruction as unknown as { label: undefined }).label;
  }

  let unfilled: AsmALabelInstruction[] = [];
  let line = 0;
  for (const instruction of asm.instructions) {
    if (instruction.type === "L") {
      if (symbols.has(instruction.label)) {
        throw new Error(`ASM Duplicate label ${instruction.label}`);
      } else {
        symbols.set(instruction.label, line);
      }
      continue;
    }

    line += 1;

    if (instruction.type === "A") {
      if (isALabelInstruction(instruction)) {
        unfilled.push(instruction);
      }
    }
  }

  unfilled.forEach(transmuteAInstruction);
}

export function emit(asm: Asm): number[] {
  return asm.instructions
    .map((inst) => {
      if (inst.type === "A") {
        if (isALabelInstruction(inst)) {
          throw new Error(`ASM Emitting unfilled A instruction`);
        }
        return inst.value;
      }
      if (inst.type === "C") {
        return makeC(inst.isM, inst.op, inst.store, inst.jump);
      }
      return undefined;
    })
    .filter((op): op is number => op !== undefined);
}

export const ASM = {
  grammar: asmGrammar,
  semantics: asmSemantics,
  parser: grammar,
  parse: makeParser<Asm>(grammar, asmSemantics),
  passes: {
    fillLabel,
    emit,
  },
};