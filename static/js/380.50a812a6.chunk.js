"use strict";(globalThis.webpackChunk_nand2tetris_web=globalThis.webpackChunk_nand2tetris_web||[]).push([[380],{1155:(t,e,n)=>{n.r(e),n.d(e,{default:()=>M});var s=n(4621),r=n(4771),o=n(8878),i=n(7437),a=n(4171),c=n(4668),l=n(8177),u=n(7022),d=n(3761),m=n(5874);const p="function Main.fibonacci 0\n    push argument 0\n    push constant 2\n    lt                     // checks if n<2\n    if-goto IF_TRUE\n    goto IF_FALSE\n    label IF_TRUE          // if n<2, return n\n    push argument 0        \n    return\n    label IF_FALSE         // if n>=2, returns fib(n-2)+fib(n-1)\n    push argument 0\n    push constant 2\n    sub\n    call Main.fibonacci 1  // computes fib(n-2)\n    push argument 0\n    push constant 1\n    sub\n    call Main.fibonacci 1  // computes fib(n-1)\n    add                    // returns fib(n-1) + fib(n-2)\n    return\nfunction Sys.init 0\n    push constant 4\n    call Main.fibonacci 1   // computes the 4'th fibonacci element\nlabel WHILE\n    goto WHILE              // loops infinitely\n";var h=n(7076),f=n(6554),g=n(4533),v=n(3977);const S='\nVm <: Base {\n  Root := Vm\n\n  Vm = VmInstruction*\n\n  VmInstruction =\n    | StackInstruction\n    | OpInstruction\n    | FunctionInstruction\n    | CallInstruction\n    | ReturnInstruction\n    | GotoInstruction\n    | LabelInstruction\n  \n  StackInstruction = (Push | Pop) MemorySegment Number\n  OpInstruction = Add | Sub | Neg | Lt | Gt | Eq | And | Or | Not\n  FunctionInstruction = Function Name Number \n  CallInstruction =  Call Name Number\n  ReturnInstruction = Return\n  LabelInstruction = Label Name\n  GotoInstruction = (Goto | IfGoto) Name\n\n  MemorySegment = Argument | Local | Static | Constant | This | That | Pointer | Temp\n\n  Push = "push"\n  Pop = "pop"\n  Function = "function"\n  Call = "call"\n  Return = "return"\n  Goto = "goto"\n  IfGoto = "if-goto"\n  Label = "label"\n\n  Argument = "argument"\n  Local = "local"\n  Static = "static"\n  Constant = "constant"\n  This = "this"\n  That = "that"\n  Pointer = "pointer"\n  Temp = "temp"\n\n  Add = "add" \n  Sub = "sub" \n  Neg = "neg" \n  Eq = "eq"\n  Lt = "lt" \n  Gt = "gt" \n  And = "and" \n  Or = "or" \n  Not = "not"\n}',I=g.A.grammar(S,v.lN),b=I.extendSemantics(v.JE);b.addAttribute("op",{Push:t=>"push",Pop:t=>"pop",Function:t=>"function",Call:t=>"call",Return:t=>"return",Goto:t=>"goto",IfGoto:t=>"if-goto",Label:t=>"label",Add:t=>"add",Sub:t=>"sub",Neg:t=>"neg",Eq:t=>"eq",Lt:t=>"lt",Gt:t=>"gt",And:t=>"and",Or:t=>"or",Not:t=>"not"}),b.addAttribute("segment",{Argument:t=>"argument",Local:t=>"local",Static:t=>"static",Constant:t=>"constant",This:t=>"this",That:t=>"that",Pointer:t=>"pointer",Temp:t=>"temp"}),b.addAttribute("instruction",{StackInstruction({op:t},{segment:e},n){return{op:t,segment:e,offset:Number(n.sourceString),span:(0,v.Ln)(this.source)}},OpInstruction({op:t}){return{op:t,span:(0,v.Ln)(this.source)}},FunctionInstruction(t,{name:e},n){return{op:"function",name:e,nVars:Number(n.sourceString),span:(0,v.Ln)(this.source)}},CallInstruction(t,{name:e},n){return{op:"call",name:e,nArgs:Number(n.sourceString),span:(0,v.Ln)(this.source)}},ReturnInstruction(t){return{op:"return",span:(0,v.Ln)(this.source)}},LabelInstruction(t,{name:e}){return{op:"label",label:e,span:(0,v.Ln)(this.source)}},GotoInstruction({op:t},{name:e}){return{op:t,label:e,span:(0,v.Ln)(this.source)}}}),b.addAttribute("vm",{Vm:t=>({instructions:t.children.map((t=>t.instruction))})}),b.addAttribute("root",{Root:({vm:t})=>t});const x={grammar:S,semantics:b,parser:I,parse:(0,v.Q5)(I,b)};var y=n(8783),R=n(9928),_=n(7365),A=n(4256);const L="repeat {\n\tvmstep;\n}";function T(t,e,n,s){const r=new A.X(t.vm.RAM,e),o=new A.X(t.vm.Screen,e),i=new h.PC(new A.X(t.vm.RAM,e)),a=t.vm.derivedLine();let c=[];try{c=t.vm.vmStack().reverse()}catch(l){n("Runtime error: Invalid stack")}return{Keyboard:i,RAM:r,Screen:o,Stack:c,Prog:t.vm.program,Statics:[...t.vm.memory.map(((t,e)=>e),16,16+t.vm.getStaticCount())],Temp:[...t.vm.memory.map(((t,e)=>e),5,13)],AddedSysInit:t.vm.addedSysInit,highlight:a,showHighlight:s}}function C(){const{fs:t,setStatus:e,storage:n}=(0,o.useContext)(d.L),s=(0,o.useRef)((()=>{})),{initialState:r,reducers:i,actions:a}=(0,o.useMemo)((()=>function(t,e,n,s){const r=(0,m.oA)(x.parse(p));let o=(0,m.oA)(R.Vm.build(r.instructions)),i=(new y.Y).with(o),a=!1,c=!0,l="",u=!0;const d={setVm(t,e){t.files.vm=e},setTst(t,{tst:e,cmp:n}){t.files.tst=e,t.files.cmp=n??""},setExitCode(t,e){t.controls.exitCode=e},setValid(t,e){t.controls.valid=e},setShowHighlight(t,e){t.vm.showHighlight=e},setError(t,n){n?(t.controls.valid=!1,e(n?.message)):t.controls.valid=!0,t.controls.error=n},setPath(t,e){t.test.path=e},update(t){t.vm=T(i,s,e,u),t.test.highlight=i.currentStep?.span},setAnimate(t,e){t.controls.animate=e},testStep(t){t.files.out=i.log()},testFinished(t){const n=(0,_.U)(t.files.cmp.trim(),t.files.out);e(n?"Simulation successful: The output file is identical to the compare file":"Simulation error: The output file differs from the compare file")}},h={setVm(t){if(u=!1,s.current({action:"setVm",payload:t}),l==t)return;l=t;const e=x.parse(t);if((0,m.ys)(e))return s.current({action:"setError",payload:(0,m._)(e)}),!1;const n=(0,m.oA)(e).instructions,r=R.Vm.build(n);return this.replaceVm(r)},loadVm(t){u=!1;for(const s of t)s.content.endsWith("\n")&&(s.content=s.content.slice(0,-1));const e=t.map((t=>t.content)).join("\n");if(s.current({action:"setVm",payload:e}),l==e)return;l=e;const n=[];let r=0;for(const i of t){const t=x.parse(i.content);if((0,m.ys)(t))return s.current({action:"setError",payload:(0,m._)(t)}),!1;const e=(0,m.oA)(t).instructions;for(const n of e)void 0!=n.span?.line&&(n.span.line+=r);r+=i.content.split("\n").length,n.push({name:i.name,instructions:e})}const o=R.Vm.buildFromFiles(n);return this.replaceVm(o)},replaceVm:t=>(0,m.ys)(t)?(s.current({action:"setError",payload:(0,m._)(t)}),!1):(s.current({action:"setError"}),e("Compiled VM code successfully"),o=(0,m.oA)(t),i.vm=o,s.current({action:"update"}),!0),loadTest(n,r,a){s.current({action:"setTst",payload:{tst:r,cmp:a}});const c=f.uG.parse(r);return(0,m.ys)(c)?(s.current({action:"setValid",payload:!1}),e("Failed to parse test"),!1):(s.current({action:"setValid",payload:!0}),e("Parsed tst"),o.reset(),i=y.Y.from((0,m.oA)(c),n,(t=>{this.loadVm(t)})).using(t),i.vm=o,s.current({action:"update"}),!0)},setAnimate(t){c=t,s.current({action:"setAnimate",payload:t})},async testStep(){u=!0;let t=!1;try{return t=await i.step(),s.current({action:"testStep"}),t&&s.current({action:"testFinished"}),c&&s.current({action:"update"}),t}catch(n){return e(`Runtime error: ${n.message}`),s.current({action:"setValid",payload:!1}),!0}},step(){u=!0;try{let t=!1;const e=o.step();return void 0!==e&&(t=!0,s.current({action:"setExitCode",payload:e})),c&&s.current({action:"update"}),t}catch(t){return e(`Runtime error: ${t.message}`),s.current({action:"setValid",payload:!1}),!0}},reset(){u=!0,i.reset(),o.reset(),s.current({action:"update"}),s.current({action:"setExitCode",payload:void 0}),s.current({action:"setValid",payload:!0})},toggleUseTest(){a=!a,s.current({action:"update"})},initialize(){this.setVm(p)}};return{initialState:{vm:T(i,s,e,!0),controls:{exitCode:void 0,runningTest:!1,animate:!0,valid:!0},test:{highlight:void 0,path:"/"},files:{vm:"",tst:L,cmp:"",out:""}},reducers:d,actions:h}}(t,e,0,s)),[t,e,n,s]),[c,u]=(0,l.A)(i,r);return s.current=u,{state:c,dispatch:s,actions:a}}var E=n(1091),j=n(270),N=n(2675),w=n(4280),O=n(9267),V=n(782);const P={[j.X.SYS_WAIT_DURATION_NOT_POSITIVE]:r.Ru._("Duration must be positive (Sys.wait)"),[j.X.ARRAY_SIZE_NOT_POSITIVE]:r.Ru._("Array size must be positive (Array.new)"),[j.X.DIVIDE_BY_ZERO]:r.Ru._("Division by zero (Math.divide)"),[j.X.SQRT_NEG]:r.Ru._("Cannot compute square root of a negative number (Math.sqrt)"),[j.X.ALLOC_SIZE_NOT_POSITIVE]:r.Ru._("Allocated memory size must be positive (Memory.alloc)"),[j.X.HEAP_OVERFLOW]:r.Ru._("Heap overflow (Memory.alloc)"),[j.X.ILLEGAL_PIXEL_COORD]:r.Ru._("Illegal pixel coordinates (Screen.drawPixel)"),[j.X.ILLEGAL_LINE_COORD]:r.Ru._("Illegal line coordinates (Screen.drawLine)"),[j.X.ILLEGAL_RECT_COORD]:r.Ru._("Illegal rectangle coordinates (Screen.drawRectangle)"),[j.X.ILLEGAL_CENTER_COORD]:r.Ru._("Illegal center coordinates (Screen.drawCircle)"),[j.X.ILLEGAL_RADIUS]:r.Ru._("Illegal radius (Screen.drawCircle)"),[j.X.STRING_LENGTH_NEG]:r.Ru._("Maximum length must be non-negative (String.new)"),[j.X.GET_CHAR_INDEX_OUT_OF_BOUNDS]:r.Ru._("String index out of bounds (String.charAt)"),[j.X.SET_CHAR_INDEX_OUT_OF_BOUNDS]:r.Ru._("String index out of bounds (String.setCharAt)"),[j.X.STRING_FULL]:r.Ru._("String is full (String.appendChar)"),[j.X.STRING_EMPTY]:r.Ru._("String is empty (String.eraseLastChar)"),[j.X.STRING_INSUFFICIENT_CAPACITY]:r.Ru._("Insufficient string capacity (String.setInt)"),[j.X.ILLEGAL_CURSOR_LOCATION]:r.Ru._("Illegal cursor location (Output.moveCursor)")},M=()=>{const{state:t,actions:e,dispatch:n}=C(),{setStatus:r}=(0,o.useContext)(d.L),[m,p]=(0,l.b)(t.files.tst),[h,f]=(0,l.b)(t.files.out),[g,v]=(0,l.b)(t.files.cmp),[S,I]=(0,o.useState)("/");(0,o.useEffect)((()=>{e.initialize()}),[e]),(0,o.useEffect)((()=>{e.loadTest(S,m,g),e.reset()}),[m,g]),(0,o.useEffect)((()=>{void 0!==t.controls.exitCode&&r(0==t.controls.exitCode?"Program halted":`Program exited with error code ${t.controls.exitCode}${(0,j.U)(t.controls.exitCode)?`: ${P[t.controls.exitCode]}`:""}`)}),[t.controls.exitCode]);const b=(0,o.useRef)(),x=(0,o.useRef)(),[y,R]=(0,o.useState)(!1);(0,o.useEffect)((()=>(b.current=new class extends E.M{async tick(){return e.step()}finishFrame(){n.current({action:"update"})}reset(){r("Reset"),e.reset()}toggle(){n.current({action:"update"})}},x.current=new class extends E.M{async tick(){return e.testStep()}finishFrame(){n.current({action:"update"})}reset(){r("Reset"),e.reset()}toggle(){n.current({action:"update"})}},R(!0),()=>{var t,e;null===(t=b.current)||void 0===t||t.stop(),null===(e=x.current)||void 0===e||e.stop()})),[e,n]);const _=(0,o.useRef)(null),A=(0,o.useRef)(null),T=async t=>{var n;if(null===(n=t.target.files)||void 0===n||!n.length)return void r("No file selected");r("Loading");const s=[];for(const e of t.target.files)e.name.endsWith(".vm")&&s.push({name:e.name.replace(".vm",""),content:await e.text()});if(0==s.length)return void r("No .vm file was selected");const o=e.loadVm(s);e.reset(),o&&r("Loaded vm file")},M=t=>{e.setAnimate(t<=2)},k=(0,o.useRef)(),[G,U]=(0,o.useState)(1);return(0,V.jsxs)("div",{className:"Page VmPage grid "+(0==G?"no-screen":2==G?"large-screen":"normal"),children:[(0,V.jsx)(w.Z,{className:"program",header:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)("div",{className:"flex-0",style:{whiteSpace:"nowrap"},children:(0,V.jsx)(s.x6,{id:"VM Code"})}),(0,V.jsx)("div",{className:"flex-1",children:y&&b.current&&(0,V.jsx)(u.T,{prefix:(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)("button",{className:"flex-0",onClick:()=>{var t;null===(t=_.current)||void 0===t||t.click()},"data-tooltip":"Load file","data-placement":"bottom",children:"\ud83d\udcc4"}),(0,V.jsx)("button",{className:"flex-0",onClick:()=>{var t;null===(t=A.current)||void 0===t||t.click()},"data-tooltip":"Load directory","data-placement":"bottom",children:"\ud83d\udcc2"})]}),runner:b.current,disabled:!t.controls.valid,onSpeedChange:M})}),(0,V.jsx)("input",{type:"file",style:{display:"none"},ref:_,onChange:T}),(0,V.jsx)("input",{type:"file",webkitdirectory:"",style:{display:"none"},ref:A,onChange:T})]}),children:(0,V.jsx)(N.K,{value:t.files.vm,onChange:t=>{e.setVm(t)},language:"vm",highlight:t.controls.valid&&t.vm.showHighlight?t.vm.highlight:void 0,error:t.controls.error})}),(0,V.jsx)(w.Z,{className:"vm",header:(0,V.jsx)(s.x6,{id:"VM Structures"}),children:t.controls.valid&&t.vm.Stack.length>0&&(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(X,{statics:t.vm.Statics,temp:t.vm.Temp,frame:t.vm.Stack[0]}),(0,V.jsx)(F,{stack:t.vm.Stack,addedSysInit:t.vm.AddedSysInit})]})}),(0,V.jsxs)(w.Z,{className:"display",style:{gridArea:"display"},children:[(0,V.jsx)(c.f,{memory:t.vm.Screen,showScaleControls:!0,onScale:t=>{U(t)}}),(0,V.jsx)(i.s,{keyboard:t.vm.Keyboard})]}),(0,V.jsx)(a.Ay,{ref:k,name:"RAM",memory:t.vm.RAM,initialAddr:256,format:"dec",showUpload:!1,showClear:!1}),(0,V.jsx)(a.Ay,{name:"RAM",className:"Stack",memory:t.vm.RAM,format:"dec",cellLabels:["SP:","LCL:","ARG:","THIS:","THAT:","TEMP0:","TEMP1:","TEMP2:","TEMP3:","TEMP4:","TEMP5:","TEMP6:","TEMP7:","R13:","R14:","R15:"],showUpload:!1,onChange:()=>{var t;null===(t=k.current)||void 0===t||t.rerender()}}),y&&(0,V.jsx)(O.B,{runner:x,tst:[m,p,t.test.highlight],out:[h,f],cmp:[g,v],setPath:I,showClear:!0,defaultTst:L,onSpeedChange:M,disabled:!t.controls.valid})]})},k="Unknown function";function G(t,e){const n={};t=t.filter((t=>{var e;return(null===(e=t.fn)||void 0===e?void 0:e.name)!=R.IG}));for(const r of t)r.fn&&(n[r.fn.name]?n[r.fn.name]++:n[r.fn.name]=1);const s=t.slice().reverse().map((t=>{var n,s,r;return(null===(n=t.fn)||void 0===n?void 0:n.name)==R.h0.name?e?`${R.h0.name} (built-in)`:R.h0.name:null!==(s=null===(r=t.fn)||void 0===r?void 0:r.name)&&void 0!==s?s:k}));for(const r of Object.keys(n))if(1!=n[r]){n[r]=0;for(let t=0;t<s.length;t++)s[t]===r&&(s[t]=`${r}[${n[r]}]`,n[r]++)}return s}function F({stack:t,addedSysInit:e}){return(0,V.jsx)("section",{children:(0,V.jsxs)("p",{children:["Call-stack:",(0,V.jsx)("code",{children:G(t,e).join(" > ")})]})})}function X({statics:t,temp:e,frame:n}){var s,r,o,i,a,c,l;return(0,V.jsx)("section",{children:(0,V.jsxs)("main",{children:[(0,V.jsxs)("p",{children:["Stack:",(0,V.jsxs)("code",{children:["[",n.stack.values.join(", "),"]"]})]}),(null===(s=n.usedSegments)||void 0===s?void 0:s.has("local"))&&(0,V.jsxs)("p",{children:["local:",(0,V.jsxs)("code",{children:["[",n.locals.values.join(", "),"]"]})]}),(null===(r=n.usedSegments)||void 0===r?void 0:r.has("argument"))&&(0,V.jsxs)("p",{children:["argument:",(0,V.jsxs)("code",{children:["[",n.args.values.join(", "),"]"]})]}),(null===(o=n.usedSegments)||void 0===o?void 0:o.has("static"))&&(0,V.jsxs)("p",{children:["static:",(0,V.jsxs)("code",{children:["[",t.join(", "),"]"]})]}),(null===(i=n.usedSegments)||void 0===i?void 0:i.has("pointer"))&&(0,V.jsxs)("p",{children:["pointer:",(0,V.jsxs)("code",{children:["[",`${n.frame.THIS}, ${n.frame.THAT}`,"]"]})]}),(null===(a=n.usedSegments)||void 0===a?void 0:a.has("this"))&&(0,V.jsxs)("p",{children:["this:",(0,V.jsxs)("code",{children:["[",n.this.values.join(", "),"]"]})]}),(null===(c=n.usedSegments)||void 0===c?void 0:c.has("that"))&&(0,V.jsxs)("p",{children:["that:",(0,V.jsxs)("code",{children:["[",n.that.values.join(", "),"]"]})]}),(null===(l=n.usedSegments)||void 0===l?void 0:l.has("temp"))&&(0,V.jsxs)("p",{children:["temp:",(0,V.jsxs)("code",{children:["[",e.join(", "),"]"]})]})]})})}},4256:(t,e,n)=>{n.d(e,{X:()=>r});var s=n(7076);class r extends s.qN{dispatch;constructor(t,e){super(t,t.size,0),this.dispatch=e}async load(t,e){await super.load(t,e),this.dispatch.current({action:"update"})}}},4641:(t,e,n)=>{n.d(e,{V:()=>s});const s=t=>{if((t=>"function"===typeof t?.toString||"string"===typeof t)(t)){const e=t.toString();return"[object Object]"===e?JSON.stringify(t):e}return JSON.stringify(t)}},3376:(t,e,n)=>{n.d(e,{V:()=>r});var s=n(8281);function r(t,e){return void 0===t&&void 0!==s.UL[e]&&(t=e),{..."inline"===e?{display:"inline-block"}:{},width:s.UL[t]??"0"}}}}]);