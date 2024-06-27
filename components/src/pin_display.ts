import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";
import { REGISTRY as BUILTIN_REGISTRY } from "@nand2tetris/simulator/chip/builtins/index.js";

export class ChipDisplayInfo {
  signBehaviors: Map<string, boolean> = new Map();

  public constructor(chipName: string, unsigned?: string[]) {
    if (BUILTIN_REGISTRY.has(chipName)) {
      const chip = assertExists(BUILTIN_REGISTRY.get(chipName)?.());

      const pins = [...chip.ins.entries(), ...chip.outs.entries()];

      for (const pin of pins) {
        this.signBehaviors.set(
          pin.name,
          !unsigned || !unsigned.includes(pin.name),
        );
      }
    }
  }

  public isSigned(pin: string) {
    return this.signBehaviors.get(pin);
  }
}

const UNSIGNED_PINS = new Map<string, string[]>([
  ["Mux4Way16", ["sel"]],
  ["Mux8Way16", ["sel"]],
  ["DMux4Way", ["sel"]],
  ["DMux8Way", ["sel"]],
  ["RAM8", ["address"]],
  ["RAM64", ["address"]],
  ["RAM512", ["address"]],
  ["RAM4K", ["address"]],
  ["RAM16K", ["address"]],
  ["Screen", ["address"]],
  ["Memory", ["address"]],
  ["CPU", ["addressM", "pc"]],
]);

export const getDisplayInfo = (chipName: string) =>
  new ChipDisplayInfo(chipName, UNSIGNED_PINS.get(chipName));
