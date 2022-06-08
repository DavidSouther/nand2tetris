import { assert } from "@davidsouther/jiffies/assert.js";
import { isErr, Ok } from "@davidsouther/jiffies/result.js";
import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import { HdlParser, Part, PinParts, TEST_ONLY } from "./hdl.js";
import { IResult, Span, StringLike } from "./parser/base.js";
import { tag } from "./parser/bytes.js";
import { list } from "./parser/recipe.js";

const AND_BUILTIN = `CHIP And {
    IN a, b;
    OUT out;
    BUILTIN;
}`;

const NOT_PARTS = `CHIP Not {
    IN in;
    OUT out;
    PARTS:
    Nand(a=in, b=in, out=out);
}`;

const NOT_NO_PARTS = `CHIP Not {
    IN in;
    OUT out;
    PARTS:
}`;

const AND_16_BUILTIN = `CHIP And16 {
  IN a[16], b[16];
  OUT out[16];
  BUILTIN;
}`;

describe("hdl language", () => {
  it("parses comments", () => {
    let parsed: IResult<StringLike>;
    parsed = TEST_ONLY.hdlIdentifier("a // comment");
    expect(parsed).toEqual(Ok(["", "a"]));

    parsed = TEST_ONLY.hdlIdentifier(`/* multi
    line */ a // more`);
    expect(parsed).toEqual(Ok(["", "a"]));
  });

  it("parses pin wiring", () => {
    let parsed: IResult<[PinParts, StringLike]>;

    parsed = TEST_ONLY.wire("a=a");
    expect(parsed).toEqual(Ok(["", [{ pin: "a", start: 0, end: 0 }, "a"]]));

    parsed = TEST_ONLY.wire("b = /* to */ a // things");
    expect(parsed).toEqual(Ok(["", [{ pin: "b", start: 0, end: 0 }, "a"]]));

    // parsed = TEST_ONLY.wire("b = 0");
    // expect(parsed).toEqual(Ok(["", [{ pin: "b", start: 0, end: 0 }, "0"]]));

    parsed = TEST_ONLY.wire("b = False");
    expect(parsed).toEqual(Ok(["", [{ pin: "b", start: 0, end: 0 }, "False"]]));

    parsed = TEST_ONLY.wire("b = True");
    expect(parsed).toEqual(Ok(["", [{ pin: "b", start: 0, end: 0 }, "True"]]));

    // parsed = TEST_ONLY.wire("b = Foo");
    // expect(isErr(parsed)).toBe(true);
  });

  it("parses a list of pins", () => {
    let parsed: IResult<[PinParts, StringLike][]>;
    let parser = list(TEST_ONLY.wire, tag(","));

    parsed = parser("a=a , b=b");
    expect(parsed).toEqual(
      Ok([
        "",
        [
          [{ pin: "a", start: 0, end: 0 }, "a"],
          [{ pin: "b", start: 0, end: 0 }, "b"],
        ],
      ])
    );
  });

  it("parses bus pins", () => {
    let parsed: IResult<[PinParts, StringLike]>;
    let parser = TEST_ONLY.wire;

    parsed = parser("a[2..4]=b");

    expect(parsed).toEqual(Ok(["", [{ pin: "a", start: 2, end: 4 }, "b"]]));
  });

  it("parses a part", () => {
    let parsed: IResult<Part>;

    parsed = TEST_ONLY.part("Nand(a=a, b=b, out=out)");
    expect(parsed).toEqual(
      Ok([
        "",
        {
          name: "Nand",
          wires: [
            { lhs: { pin: "a", start: 0, end: 0 }, rhs: "a" },
            { lhs: { pin: "b", start: 0, end: 0 }, rhs: "b" },
            { lhs: { pin: "out", start: 0, end: 0 }, rhs: "out" },
          ],
        },
      ])
    );
  });

  it("parses a list of parts", () => {
    let parsed: IResult<"BUILTIN" | Part[]>;

    parsed = TEST_ONLY.parts(`PARTS: Not(a=a, o=o); And(b=b, c=c, i=i);`);
    expect(parsed).toEqual(
      Ok([
        "",
        [
          {
            name: "Not",
            wires: [
              { lhs: { pin: "a", start: 0, end: 0 }, rhs: "a" },
              { lhs: { pin: "o", start: 0, end: 0 }, rhs: "o" },
            ],
          },
          {
            name: "And",
            wires: [
              { lhs: { pin: "b", start: 0, end: 0 }, rhs: "b" },
              { lhs: { pin: "c", start: 0, end: 0 }, rhs: "c" },
              { lhs: { pin: "i", start: 0, end: 0 }, rhs: "i" },
            ],
          },
        ],
      ])
    );

    parsed = TEST_ONLY.parts(`BUILTIN;`);
    expect(parsed).toEqual(Ok(["", "BUILTIN"]));
  });

  it("parses IN list", () => {
    let parsed: IResult<PinParts[]>;

    parsed = TEST_ONLY.inList(`IN a, b;`);
    expect(parsed).toEqual(
      Ok([
        "",
        [
          { pin: "a", start: 0, end: 0 },
          { pin: "b", start: 0, end: 0 },
        ],
      ])
    );
  });

  it("parses OUT list", () => {
    let parsed: IResult<PinParts[]>;

    parsed = TEST_ONLY.outList(`OUT out;`);
    expect(parsed).toEqual(Ok(["", [{ pin: "out", start: 0, end: 0 }]]));
  });

  it("parses a file into a builtin", () => {
    const parsed = HdlParser(AND_BUILTIN);

    expect(parsed).toEqual(
      Ok([
        "",
        {
          name: "And",
          ins: [
            { pin: "a", start: 0, end: 0 },
            { pin: "b", start: 0, end: 0 },
          ],
          outs: [{ pin: "out", start: 0, end: 0 }],
          parts: "BUILTIN",
        },
      ])
    );
  });

  it("parses a file with parts", () => {
    const parsed = HdlParser(NOT_PARTS);
    expect(parsed).toEqual(
      Ok([
        "",
        {
          name: "Not",
          ins: [{ pin: "in", start: 0, end: 0 }],
          outs: [{ pin: "out", start: 0, end: 0 }],
          parts: [
            {
              name: "Nand",
              wires: [
                { lhs: { pin: "a", start: 0, end: 0 }, rhs: "in" },
                { lhs: { pin: "b", start: 0, end: 0 }, rhs: "in" },
                { lhs: { pin: "out", start: 0, end: 0 }, rhs: "out" },
              ],
            },
          ],
        },
      ])
    );
  });

  it("parses a file without parts", () => {
    const parsed = HdlParser(NOT_NO_PARTS);
    expect(parsed).toEqual(
      Ok([
        "",
        {
          name: "Not",
          ins: [{ pin: "in", start: 0, end: 0 }],
          outs: [{ pin: "out", start: 0, end: 0 }],
          parts: [],
        },
      ])
    );
  });

  it("Parses a file with 16-bit pins", () => {
    const parsed = HdlParser(AND_16_BUILTIN);

    expect(parsed).toEqual(
      Ok([
        "",
        {
          name: "And16",
          ins: [
            { pin: "a", start: 16, end: 0 },
            { pin: "b", start: 16, end: 0 },
          ],
          outs: [{ pin: "out", start: 16, end: 0 }],
          parts: "BUILTIN",
        },
      ])
    );
  });

  describe("errors", () => {
    it("handles errors", () => {
      const parsed = HdlParser(new Span(`Chip And PARTS:`));
      assert(isErr(parsed));
    });
  });
});
