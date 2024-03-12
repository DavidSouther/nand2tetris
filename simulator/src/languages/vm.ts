/** Reads tst files to apply and perform test runs. */

import ohm from "ohm-js";
import { Span, baseSemantics, grammars, makeParser, span } from "./base.js";

import vmGrammar from "./grammars/vm.ohm.js";
export const grammar = ohm.grammar(vmGrammar, grammars);
export const vmSemantics = grammar.extendSemantics(baseSemantics);

export interface Vm {
  instructions: VmInstruction[];
}

export type Segment =
  | "argument"
  | "local"
  | "static"
  | "constant"
  | "this"
  | "that"
  | "pointer"
  | "temp";

export type VmInstruction =
  | StackInstruction
  | OpInstruction
  | FunctionInstruction
  | CallInstruction
  | ReturnInstruction
  | GotoInstruction
  | LabelInstruction;

export interface StackInstruction {
  op: "push" | "pop";
  segment: Segment;
  offset: number;
  span?: Span;
}
export interface OpInstruction {
  op: "add" | "sub" | "neg" | "lt" | "gt" | "eq" | "and" | "or" | "not";
  span?: Span;
}
export interface FunctionInstruction {
  op: "function";
  name: string;
  nVars: number;
  span?: Span;
}
export interface CallInstruction {
  op: "call";
  name: string;
  nArgs: number;
  span?: Span;
}
export interface ReturnInstruction {
  op: "return";
  span?: Span;
}
export interface LabelInstruction {
  op: "label";
  label: string;
  span?: Span;
}
export interface GotoInstruction {
  op: "goto" | "if-goto";
  label: string;
  span?: Span;
}

vmSemantics.addAttribute<
  | "push"
  | "pop"
  | "function"
  | "call"
  | "return"
  | "goto"
  | "if-goto"
  | "label"
  | "add"
  | "sub"
  | "neg"
  | "lt"
  | "gt"
  | "eq"
  | "and"
  | "or"
  | "not"
>("op", {
  Push(_) {
    return "push";
  },
  Pop(_) {
    return "pop";
  },
  Function(_) {
    return "function";
  },
  Call(_) {
    return "call";
  },
  Return(_) {
    return "return";
  },
  Goto(_) {
    return "goto";
  },
  IfGoto(_) {
    return "if-goto";
  },
  Label(_) {
    return "label";
  },
  Add(_) {
    return "add";
  },
  Sub(_) {
    return "sub";
  },
  Neg(_) {
    return "neg";
  },
  Eq(_) {
    return "eq";
  },
  Lt(_) {
    return "lt";
  },
  Gt(_) {
    return "gt";
  },
  And(_) {
    return "and";
  },
  Or(_) {
    return "or";
  },
  Not(_) {
    return "not";
  },
});

vmSemantics.addAttribute<
  | "argument"
  | "local"
  | "static"
  | "constant"
  | "this"
  | "that"
  | "pointer"
  | "temp"
>("segment", {
  Argument(_) {
    return "argument";
  },
  Local(_) {
    return "local";
  },
  Static(_) {
    return "static";
  },
  Constant(_) {
    return "constant";
  },
  This(_) {
    return "this";
  },
  That(_) {
    return "that";
  },
  Pointer(_) {
    return "pointer";
  },
  Temp(_) {
    return "temp";
  },
});

vmSemantics.addAttribute<VmInstruction>("instruction", {
  StackInstruction({ op }, { segment }, value) {
    return {
      op: op as "push" | "pop",
      segment,
      offset: Number(value.sourceString),
      span: span(this.source),
    };
  },
  OpInstruction({ op }) {
    return {
      op: op as
        | "add"
        | "sub"
        | "neg"
        | "lt"
        | "gt"
        | "eq"
        | "and"
        | "or"
        | "not",
      span: span(this.source),
    };
  },
  FunctionInstruction(_, { name }, nVars) {
    return {
      op: "function",
      name,
      nVars: Number(nVars.sourceString),
      span: span(this.source),
    };
  },
  CallInstruction(_, { name }, nArgs) {
    return {
      op: "call",
      name,
      nArgs: Number(nArgs.sourceString),
      span: span(this.source),
    };
  },
  ReturnInstruction(_) {
    return { op: "return", span: span(this.source) };
  },
  // LabelInstruction = Label Name
  LabelInstruction(_, { name: label }) {
    return { op: "label", label, span: span(this.source) };
  },
  // GotoInstruction = (Goto | IfGoto) Name
  GotoInstruction({ op }, { name: label }) {
    return {
      op: op as "goto" | "if-goto",
      label,
      span: span(this.source),
    };
  },
});

vmSemantics.addAttribute<Vm>("vm", {
  Vm(lines) {
    return {
      instructions: lines.children.map((n) => n.instruction),
    };
  },
});

vmSemantics.addAttribute<Vm>("root", {
  Root({ vm }) {
    return vm;
  },
});

export const VM = {
  grammar: vmGrammar,
  semantics: vmSemantics,
  parser: grammar,
  parse: makeParser<Vm>(grammar, vmSemantics),
};
