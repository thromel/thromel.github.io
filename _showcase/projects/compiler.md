---
layout: showcase
title: "Yet Another C Compiler"
subtitle: "A complete multi-pass compiler for a subset of C"
category: projects
group: Projects
show: true
thumbnail: /assets/images/projects/compiler-thumbnail.png
featured: true
technologies:
  - C++
  - Flex
  - Bison
  - Assembly
  - Compiler Design
date: 2022-04-15
---

# Technical Deep Dive: Yet Another C Compiler

## 1. Architecture Overview

The compiler follows a traditional multi-pass architecture with distinct phases:

```
Source Code → Lexical Analysis → Syntax Analysis → Semantic Analysis → Code Generation → Optimization → Assembly Code
```

Each phase is implemented as separate components that communicate through well-defined interfaces:

- **Lexical Analyzer (Scanner)**: Implemented using Flex (`1705069.l`)
- **Syntax Analyzer (Parser)**: Implemented using Bison (`1705069.y`)
- **Symbol Table**: Custom hash-based implementation (`SymbolTable/`)
- **Code Generator**: AST traversal with register allocation (`ParserUtils.h`)
- **Optimizer**: Peephole optimization for assembly (`AsmUtils.h`, `AsmUtils.cpp`)

## 2. Symbol Table Implementation

### Hash Table with Separate Chaining

The symbol table uses a hash table with separate chaining for collision resolution:

```cpp
class ScopeTable {
private:
    SymbolInfo** table;
    ScopeTable* parentScope;
    int id;
    int bucket_size;
    
    int hashFunction(string name) {
        int hash_value = 0;
        for(int i = 0; i < name.length(); i++) {
            hash_value = (hash_value + name[i]) % bucket_size;
        }
        return hash_value;
    }
    // ...
};
```

### Hierarchical Scoping

Scopes are organized hierarchically to support nested blocks:

```cpp
class SymbolTable {
private:
    ScopeTable* current_scope;
    int bucket_size;
    // ...
public:
    void enterScope() {
        ScopeTable* new_scope = new ScopeTable(++scope_count, bucket_size, current_scope);
        current_scope = new_scope;
    }
    
    void exitScope() {
        ScopeTable* to_remove = current_scope;
        current_scope = current_scope->getParentScope();
        delete to_remove;
    }
    // ...
};
```

### Symbol Information

The `SymbolInfo` class stores all attributes needed for compilation:

- Type information (variable, function, array)
- Data type (int, float, char, void)
- Function parameters and return type
- Assembly variables and code segments
- Memory location information

## 3. Lexical Analysis

### Regular Expression Patterns

The lexical analyzer uses complex regular expressions to identify tokens:

```
LETTER [a-zA-Z]
DIGIT [0-9]
ALPHABET {LETTER}|_
ALPHANUM {ALPHABET}|{DIGIT}
ID {ALPHABET}({ALPHANUM})*
```

### Character and String Processing

Special handling for character and string constants includes processing escape sequences:

```cpp
void handle_const_char(char *str, std::string type) {
    std::string s(str);
    // Count newlines in string literals
    size_t n = std::count(s.begin(), s.end(), '\n');
    line_count += (int)n;
    
    // Remove enclosing quotes
    s = replaceFirst(s, "\'", "");
    s = replaceLast(s, "\'", "");
    s = replaceFirst(s, "\"", "");
    s = replaceLast(s, "\"", "");
    
    // Process escape sequences
    s = replaceAll(s, "\\\"", "\"");
    s = replaceAll(s, "\\\n", "\t");
    s = replaceAll(s, "\\n", "\n");
    // ...more escape sequences
}
```

## 4. Parser Implementation

### Context-Free Grammar

The parser uses a context-free grammar to recognize C language constructs:

```
program : program unit | unit
unit : var_declaration | func_definition | func_declaration
func_definition : type_specifier ID LPAREN parameter_list RPAREN compound_statement
compound_statement : LCURL statements RCURL
statement : expression_statement | compound_statement | selection_statement
    | iteration_statement | return_statement
```

### AST Construction

During parsing, an abstract syntax tree is constructed using `SymbolInfo` objects:

