const asm = `
ASM <: Base {
  Root := ASM
  ASM = intermediateInstruction* instruction?
  
  instruction = label|aInstruction|cInstruction
  intermediateInstruction = instruction space+

  label = openParen identifier closeParen
  aInstruction = at (identifier | decNumber)
  cInstruction = assign? op jmp?
  
  assign = (
      "AMD"
      | "AM"
      | "AD"
      | "MD"
      | "M"
      | "D"
      | "A"
      ) equal
      
  op =
      | "0" | "1" | "-1"
      | "!D" | "!A" | "!M"
      | "-D" | "-A" | "-M"
      | "D+1" | "A+1" | "M+1"
      | "D-1" | "A-1" | "M-1"
      | "D+A" | "D+M"
      | "D-A" | "D-M"
      | "A-D" | "M-D"
      | "D&A" | "D&M"
      | "D|A" | "D|M"
      | "D" | "A" | "M"


  jmp = semi ("JGT" | "JEQ" | "JGE" | "JLT" | "JNE" | "JLE" | "JMP")
}`;
export default asm;
