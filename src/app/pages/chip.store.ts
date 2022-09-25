import { Err, isErr, Ok } from "@davidsouther/jiffies/lib/esm/result";
import { display } from "@davidsouther/jiffies/lib/esm/display";
import { t } from "@lingui/macro";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";

import { HDL } from "../../languages/hdl";
import { TST } from "../../languages/tst";
import { build as buildChip } from "../../simulator/chip/builder";
import { getBuiltinChip } from "../../simulator/chip/builtins/index";
import { Low, Pin, Chip as SimChip, Chip } from "../../simulator/chip/chip";
import { Clock } from "../../simulator/chip/clock";
import { ChipTest } from "../../simulator/tst";
import { StorageContext } from "../util/storage";
import { AppContext } from "../App.context";
import { ImmPin, reducePins } from "../components/pinout";
import { REGISTRY } from "../../simulator/chip/builtins";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { Span } from "../../languages/base";
import { Projects, PROJECTS } from "../../projects";
import { useImmerReducer } from "../util/react";

export const PROJECT_NAMES = [
  ["01", t`Project 1`],
  ["02", t`Project 2`],
  ["03", t`Project 3`],
  ["05", t`Project 5`],
];

function dropdowns(storage: Record<string, string>) {
  const project = (storage["/chip/project"] as keyof typeof PROJECTS) ?? "01";
  const chips = PROJECTS[project];
  const chipName = storage["/chip/chip"] ?? chips[0];
  return { project, chips, chipName };
}

function makeHdl(name: string) {
  return `CHIP ${name} {
  IN in;
  OUT out;
  PARTS:
}`;
}

function makeTst() {
  return `repeat 10 {
  tick,
  tock;
}`;
}

function makeCmp() {
  return `| in|out|`;
}

export interface ChipPageState {
  files: Files;
  sim: ChipSim;
  controls: ControlsState;
}

export interface ChipSim {
  clocked: boolean;
  inPins: ImmPin[];
  outPins: ImmPin[];
  internalPins: ImmPin[];
  parts: Set<Chip>;
  pending: boolean;
  invalid: boolean;
}

export interface Files {
  hdl: string;
  cmp: string;
  tst: string;
  out: string;
}

export interface ControlsState {
  project: keyof typeof PROJECTS;
  chips: string[];
  chipName: string;
  hasBuiltin: boolean;
  runningTest: boolean;
  span?: Span;
}

function reduceChip(chip: SimChip, pending = false, invalid = false): ChipSim {
  return {
    clocked: chip.clocked,
    inPins: reducePins(chip.ins),
    outPins: reducePins(chip.outs),
    internalPins: reducePins(chip.pins),
    parts: new Set(chip.parts),
    pending,
    invalid,
  };
}

const clock = Clock.get();

export type ChipStoreDispatch = Dispatch<{
  action: keyof ReturnType<typeof makeChipStore>["reducers"];
  payload?: {};
}>;