```cpp
expression : logic_expression
    {
        $$ = $1;
        printRule("expression : logic_expression");
        printSymbol($$);
    }
    | variable ASSIGNOP logic_expression
    {
        $$ = new SymbolInfo($1->getName() + "=" + $3->getName(), "NON_TERMINAL");
        $$->setCode($3->getCode() + $1->getCode());
        
        // Generate assembly code for assignment
        if($1->isArray()) {
            $$->addCode("MOV AX, " + $3->getAsmVar());
            $$->addCode("MOV " + $1->getAsmVar() + ", AX");
        } else {
            $$->addCode(memToMem($1, $3));
        }
        
        printRule("expression : variable ASSIGNOP logic_expression");
        printSymbol($$);
    }
```

## 5. Intermediate Code Generation

### Register Allocation

The compiler uses a simple register allocation strategy with AX, BX, and temporary variables:

```cpp
class VarManager {
private:
    int size = 0;
    std::stack<std::string> free;

public:
    std::string getTempVar() {
        std::string tempVar;
        if (free.empty()) {
            tempVar = "temp" + std::to_string(size);
            size++;
            asmVarList.push_back(tempVar);
        } else {
            tempVar = free.top();
            free.pop();
        }
        return tempVar;
    }
    
    void freeTempVar(std::string tempVar) {
        if (tempVar.substr(0, 4) == "temp") {
            free.push(tempVar);
        }
    }
};
```

### Assembly Code Generation for Expressions

Expressions are translated to assembly with proper operator precedence:

```cpp
// For binary expressions like a + b
SymbolInfo* term = new SymbolInfo($1->getName() + $2->getName() + $3->getName(), "NON_TERMINAL");
term->setCode($1->getCode() + $3->getCode());

// Generate temp variable for the result
std::string temp = varManager.getTempVar();
term->setAsmVar(temp);

// Generate assembly code based on operator
if ($2->getName() == "+") {
    term->addCode("MOV AX, " + $1->getAsmVar());
    term->addCode("ADD AX, " + $3->getAsmVar());
    term->addCode("MOV " + temp + ", AX");
} else if ($2->getName() == "-") {
    term->addCode("MOV AX, " + $1->getAsmVar());
    term->addCode("SUB AX, " + $3->getAsmVar());
    term->addCode("MOV " + temp + ", AX");
}
```

### Function Call Implementation

Function calls are implemented using the stack-based calling convention:

```cpp
// Function Prologue
funcStart = $2->getName() + " PROC\n";
funcStart += "PUSH BP\n";
funcStart += "MOV BP, SP\n";

// Code for function body here...

// Function Epilogue 
funcEnd = $2->getName() + " ENDP\n";
```

Function calls:

```cpp
// Push parameters in reverse order
for (auto it = args.rbegin(); it != args.rend(); ++it) {
    code += "PUSH " + (*it)->getAsmVar() + "\n";
}

// Call the function
code += "CALL " + func_name + "\n";

// Clean up stack
code += "ADD SP, " + std::to_string(args.size() * 2) + "\n";
```

## 6. Assembly Optimization

### Peephole Optimization

The compiler implements peephole optimization to eliminate redundant instructions:

```cpp
bool optimize_mov(std::string inst) {
    inst.erase(std::remove(inst.begin(), inst.end(), ','), inst.end());
    std::vector<std::string> tokens = split(inst, " ");
    if (tokens.size() == 3 && tokens[0] == "MOV") {
        std::string movLhs = tokens[1];
        std::string movRhs = tokens[2];

        // Eliminate self-assignment (MOV AX, AX)
        if (movLhs == movRhs) {
            return true;
        }
        
        // Eliminate redundant moves (MOV AX, BX followed by MOV BX, AX)
        if (movLhs == prevMovRhs && movRhs == prevMovLhs) {
            return true;
        }
        
        // Track BX for IMUL/IDIV optimization
        if (movLhs == "BX") {
            BXval = movRhs;
        }

        prevMovLhs = movLhs;
        prevMovRhs = movRhs;
    }
    return false;
}
```

### Arithmetic Optimization

The compiler optimizes arithmetic operations with identity elements:

```cpp
bool optimize_arithmetic(std::string inst) {
    inst.erase(std::remove(inst.begin(), inst.end(), ','), inst.end());
    std::vector<std::string> tokens = split(inst, " ");

    // Eliminate addition/subtraction by zero
    if (tokens.size() == 3 && (tokens[0] == "ADD" || tokens[0] == "SUB") &&
        tokens[2] == "0") {
        return true;
    } 
    
    // Eliminate multiplication/division by one
    else if (tokens.size() == 2 &&
             (tokens[0] == "IMUL" || tokens[0] == "IDIV") && BXval == "1") {
        return true;
    }

    return false;
}
```

