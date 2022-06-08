import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import { Nand16 } from "./builtins/logic/nand.js";
import { And16 } from "./busses.js";
import { Chip, ConstantBus, SubBus, TRUE_BUS } from "./chip.js";

describe("bus logic", () => {
  it("nands 16-bit-wide", () => {
    const nand16 = new Nand16();
    nand16.in("a").busVoltage = 0xf00f;
    nand16.in("b").busVoltage = 0xf0f0;
    nand16.eval();
    expect(nand16.out().busVoltage).toBe(0x0fff);
  });
  it("ands 16-bit-wide busses", () => {
    const and16 = And16();
    and16.in("a").busVoltage = 0x1001;
    and16.in("b").busVoltage = 0x1010;
    and16.eval();
    expect(and16.out().busVoltage).toBe(0x1000);
  });
});
