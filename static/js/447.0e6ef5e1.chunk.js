"use strict";(globalThis.webpackChunk_nand2tetris_web=globalThis.webpackChunk_nand2tetris_web||[]).push([[447],{6049:(t,e,n)=>{n.r(e),n.d(e,{default:()=>k});var s=n(4621),r=n(4771),i=n(8878),a=n(7437),o=n(64),c=n(4668),l=n(8177),u=n(7022),d=n(3761),m=n(5874),p=n(8463),h=n(7076),g=n(6554),f=n(4533),v=n(3977);const S='Vm <: Base {\n  Root := Vm\n\n  Vm = newline* VmInstructionLine* VmInstruction?\n\n  space := comment | " " | "\t"\n  whitespace = lineComment | comment | space\n\n  VmInstructionLine = VmInstruction newline+\n  VmInstruction =\n    | StackInstruction\n    | OpInstruction\n    | FunctionInstruction\n    | CallInstruction\n    | ReturnInstruction\n    | GotoInstruction\n    | LabelInstruction\n  \n  StackInstruction = (push | pop) MemorySegment Number\n  OpInstruction = Add | Sub | Neg | Lt | Gt | Eq | And | Or | Not\n  FunctionInstruction = function Name Number \n  CallInstruction =  call Name Number\n  ReturnInstruction = return\n  LabelInstruction = label Name\n  GotoInstruction = (goto | ifGoto) Name\n\n  MemorySegment = argument | local | static | constant | this | that | pointer | temp\n\n  push = "push" whitespace+\n  pop = "pop" whitespace+\n  function = "function" whitespace+\n  call = "call" whitespace+\n  return = "return"\n  goto = "goto" whitespace+\n  ifGoto = "if-goto" whitespace+\n  label = "label" whitespace+\n\n  argument = "argument" whitespace+\n  local = "local" whitespace+\n  static = "static" whitespace+\n  constant = "constant" whitespace+\n  this = "this" whitespace+\n  that = "that" whitespace+\n  pointer = "pointer" whitespace+\n  temp = "temp" whitespace+\n\n  Add = "add" \n  Sub = "sub" \n  Neg = "neg" \n  Eq = "eq"\n  Lt = "lt" \n  Gt = "gt" \n  And = "and" \n  Or = "or" \n  Not = "not"\n}',I=f.A.grammar(S,v.lN),A=I.extendSemantics(v.JE);A.addAttribute("op",{push:(t,e)=>"push",pop:(t,e)=>"pop",function:(t,e)=>"function",call:(t,e)=>"call",return:t=>"return",goto:(t,e)=>"goto",ifGoto:(t,e)=>"if-goto",label:(t,e)=>"label",Add:t=>"add",Sub:t=>"sub",Neg:t=>"neg",Eq:t=>"eq",Lt:t=>"lt",Gt:t=>"gt",And:t=>"and",Or:t=>"or",Not:t=>"not"}),A.addAttribute("segment",{argument:(t,e)=>"argument",local:(t,e)=>"local",static:(t,e)=>"static",constant:(t,e)=>"constant",this:(t,e)=>"this",that:(t,e)=>"that",pointer:(t,e)=>"pointer",temp:(t,e)=>"temp"}),A.addAttribute("instruction",{StackInstruction({op:t},{segment:e},n){return{op:t,segment:e,offset:Number(n.sourceString),span:(0,v.Ln)(this.source)}},OpInstruction({op:t}){return{op:t,span:(0,v.Ln)(this.source)}},FunctionInstruction(t,{name:e},n){return{op:"function",name:e,nVars:Number(n.sourceString),span:(0,v.Ln)(this.source)}},CallInstruction(t,{name:e},n){return{op:"call",name:e,nArgs:Number(n.sourceString),span:(0,v.Ln)(this.source)}},ReturnInstruction(t){return{op:"return",span:(0,v.Ln)(this.source)}},LabelInstruction(t,{name:e}){return{op:"label",label:e,span:(0,v.Ln)(this.source)}},GotoInstruction({op:t},{name:e}){return{op:t,label:e,span:(0,v.Ln)(this.source)}},VmInstructionLine:(t,e)=>t.instruction}),A.addAttribute("vm",{Vm(t,e,n){const s=e.children.map((t=>t.instruction))??[];return{instructions:n.child(0)?[...s,n.child(0).instruction]:s}}}),A.addAttribute("root",{Root:({vm:t})=>t});const R={grammar:S,semantics:A,parser:I,parse:(0,v.Q5)(I,A)};var x=n(8783),b=n(9928),y=n(7365),_=n(4256);const C="repeat {\n\tvmstep;\n}";function E(t,e,n,s){const r=new _.X(t.vm.RAM,e),i=new _.X(t.vm.Screen,e),a=new h.PC(new _.X(t.vm.RAM,e)),o=t.vm.derivedLine();let c=[];try{c=t.vm.vmStack().reverse()}catch(l){n("Runtime error: Invalid stack")}return{Keyboard:a,RAM:r,Screen:i,Stack:c,Prog:t.vm.program,Statics:[...t.vm.memory.map(((t,e)=>e),16,16+t.vm.getStaticCount())],Temp:[...t.vm.memory.map(((t,e)=>e),5,13)],AddedSysInit:t.vm.addedSysInit,highlight:o,showHighlight:s}}function L(){const{fs:t,setStatus:e,storage:n}=(0,i.useContext)(d.L),s=(0,i.useRef)((()=>{})),{initialState:r,reducers:a,actions:o}=(0,i.useMemo)((()=>function(t,e,n,s){const r=(0,m.oA)(R.parse(p.J5));let i=(0,m.oA)(b.Vm.build(r.instructions)),a=new x.Y(e).with(i),o=!1,c=!0,l="",u=!0;const d={setVm(t,e){t.files.vm=e},setTst(t,{tst:e,cmp:n}){t.files.tst=e,t.files.cmp=n??""},setExitCode(t,e){t.controls.exitCode=e},setValid(t,e){t.controls.valid=e},setShowHighlight(t,e){t.vm.showHighlight=e},setError(t,n){n?(t.controls.valid=!1,e(n?.message)):t.controls.valid=!0,t.controls.error=n},setPath(t,e){t.test.path=e},update(t){t.vm=E(a,s,e,u),t.test.highlight=a.currentStep?.span},setAnimate(t,e){t.controls.animate=e},testStep(t){t.files.out=a.log()},testFinished(t){const n=(0,y.U)(t.files.cmp.trim(),t.files.out);e(n?"Simulation successful: The output file is identical to the compare file":"Simulation error: The output file differs from the compare file")}},h={setVm(t){if(u=!1,s.current({action:"setVm",payload:t}),l==t)return;l=t;const e=R.parse(t);if((0,m.ys)(e))return s.current({action:"setError",payload:(0,m._)(e)}),!1;const n=(0,m.oA)(e).instructions,r=b.Vm.build(n);return this.replaceVm(r)},loadVm(t){u=!1;for(const s of t)s.content.endsWith("\n")&&(s.content=s.content.slice(0,-1));const e=t.map((t=>t.content)).join("\n");if(s.current({action:"setVm",payload:e}),l==e)return;l=e;const n=[];let r=0;for(const a of t){const t=R.parse(a.content);if((0,m.ys)(t))return s.current({action:"setError",payload:(0,m._)(t)}),!1;const e=(0,m.oA)(t).instructions;for(const n of e)void 0!=n.span?.line&&(n.span.line+=r);r+=a.content.split("\n").length,n.push({name:a.name,instructions:e})}const i=b.Vm.buildFromFiles(n);return this.replaceVm(i)},replaceVm:t=>(0,m.ys)(t)?(s.current({action:"setError",payload:(0,m._)(t)}),!1):(s.current({action:"setError"}),e("Compiled VM code successfully"),i=(0,m.oA)(t),a.vm=i,s.current({action:"update"}),!0),loadTest(n,r,o){s.current({action:"setTst",payload:{tst:r,cmp:o}});const c=g.uG.parse(r);return(0,m.ys)(c)?(s.current({action:"setValid",payload:!1}),e("Failed to parse test"),!1):(s.current({action:"setValid",payload:!0}),e("Parsed tst"),i.reset(),a=x.Y.from((0,m.oA)(c),n,(t=>{this.loadVm(t)}),e).using(t),a.vm=i,s.current({action:"update"}),!0)},setAnimate(t){c=t,s.current({action:"setAnimate",payload:t})},async testStep(){u=!0;let t=!1;try{return t=await a.step(),s.current({action:"testStep"}),t&&s.current({action:"testFinished"}),c&&s.current({action:"update"}),t}catch(n){return e(`Runtime error: ${n.message}`),s.current({action:"setValid",payload:!1}),!0}},setPaused(t=!0){i.setPaused(t)},step(){u=!0;try{let t=!1;const e=i.step();return void 0!==e&&(t=!0,s.current({action:"setExitCode",payload:e})),c&&s.current({action:"update"}),t}catch(t){return e(`Runtime error: ${t.message}`),s.current({action:"setValid",payload:!1}),!0}},reset(){u=!0,a.reset(),i.reset(),s.current({action:"update"}),s.current({action:"setExitCode",payload:void 0}),s.current({action:"setValid",payload:!0})},toggleUseTest(){o=!o,s.current({action:"update"})},initialize(){this.setVm(p.J5)}};return{initialState:{vm:E(a,s,e,!0),controls:{exitCode:void 0,runningTest:!1,animate:!0,valid:!0},test:{highlight:void 0,path:"/"},files:{vm:"",tst:C,cmp:"",out:""}},reducers:d,actions:h}}(t,e,0,s)),[t,e,n,s]),[c,u]=(0,l.A)(a,r);return s.current=u,{state:c,dispatch:s,actions:o}}var w=n(1091),T=n(270),j=n(2144),M=n(8029),N=n(2675),O=n(4280),V=n(9864),P=n(782);const F={[T.X.SYS_WAIT_DURATION_NOT_POSITIVE]:r.Ru._("Duration must be positive (Sys.wait)"),[T.X.ARRAY_SIZE_NOT_POSITIVE]:r.Ru._("Array size must be positive (Array.new)"),[T.X.DIVIDE_BY_ZERO]:r.Ru._("Division by zero (Math.divide)"),[T.X.SQRT_NEG]:r.Ru._("Cannot compute square root of a negative number (Math.sqrt)"),[T.X.ALLOC_SIZE_NOT_POSITIVE]:r.Ru._("Allocated memory size must be positive (Memory.alloc)"),[T.X.HEAP_OVERFLOW]:r.Ru._("Heap overflow (Memory.alloc)"),[T.X.ILLEGAL_PIXEL_COORD]:r.Ru._("Illegal pixel coordinates (Screen.drawPixel)"),[T.X.ILLEGAL_LINE_COORD]:r.Ru._("Illegal line coordinates (Screen.drawLine)"),[T.X.ILLEGAL_RECT_COORD]:r.Ru._("Illegal rectangle coordinates (Screen.drawRectangle)"),[T.X.ILLEGAL_CENTER_COORD]:r.Ru._("Illegal center coordinates (Screen.drawCircle)"),[T.X.ILLEGAL_RADIUS]:r.Ru._("Illegal radius (Screen.drawCircle)"),[T.X.STRING_LENGTH_NEG]:r.Ru._("Maximum length must be non-negative (String.new)"),[T.X.GET_CHAR_INDEX_OUT_OF_BOUNDS]:r.Ru._("String index out of bounds (String.charAt)"),[T.X.SET_CHAR_INDEX_OUT_OF_BOUNDS]:r.Ru._("String index out of bounds (String.setCharAt)"),[T.X.STRING_FULL]:r.Ru._("String is full (String.appendChar)"),[T.X.STRING_EMPTY]:r.Ru._("String is empty (String.eraseLastChar)"),[T.X.STRING_INSUFFICIENT_CAPACITY]:r.Ru._("Insufficient string capacity (String.setInt)"),[T.X.ILLEGAL_CURSOR_LOCATION]:r.Ru._("Illegal cursor location (Output.moveCursor)")},k=()=>{const{state:t,actions:e,dispatch:n}=L(),{fs:r,setStatus:m}=(0,i.useContext)(d.L),{filePicker:p}=(0,i.useContext)(M.BR),[h,g]=(0,l.b)(t.files.tst),[f,v]=(0,l.b)(t.files.out),[S,I]=(0,l.b)(t.files.cmp),[A,R]=(0,i.useState)("/");(0,i.useEffect)((()=>{e.initialize()}),[e]),(0,i.useEffect)((()=>{e.loadTest(A,h,S),e.reset()}),[h,S]),(0,i.useEffect)((()=>{void 0!==t.controls.exitCode&&m(0==t.controls.exitCode?"Program halted":`Program exited with error code ${t.controls.exitCode}${(0,T.U)(t.controls.exitCode)?`: ${F[t.controls.exitCode]}`:""}`)}),[t.controls.exitCode]);const x=(0,i.useRef)(),b=(0,i.useRef)(),[y,_]=(0,i.useState)(!1);(0,i.useEffect)((()=>(x.current=new class extends w.M{async tick(){return e.step()}finishFrame(){n.current({action:"update"})}reset(){m("Reset"),e.reset()}toggle(){e.setPaused(!this.running),n.current({action:"update"})}},b.current=new class extends w.M{async tick(){return e.testStep()}finishFrame(){n.current({action:"update"})}reset(){m("Reset"),e.reset()}toggle(){e.setPaused(!this.running),n.current({action:"update"})}},_(!0),()=>{var t,e;null===(t=x.current)||void 0===t||t.stop(),null===(e=b.current)||void 0===e||e.stop()})),[e,n]);const E=t=>{e.setAnimate(t<=2)},k=(0,i.useRef)(),[G,X]=(0,i.useState)(1);return(0,P.jsxs)("div",{className:"Page VmPage grid "+(0==G?"no-screen":2==G?"large-screen":"normal"),children:[(0,P.jsx)(O.Z,{className:"program",header:(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)("div",{className:"flex-0",style:{whiteSpace:"nowrap"},children:(0,P.jsx)(s.x6,{id:"VM Code"})}),(0,P.jsx)("div",{className:"flex-1",children:y&&x.current&&(0,P.jsx)(u.T,{prefix:(0,P.jsx)("button",{className:"flex-0",onClick:async()=>{const t=await p.select(".vm",!0);m(j.F),requestAnimationFrame((async()=>{const n=[];var s;if(t.includes(".vm"))n.push({name:(null!==(s=t.split("/").pop())&&void 0!==s?s:t).replace(".vm",""),content:await r.readFile(t)});else for(const e of(await r.scandir(t)).filter((t=>t.isFile()&&t.name.endsWith(".vm"))))n.push({name:e.name.replace(".vm",""),content:await r.readFile(`${t}/${e.name}`)});requestAnimationFrame((()=>{e.loadVm(n),e.reset(),m("")}))}))},"data-tooltip":"Load files","data-placement":"bottom",children:"\ud83d\udcc2"}),runner:x.current,disabled:!t.controls.valid,onSpeedChange:E})})]}),children:(0,P.jsx)(N.K,{value:t.files.vm,onChange:t=>{e.setVm(t)},language:"vm",highlight:t.controls.valid&&t.vm.showHighlight?t.vm.highlight:void 0,error:t.controls.error})}),(0,P.jsx)(O.Z,{className:"vm",header:(0,P.jsx)(s.x6,{id:"VM Structures"}),children:t.controls.valid&&t.vm.Stack.length>0&&(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(U,{statics:t.vm.Statics,temp:t.vm.Temp,frame:t.vm.Stack[0]}),(0,P.jsx)(D,{stack:t.vm.Stack,addedSysInit:t.vm.AddedSysInit})]})}),(0,P.jsxs)(O.Z,{className:"display",style:{gridArea:"display"},children:[(0,P.jsx)(c.f,{memory:t.vm.Screen,showScaleControls:!0,scale:G,onScale:t=>{X(t)}}),(0,P.jsx)(a.s,{keyboard:t.vm.Keyboard})]}),(0,P.jsx)(o.Ay,{ref:k,name:"RAM",memory:t.vm.RAM,initialAddr:256,format:"dec",showClear:!1}),(0,P.jsx)(o.Ay,{name:"RAM",className:"Stack",memory:t.vm.RAM,format:"dec",cellLabels:["SP:","LCL:","ARG:","THIS:","THAT:","TEMP0:","TEMP1:","TEMP2:","TEMP3:","TEMP4:","TEMP5:","TEMP6:","TEMP7:","R13:","R14:","R15:"],onChange:()=>{var t;null===(t=k.current)||void 0===t||t.rerender()}}),y&&(0,P.jsx)(V.B,{runner:b,tst:[h,g,t.test.highlight],out:[f,v],cmp:[S,I],setPath:R,showClear:!0,defaultTst:C,onSpeedChange:E,disabled:!t.controls.valid})]})},G="Unknown function";function X(t,e){const n={};t=t.filter((t=>{var e;return(null===(e=t.fn)||void 0===e?void 0:e.name)!=b.IG}));for(const r of t)r.fn&&(n[r.fn.name]?n[r.fn.name]++:n[r.fn.name]=1);const s=t.slice().reverse().map((t=>{var n,s,r;return(null===(n=t.fn)||void 0===n?void 0:n.name)==b.h0.name?e?`${b.h0.name} (built-in)`:b.h0.name:null!==(s=null===(r=t.fn)||void 0===r?void 0:r.name)&&void 0!==s?s:G}));for(const r of Object.keys(n))if(1!=n[r]){n[r]=0;for(let t=0;t<s.length;t++)s[t]===r&&(s[t]=`${r}[${n[r]}]`,n[r]++)}return s}function D({stack:t,addedSysInit:e}){return(0,P.jsx)("section",{children:(0,P.jsxs)("p",{children:["Call-stack:",(0,P.jsx)("code",{children:X(t,e).join(" > ")})]})})}function U({statics:t,temp:e,frame:n}){var s,r,i,a,o,c,l;return(0,P.jsx)("section",{children:(0,P.jsxs)("main",{children:[(0,P.jsxs)("p",{children:["Stack:",(0,P.jsxs)("code",{children:["[",n.stack.values.join(", "),"]"]})]}),(null===(s=n.usedSegments)||void 0===s?void 0:s.has("local"))&&(0,P.jsxs)("p",{children:["local:",(0,P.jsxs)("code",{children:["[",n.locals.values.join(", "),"]"]})]}),(null===(r=n.usedSegments)||void 0===r?void 0:r.has("argument"))&&(0,P.jsxs)("p",{children:["argument:",(0,P.jsxs)("code",{children:["[",n.args.values.join(", "),"]"]})]}),(null===(i=n.usedSegments)||void 0===i?void 0:i.has("static"))&&(0,P.jsxs)("p",{children:["static:",(0,P.jsxs)("code",{children:["[",t.join(", "),"]"]})]}),(null===(a=n.usedSegments)||void 0===a?void 0:a.has("pointer"))&&(0,P.jsxs)("p",{children:["pointer:",(0,P.jsxs)("code",{children:["[",`${n.frame.THIS}, ${n.frame.THAT}`,"]"]})]}),(null===(o=n.usedSegments)||void 0===o?void 0:o.has("this"))&&(0,P.jsxs)("p",{children:["this:",(0,P.jsxs)("code",{children:["[",n.this.values.join(", "),"]"]})]}),(null===(c=n.usedSegments)||void 0===c?void 0:c.has("that"))&&(0,P.jsxs)("p",{children:["that:",(0,P.jsxs)("code",{children:["[",n.that.values.join(", "),"]"]})]}),(null===(l=n.usedSegments)||void 0===l?void 0:l.has("temp"))&&(0,P.jsxs)("p",{children:["temp:",(0,P.jsxs)("code",{children:["[",e.join(", "),"]"]})]})]})})}},4256:(t,e,n)=>{n.d(e,{X:()=>r});var s=n(7076);class r extends s.qN{dispatch;constructor(t,e){super(t,t.size,0),this.dispatch=e}async load(t,e){await super.load(t,e),this.dispatch.current({action:"update"})}}},8463:(t,e,n)=>{n.d(e,{Kx:()=>r,O:()=>a,a5:()=>i,J5:()=>s});const s="function Main.fibonacci 0\n    push argument 0\n    push constant 2\n    lt                     // checks if n<2\n    if-goto IF_TRUE\n    goto IF_FALSE\n    label IF_TRUE          // if n<2, return n\n    push argument 0        \n    return\n    label IF_FALSE         // if n>=2, returns fib(n-2)+fib(n-1)\n    push argument 0\n    push constant 2\n    sub\n    call Main.fibonacci 1  // computes fib(n-2)\n    push argument 0\n    push constant 1\n    sub\n    call Main.fibonacci 1  // computes fib(n-1)\n    add                    // returns fib(n-1) + fib(n-2)\n    return\nfunction Sys.init 0\n    push constant 4\n    call Main.fibonacci 1   // computes the 4'th fibonacci element\nlabel WHILE\n    goto WHILE              // loops infinitely\n",r={"01":["Nand"],"02":[],"03":["DFF"],"05":["Screen","Keyboard","DRegister","ARegister","ROM32K","RAM16K"]},i={"01":["Not","And","Or","Xor","Mux","DMux","Not16","And16","Or16","Mux16","Or8Way","Mux4Way16","Mux8Way16","DMux4Way","DMux8Way"],"02":["HalfAdder","FullAdder","Add16","Inc16","ALU"],"03":["Bit","Register","RAM8","RAM64","RAM512","RAM4K","RAM16K","PC"],"05":["Memory","CPU","Computer"]},a={"05":["Memory","CPU","Computer","Screen","Keyboard","DRegister","ARegister","ROM32K","RAM16K"]}}}]);