export function makeChipStore(
  fs: FileSystem,
  setStatus: (status: string) => void,
  storage: Record<string, string>,
  dispatch: MutableRefObject<ChipStoreDispatch>
) {
  let { project, chips, chipName } = dropdowns(storage);
  let chip = new Low();
  let test = new ChipTest();

  const initialState: ChipPageState = (() => {
    const controls: ControlsState = {
      project,
      chips,
      chipName,
      hasBuiltin: REGISTRY.has(chipName),
      runningTest: false,
    };

    let maybeChip = getBuiltinChip(controls.chipName);
    if (isErr(maybeChip)) {
      setStatus(display(Err(maybeChip)));
    } else {
      chip = Ok(maybeChip);
    }

    const sim = reduceChip(chip);

    setTimeout(() => {
      actions.reloadChip();
    });

    return {
      controls,
      files: {
        hdl: "",
        cmp: "",
        tst: "",
        out: "",
      },
      sim,
    };
  })();

  const reducers = {
    setFiles(
      state: ChipPageState,
      {
        hdl = state.files.hdl,
        tst = state.files.tst,
        cmp = state.files.cmp,
        out = "",
      }: {
        hdl?: string;
        tst?: string;
        cmp?: string;
        out?: string;
      }
    ) {
      state.files.hdl = hdl;
      state.files.tst = tst;
      state.files.cmp = cmp;
      state.files.out = out;
    },

    updateChip(
      state: ChipPageState,
      payload?: { pending?: boolean; invalid?: boolean }
    ) {
      state.sim = reduceChip(chip, payload?.pending, payload?.invalid);
      state.controls.chips = PROJECTS[state.controls.project];
      state.controls.chipName = chip.name ?? chipName;
      if (!state.controls.chips.includes(state.controls.chipName)) {
        state.controls.chips = [
          ...state.controls.chips,
          state.controls.chipName,
        ];
      }
    },

    setProject(state: ChipPageState, project: keyof typeof PROJECTS) {
      const chips = PROJECTS[project];
      const chipName =
        state.controls.chipName && chips.includes(state.controls.chipName)
          ? state.controls.chipName
          : chips[0];
      state.controls.project = project;
      state.controls.chips = chips;
      this.setChip(state, chipName);
    },

    setChip(state: ChipPageState, chipName: string) {
      state.controls.chipName = chipName;
      state.controls.hasBuiltin = REGISTRY.has(chipName);
    },

    testRunning(state: ChipPageState) {
      state.controls.runningTest = true;
    },
    testFinished(state: ChipPageState) {
      state.controls.runningTest = false;
    },
    updateTestStep(state: ChipPageState) {
      state.files.out = test?.log() ?? "";
      state.controls.span = test?.currentStep?.span;
      this.updateChip(state, {
        pending: state.sim.pending,
        invalid: state.sim.invalid,
      });
    },
  };

  const actions = {
    setProject(p: keyof typeof PROJECTS) {
      project = storage["/chip/project"] = p;
      dispatch.current({ action: "setProject", payload: project });
      this.setChip(PROJECTS[project][0]);
    },

    setChip(
      chip: string,
      project = storage["/chip/project"] ?? Projects["01"]
    ) {
      chipName = storage["/chip/chip"] = chip;
      dispatch.current({ action: "setChip", payload: chipName });
      this.loadChip(project, chipName);
    },

    reset() {
      Clock.get().reset();
      chip.reset();
      test.reset();
      dispatch.current({ action: "setFiles", payload: {} });
      dispatch.current({ action: "updateChip" });
    },

    updateFiles({ hdl, tst, cmp }: { hdl: string; tst: string; cmp: string }) {
      dispatch.current({ action: "setFiles", payload: { hdl, tst, cmp } });
      try {
        this.compileChip(hdl);
        this.compileTest(tst);
      } catch (e) {
        setStatus(display(e));
      }
    },

    compileChip(hdl: string) {
      chip.remove();
      const maybeParsed = HDL.parse(hdl);
      if (isErr(maybeParsed)) {
        setStatus("Failed to parse chip");
        dispatch.current({ action: "updateChip", payload: { invalid: true } });
        return;
      }
      const maybeChip = buildChip(Ok(maybeParsed));
      if (isErr(maybeChip)) {
        setStatus(display(Err(maybeChip)));
        dispatch.current({ action: "updateChip", payload: { invalid: true } });
        return;
      }
      setStatus(t`Compiled ${chip.name}`);
      this.replaceChip(Ok(maybeChip));
    },

    replaceChip(nextChip: SimChip) {
      // Store current inPins
      const inPins = chip.ins;
      for (const [pin, { busVoltage }] of inPins) {
        if (nextChip.ins.has(pin)) {
          nextChip.ins.get(pin)!.busVoltage = busVoltage;
        }
      }
      clock.reset();
      nextChip.eval();
      chip = nextChip;
      dispatch.current({ action: "updateChip" });
    },

    async loadChip(project: string, name: string) {
      storage["/chip/chip"] = name;
      const fsName = (ext: string) =>
        `/projects/${project}/${name}/${name}.${ext}`;

      const [hdl, tst, cmp] = await Promise.all([
        fs.readFile(fsName("hdl")).catch(() => makeHdl(name)),
        fs.readFile(fsName("tst")).catch((e) => {
          console.log(e);
          return makeTst();
        }),
        fs.readFile(fsName("cmp")).catch(() => makeCmp()),
      ]);

      dispatch.current({ action: "setFiles", payload: { hdl, tst, cmp } });
      this.compileChip(hdl);
      this.compileTest(tst);
    },

    async saveChip(hdl: string, prj = project, name = chipName) {
      dispatch.current({ action: "setFiles", payload: { hdl } });
      const path = `/projects/${prj}/${name}/${name}.hdl`;
      await fs.writeFile(path, hdl);
      setStatus(`Saved ${path}`);
    },

    toggle(pin: Pin, i: number | undefined) {
      if (i !== undefined) {
        pin.busVoltage = pin.busVoltage ^ (1 << i);
      } else {
        if (pin.width === 1) {
          pin.toggle();
        } else {
          pin.busVoltage += 1;
        }
      }
      dispatch.current({ action: "updateChip", payload: { pending: true } });
    },

    eval() {
      chip.eval();
      dispatch.current({ action: "updateChip" });
    },

    clock() {
      clock.toggle();
      if (clock.isLow) {
        clock.frame();
      }
      dispatch.current({ action: "updateChip" });
    },

    useBuiltin() {
      const nextChip = getBuiltinChip(chipName);
      if (isErr(nextChip)) {
        setStatus(
          `Failed to load builtin ${chipName}: ${display(Err(nextChip))}`
        );
        return;
      }
      this.replaceChip(Ok(nextChip));
    },

    reloadChip() {
      this.loadChip(project, chipName);
    },

    compileTest(file: string) {
      dispatch.current({ action: "setFiles", payload: { tst: file } });
      const tst = TST.parse(file);

      if (isErr(tst)) {
        setStatus(t`Failed to parse test`);
        return false;
      }
      setStatus(t`Parsed tst`);

      test = ChipTest.from(Ok(tst)).with(chip);
      test.setFileSystem(fs);
      dispatch.current({ action: "updateTestStep" });
      return true;
    },

    async runTest(file: string) {
      if (!this.compileTest(file)) {
        return;
      }
      dispatch.current({ action: "testRunning" });

      fs.pushd("/samples");
      await test.run();
      fs.popd();

      dispatch.current({ action: "updateTestStep" });
    },

    async tick() {
      await test.step();
      dispatch.current({ action: "updateTestStep" });
    },
  };

  return { initialState, reducers, actions };
}

export function useChipPageStore() {
  const fs = useContext(StorageContext);
  const { setStatus } = useContext(AppContext);
  const storage: Record<string, string> = useMemo(() => localStorage, []);

  const dispatch = useRef<ChipStoreDispatch>(() => {});

  const { initialState, reducers, actions } = useMemo(
    () => makeChipStore(fs, setStatus, storage, dispatch),
    [fs, setStatus, storage, dispatch]
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}