import { display } from "@davidsouther/jiffies/display.js";
import { CLEAR } from "@davidsouther/jiffies/dom/dom.js";
import {
  article,
  button,
  div,
  fieldset,
  h2,
  header,
  main,
  section,
  span,
  style,
  textarea,
} from "@davidsouther/jiffies/dom/html.js";
import { Dropdown } from "@davidsouther/jiffies/dom/form/form.js";
import { compileFStyle, FStyle } from "@davidsouther/jiffies/dom/css/fstyle.js";
import { FileSystem } from "@davidsouther/jiffies/fs.js";
import { Subject } from "@davidsouther/jiffies/observable/observable.js";
import { retrieve } from "@davidsouther/jiffies/dom/provide.js";
import { Err, isErr, Ok, unwrap } from "@davidsouther/jiffies/result.js";
import { Pinout } from "../components/pinout.js";
import { Runbar } from "../components/runbar.js";
import { Low, LOW, Pin } from "../simulator/chip/chip.js";
import { Timer } from "../simulator/timer.js";
import { Chip as SimChip } from "../simulator/chip/chip.js";
import * as make from "../simulator/chip/builder.js";
import { getBuiltinChip } from "../simulator/chip/builtins/index.js";
import { Tst, tstParser } from "../languages/tst.js";
import { IResult } from "../languages/parser/base.js";
import { cmpParser } from "../languages/cmp.js";
import { ChipTest } from "../simulator/tst.js";
import { compare } from "../simulator/compare.js";
import { DiffPanel } from "../components/diff.js";
import { Clock } from "../simulator/chip/clock.js";

const PROJECTS: Record<"01" | "02" | "03", string[]> = {
  "01": [
    "Not",
    "And",
    "Or",
    "XOr",
    "Mux",
    "DMux",
    "Not16",
    "And16",
    "Or16",
    "Mux16",
    "Mux4way16",
    "Mux8way16",
    "DMux4way",
    "DMux8way",
    "Or8way",
  ],
  "02": ["HalfAdder", "FullAdder", "Add16", "Inc16", "AluNoStat", "ALU"],
  "03": ["Bit", "Register", "PC", "RAM8", "RAM64", "RAM512", "RAM4k", "RAM16k"],
};

function makeProjectDropdown(selected: "01" | "02", setProject: Function) {
  return Dropdown(
    {
      style: {
        display: "inline-block",
      },
      selected,
      events: {
        change: (event: Event) =>
          setProject((event.target as HTMLSelectElement)?.value),
      },
    },
    {
      "01": "Logic",
      "02": "Arithmetic",
      "03": "Memory",
      "04": "Assembly",
      "05": "Architecture",
    }
  );
}

function makeChipsDropdown(
  selected: string,
  chips: string[],
  setChip: Function
) {
  return Dropdown(
    {
      style: {
        display: "inline-block",
      },
      selected,
      events: {
        change: (event) => setChip((event.target as HTMLSelectElement)?.value),
      },
    },
    chips
  );
}