## 7. Memory Management

### Data Segment Organization

The data segment contains all variables, arrays, and temporaries:

```cpp
inline void addDataSegment() {
    code << ".MODEL MEDIUM \n.STACK 100H \n.DATA" << std::endl << std::endl;

    // Add return location for functions
    asmVarList.push_back("return_loc");
    
    // Add all variables including temporaries
    for (std::string s : asmVarList) {
        code << s << " DW ?" << std::endl;
    }

    // Add arrays with proper dimensions
    for (auto p : asmArrList) {
        code << p.first << " DW " << p.second << " DUP (?)" << std::endl;
    }
}
```

### Array Access

Array access is implemented by calculating the offset and indexing:

```cpp
// For array access like arr[idx]
SymbolInfo* variable = new SymbolInfo($1->getName() + "[" + $3->getName() + "]", "NON_TERMINAL");
variable->setCode($3->getCode());

// Calculate array index
variable->addCode("MOV BX, " + $3->getAsmVar());
variable->addCode("SHL BX, 1");  // Multiply by 2 for word size
variable->setAsmVar($1->getName() + "[BX]");
```

## 8. Error Handling and Recovery

### Lexical Error Detection

The scanner detects and reports lexical errors like invalid identifiers:

```cpp
void handle_error(char *str, std::string msg) {
    std::string s(str);
    log << "\n"
        << "Lexical Error at line no: " << line_count << ". " << msg << ": " << s << std::endl;
    lex_err_count++;

    // Count newlines in error tokens to maintain line counting
    size_t n = std::count(s.begin(), s.end(), '\n');
    line_count += (int)n;
}
```

### Syntax Error Recovery

The parser uses error productions to recover from syntax errors:

```
declaration_list : declaration_list COMMA ID
    | declaration_list COMMA ID LTHIRD CONST_INT RTHIRD
    | ID
    | ID LTHIRD CONST_INT RTHIRD
    | declaration_list COMMA error {
        printError("Invalid variable declaration");
    }
```

### Semantic Error Checking

Semantic checks are performed during parsing:

```cpp
// Type checking for function calls
if (func->isFunction()) {
    if (func->paramSymList.size() != args.size()) {
        printError("Parameter count mismatch in function call");
        error_count++;
    } else {
        for (int i = 0; i < args.size(); i++) {
            if (func->paramSymList[i]->getVarType() != args[i]->getVarType()) {
                printError("Parameter type mismatch in function call");
                error_count++;
                break;
            }
        }
    }
} else {
    printError("Not a function");
    error_count++;
}
```

## 9. Performance Considerations

### Minimizing Memory Usage

The compiler reuses temporary variables to minimize memory consumption:

```cpp
void freeTempVar(std::string tempVar) {
    if (tempVar.substr(0, 4) == "temp") {
        free.push(tempVar);
    }
}
```

### Optimization Impact

The peephole optimizer significantly reduces code size by eliminating redundant instructions:

```
Optimizer log:
Line removed: 127
-------------------------------------
```

### Hash Function Selection

The symbol table uses a simple but effective hash function to minimize collision:

```cpp
int hashFunction(string name) {
    int hash_value = 0;
    for(int i = 0; i < name.length(); i++) {
        hash_value = (hash_value + name[i]) % bucket_size;
    }
    return hash_value;
}
```

## 10. Assembly Output Format

The final assembly output is formatted for MASM compatibility:

```assembly
.MODEL MEDIUM 
.STACK 100H 
.DATA

variable_1 DW ?
array_1 DW 10 DUP (?)
temp0 DW ?
temp1 DW ?
return_loc DW ?

.CODE
main PROC
    MOV AX, @DATA
    MOV DS, AX
    
    ; Code generated for statements
    
    MOV AX, 0    ; return 0
    MOV AH, 4CH
    INT 21H
main ENDP

; Additional procedures and utility functions

END MAIN
```

This technical deep dive demonstrates the sophisticated architecture and implementation details of the Yet Another C Compiler, highlighting the algorithms, data structures, and optimization techniques that make it an effective compiler for a subset of the C language.