export const Chip = () => {
  const fs = unwrap(retrieve<FileSystem>("fs"));
  const statusLine = unwrap(retrieve<(s: string) => void>("status"));

  let project = localStorage["chip/project"] ?? "01";
  let chips: string[] = PROJECTS[project as "01" | "02"];
  let chipName = localStorage["chip/chip"] ?? "And";
  let maybeChip = getBuiltinChip(chipName);
  if (isErr(maybeChip)) statusLine(display(Err(maybeChip)));
  let chip: SimChip = isErr(maybeChip) ? new Low() : Ok(maybeChip);

  setTimeout(async function () {
    await setProject(project);
    await setChip(chip.name!);
  });

  const onToggle = (pin: Pin) => {
    if (pin.width == 1) {
      pin.toggle();
    } else {
      pin.busVoltage += 1;
    }
    chip.eval();
    setState();
  };

  const chipsDropdown = span();
  const projectDropdown = span();
  const inPinout = Pinout({
    pins: chip.ins,
    toggle: onToggle,
    clocked: chip.clocked,
  });
  const outPinout = Pinout({ pins: chip.outs });
  const pinsPinout = Pinout({ pins: chip.pins });
  const hdlTextarea = textarea({ class: "font-monospace flex-1", rows: 10 });
  const tstTextarea = textarea({ class: "font-monospace flex-2", rows: 15 });
  const cmpTextarea = textarea({ class: "font-monospace flex-1", rows: 5 });
  const outTextarea = textarea({
    class: "font-monospace flex-1",
    rows: 5,
    readOnly: true,
  });
  const diffPanel = DiffPanel();

  const runner = new (class ChipRunner extends Timer {
    tick() {
      chip.eval();
      // tickScreen();
    }

    finishFrame() {
      setState();
    }

    reset() {
      for (const pin of chip.ins.entries()) {
        pin.pull(LOW);
      }
      chip.eval();
      setState();
    }

    toggle() {
      runbar.update();
    }
  })();

  const runbar = Runbar({ runner });

  function setState() {
    inPinout.update({ pins: chip.ins, clocked: chip.clocked });
    outPinout.update({ pins: chip.outs });
    pinsPinout.update({ pins: chip.pins });
    outTextarea.update("");
    diffPanel.update();
  }

  const nextState = new Subject<void>();
  nextState.subscribe(() => setTimeout(setState()));
  Clock.get().$.subscribe(() => nextState.next());

  async function setChip(name: string) {
    localStorage["chip/chip"] = name;
    const hdl = await fs.readFile(`/projects/${project}/${name}/${name}.hdl`);
    const tst = await fs.readFile(`/projects/${project}/${name}/${name}.tst`);
    const cmp = await fs.readFile(`/projects/${project}/${name}/${name}.cmp`);
    hdlTextarea.value = hdl;
    tstTextarea.value = tst;
    cmpTextarea.value = cmp;
    compileChip(hdl);
  }

  function compileChip(text: string) {
    chip?.remove();
    const maybeChip = make.parse(text);
    if (isErr(maybeChip)) {
      statusLine(display(Err(maybeChip)));
      return;
    }
    chip = Ok(maybeChip);
    statusLine(`Compiled ${chip.name}`);
    chip.eval();
    setState();
  }

  async function saveChip(project: string, name: string, text: string) {
    const path = `/projects/${project}/${name}/${name}.hdl`;
    await fs.writeFile(path, text);
    statusLine(`Saved ${path}`);
  }

  async function setProject(proj: "01" | "02" | "03" | "04" | "05") {
    localStorage["chip/project"] = project = proj;
    projectDropdown.update(makeProjectDropdown(project, setProject));
    chips = PROJECTS[proj as "01" | "02"];
    chipName = chipName && chips.includes(chipName) ? chipName : chips[0];
    setChip(chipName);
    chipsDropdown.update(makeChipsDropdown(chipName, chips, setChip));
  }

  async function runTest() {
    outTextarea.value = "";
    diffPanel.update(CLEAR);

    const tst = await new Promise<IResult<Tst>>((r) =>
      r(tstParser(tstTextarea.value))
    );

    if (isErr(tst)) {
      statusLine(display(Err(tst)));
      return;
    }
    statusLine("Parsed tst");

    const test = ChipTest.from(Ok(tst)[1]).with(chip);

    await new Promise<void>((r) => {
      test.run();
      r();
    });

    outTextarea.value = test.log();
    setState();

    const [cmp, out] = await Promise.all([
      new Promise<IResult<string[][]>>((r) => r(cmpParser(cmpTextarea.value))),
      new Promise<IResult<string[][]>>((r) => r(cmpParser(outTextarea.value))),
    ]);

    if (isErr(cmp)) {
      statusLine(`Error parsing cmp file!`);
      return;
    }
    if (isErr(out)) {
      statusLine(`Error parsing out file!`);
      return;
    }

    const diffs = compare(Ok(cmp)[1], Ok(out)[1]);
    diffPanel.update({ diffs });
  }

  const fstyle: FStyle = {
    ".View__Chip": {
      "> section": {
        grid: "auto / 2fr 1fr",
        "> .pinouts": {
          grid: "min-content repeat(2, minmax(200px, 1fr)) / 1fr 1fr",
          h2: { margin: "0 var(--nav-element-spacing-horizontal)" },
        },
      },
    },
    "@media (max-width: 992px)": {
      ".View__Chip > section": {
        display: "flex",
        flexDirection: "column",
      },
    },
    "@media (max-width: 576px)": {
      ".View__Chip > section > .pinouts": {
        display: "flex",
        flexDirection: "column",
        "> h2": { order: "0" },
        "> article:not(nth-of-type(3))": { order: "1" },
        "> article:nth-of-type(3)": { order: "2" },
      },
    },
  };

  return div(
    { class: "View__Chip flex-1 flex" },
    style(compileFStyle(fstyle)),
    // runbar,
    section(
      { class: "flex-1 grid" },
      div(
        { class: "pinouts grid" },
        div(
          {
            class: "flex row inline align-end",
            style: { gridColumn: "1 / span 2" },
          },
          projectDropdown,
          h2({ tabIndex: 0 }, "Chips:"),
          chipsDropdown
        ),
        article(
          { class: "no-shadow panel" },
          header(
            div({ tabIndex: 0 }, "HDL"),
            fieldset(
              { class: "button-group" },
              button(
                {
                  events: {
                    click: () => compileChip(hdlTextarea.value),
                    keypress: () => compileChip(hdlTextarea.value),
                  },
                },
                "Compile"
              ),
              button(
                {
                  events: {
                    click: () =>
                      saveChip(project, chip.name!, hdlTextarea.value),
                    keypress: () =>
                      saveChip(project, chip.name!, hdlTextarea.value),
                  },
                },
                "Save"
              )
            )
          ),
          main({ class: "flex" }, hdlTextarea)
        ),
        article(
          { class: "no-shadow panel" },
          header({ tabIndex: 0 }, "Input pins"),
          inPinout
        ),
        article(
          { class: "no-shadow panel" },
          header({ tabIndex: 0 }, "Internal Pins"),
          pinsPinout
        ),
        article(
          { class: "no-shadow panel" },
          header({ tabIndex: 0 }, "Output pins"),
          outPinout
        )
      ),
      article(
        header(
          div({ tabIndex: 0 }, "Test"),
          fieldset(
            { class: "input-group" },
            button(
              {
                events: {
                  click: (e) => {
                    e.preventDefault();
                    runTest();
                  },
                },
              },
              "Execute"
            )
          )
        ),
        tstTextarea,
        cmpTextarea,
        outTextarea,
        diffPanel
      )
    )
  );
};
