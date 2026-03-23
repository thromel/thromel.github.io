---
layout: showcase
title: "Yet Another C Compiler"
subtitle: "A complete multi-pass compiler for a subset of C"
category: projects
group: Projects
show: true
width: 8
date: 2022-04-15 00:00:00 +0800
excerpt: A sophisticated multi-pass compiler for a subset of C programming language, featuring lexical analysis, syntax analysis, semantic analysis, intermediate code generation, and assembly optimization.
thumbnail: /assets/images/projects/compiler-thumbnail.png
featured: true
technologies:
  - C++
  - Flex
  - Bison
  - Assembly
  - Compiler Design
---

# Building a C Compiler: A Comprehensive Guide to Intermediate Code Generation

## Introduction to Compiler Design

A compiler transforms source code written in a high-level programming language (like C) into executable machine code that can be directly understood by the computer's processor. This transformation is complex and involves multiple stages, each with its own theoretical foundations and practical implementations.

Before diving into the specific components of our compiler project, let's establish some foundational concepts.

### The Compilation Process

A typical compiler operates in several phases:

1. **Lexical Analysis**: Breaking down the source code into tokens (identifiers, keywords, operators, etc.)
2. **Syntax Analysis**: Organizing these tokens into a hierarchical structure that represents the grammatical structure of the program
3. **Semantic Analysis**: Checking if the program makes logical sense (type checking, scope checking, etc.)
4. **Intermediate Code Generation**: Creating a representation that's closer to machine code but still independent of specific hardware
5. **Code Optimization**: Improving the intermediate code to make it more efficient
6. **Code Generation**: Translating the optimized intermediate code into machine code

Now, let's explore each component of our compiler in detail.

## Lexical Analysis: Tokenizing the Source Code

### Theoretical Background

Lexical analysis is based on the theory of **regular languages** and **finite automata**. Regular expressions define patterns for tokens, and these patterns are converted into finite state machines that can efficiently recognize tokens in the input stream.

The lexical analyzer (or scanner) reads the source code character by character and groups them into meaningful units called tokens. Each token has:
- A **type** (e.g., identifier, keyword, operator)
- A **value** (the actual text)
- Often, position information (line number, column number)

### Implementation with Flex

Our project uses Flex (a modern version of the classic Lex tool) to generate the lexical analyzer. Here's an in-depth look at how we define tokens:

```c
%option noyywrap

%{
#include "LexUtils.h"
#include<iostream>
#include<string.h>
#include<stdio.h>
using namespace std;

FILE *input;
%}

NEWLINE \r?\n
NOT_NEWLINE ([^\r\n])
WHITESPACE [ \t\f\r\v]+

LETTER [a-zA-Z]
DIGIT [0-9]

ALPHABET {LETTER}|_
ALPHANUM {ALPHABET}|{DIGIT}

ID {ALPHABET}({ALPHANUM})*
INTEGER {DIGITS}
FLOAT ({INTEGER})?(\.?{DIGITS}*)([Ee][+-]?{INTEGER})?

%%

{COMMENT} |
{STAR_COMMENT} {handle_comment(yytext);}

"if" {return IF;}
"else" {return ELSE;}
"for" {return FOR;}
// More keywords...

{INTEGER} {handle_const_int(yytext); return CONST_INT;}
{FLOAT} {handle_const_float(yytext); return CONST_FLOAT;}
{ID} {handle_id(yytext); return ID;}

{ADDOP} {handle_operator(yytext, "ADDOP"); return ADDOP;}
// More operators...

{NEWLINE} {line_count++;}
{WHITESPACE} {}
. {handle_error(yytext, "Unrecognized character");}
%%
```

Let's break down what's happening here:

1. The `%{...%}` section contains C/C++ code that will be included in the generated scanner.
2. Definitions like `LETTER [a-zA-Z]` create named patterns.
3. In the rules section (`%%`), we define what action to take when a pattern is matched.

For example, when the scanner encounters "if", it returns the token IF to the parser. When it finds an identifier that matches the pattern `{ID}`, it calls `handle_id(yytext)` and returns ID.

The functions like `handle_const_int()` and `handle_id()` create SymbolInfo objects for the tokens and set their attributes. These objects are then passed to the parser.

### Token Processing

When the scanner recognizes a token, it creates a SymbolInfo object with the token's attributes:

```c
void handle_const_int(char *str) {
    string s(str);
    assignSymbol("CONST_INT");
}

void assignSymbol(string type) {
    yylval.symbol = new SymbolInfo((string)yytext, type);
}
```

This creates a new SymbolInfo object with the token's text and type, and assigns it to `yylval.symbol`, which the parser will access.

## Parsing: Building the Syntax Tree

### Theoretical Background

Parsing is based on the theory of **context-free grammars** (CFGs) and **pushdown automata**. A CFG consists of:
- Terminal symbols (tokens)
- Non-terminal symbols (syntactic categories)
- Production rules (defining how non-terminals can be expanded)
- A start symbol

The parser uses these rules to determine if the input sequence of tokens forms a valid program according to the grammar, and if so, to build a parse tree or abstract syntax tree (AST).

There are two main parsing approaches:
- **Top-down parsing**: Start from the root (start symbol) and try to derive the input (e.g., LL parsing)
- **Bottom-up parsing**: Start from the input and try to reduce it to the start symbol (e.g., LR parsing)

### Implementation with Bison

Our project uses Bison (a modern version of the classic Yacc tool) to generate the parser. Bison generates LALR(1) parsers, which are a type of bottom-up parser.

Here's a detailed look at our grammar definition:

```c
%{
#ifndef PARSER
#define PARSER
#include "ParserUtils.h"
#endif

int yyparse(void);
int yylex(void);
extern FILE *yyin;
extern SymbolTable st;
%}

%union{
SymbolInfo* symbol;
}

%token IF FOR DO INT FLOAT VOID SWITCH DEFAULT ELSE WHILE BREAK CHAR DOUBLE RETURN CASE CONTINUE
%token INCOP DECOP NOT
%token LPAREN RPAREN LCURL RCURL LTHIRD RTHIRD COMMA SEMICOLON
%token PRINTLN
%token STRING

%token <symbol> ID
%token <symbol> CONST_INT
%token <symbol> CONST_FLOAT
%token <symbol> CONST_CHAR
%token <symbol> ADDOP
%token <symbol> MULOP
%token <symbol> LOGICOP
%token <symbol> RELOP
%token <symbol> BITOP
%token <symbol> ASSIGNOP

%type <symbol> program
%type <symbol> unit
// More non-terminal types...

%nonassoc second_prec
%nonassoc ELSE

%%

start : program
    {
        if (!error_count){
            cout<<"No error, generating assembly code"<<endl;
            addDataSegment();
            startCodeSegment();
            printCode($$);
            addPrintFunc();
            endCodeSegment();
            optimize();
        }    
    }
    ;

program : program unit 
    {
        $$ = new SymbolInfo($1->getName() + "\n" + $2->getName(), "NON_TERMINAL");
        $$->setCode($1->getCode() + "\n" +$2->getCode());
        printRule("program : program unit");
        printSymbol($$);
    }
    | unit
    {
        $$ = $1;
        $$->setCode($1->getCode());
        printRule("program : unit");
        printSymbol($$);
        st.printAll();
    }
    ;
    
// More grammar rules...
%%
```

Let's examine what's happening here:

1. The `%{...%}` section contains C/C++ code that will be included in the generated parser.
2. The `%union` declaration specifies the type of semantic values (in our case, SymbolInfo pointers).
3. The `%token` and `%type` declarations specify the types of tokens and non-terminals.
4. The `%%` section contains the grammar rules, with semantic actions enclosed in braces.

### Grammar Rules and Semantic Actions

Let's look at a more complex rule, the if-statement:

```c
statement : IF LPAREN expression RPAREN statement %prec second_prec
        {
            $$ = handle_if($3, $5);
            printRule("IF LPAREN expression RPAREN statement");
            printSymbol($$);
        }
        | IF LPAREN expression RPAREN statement ELSE statement
        {
            $$ = handle_if_else($3, $5, $7);
            printRule("IF LPAREN expression RPAREN statement ELSE statement");
            printSymbol($$);
        }
```

This rule says that a statement can be an if-statement without an else clause (`IF LPAREN expression RPAREN statement`) or an if-else statement (`IF LPAREN expression RPAREN statement ELSE statement`).

The `%prec second_prec` part resolves the classic "dangling else" ambiguity by specifying that this rule has lower precedence than the ELSE token.

The semantic actions (code in braces) create a new SymbolInfo object for the statement, generate code for it, and log the rule application for debugging.

### Parse Tree Construction

As the parser recognizes grammatical constructs, it builds a parse tree (implicitly, through the semantic values). Each node in the tree is a SymbolInfo object that contains:
- The textual representation of the construct
- Its type (e.g., "NON_TERMINAL")
- The generated code for that construct
- Other attributes specific to the construct

## Symbol Table: Managing Identifiers and Scopes

### Theoretical Background

A symbol table is a data structure used by compilers to keep track of identifiers (variables, functions, etc.) and their attributes (type, scope, etc.). It must support operations like:
- Insert a symbol with its attributes
- Look up a symbol to retrieve its attributes
- Handle scopes (blocks of code with their own local symbols)
- Check if a symbol is already defined in the current scope

Symbol tables can be implemented using various data structures like hash tables, trees, or lists, with hash tables being the most common due to their efficiency.

### Implementation

Our project uses a sophisticated symbol table that supports multiple scopes and has specialized handling for different types of symbols:

```c
class SymbolTable {
    ScopeTable *current = NULL;
    ofstream *log;

public:
    SymbolTable(ofstream *log) {
        this->log = log;
        enterScope();
    }

    void enterScope(int buckets = SYMBOL_TABLE_SIZE) {
        ScopeTable *st = new ScopeTable(buckets, current, log);
        current = st;
        *log << "\nNew ScopeTable #" << st->getID() << " created" << endl;
    }

    void exitScope() {
        if (current == NULL) {
            return;
        }
        ScopeTable *temp = current;
        current = current->getParentScope();
        delete temp;
    }

    bool insertSymbol(string name, string type) {
        if (current == NULL) {
            return false;
        }
        return current->insertSymbol(name, type);
    }

    bool insertSymbol(SymbolInfo* symbol) {
        if (symbol->getIdType() == "VARIABLE" || symbol->getIdType() == "ARRAY") 
            symbol->setAsmVar(symbol->getName()+current->getID());

        if (current == NULL){
            return false;
        }
        return current->insertSymbol(symbol);
    }

    SymbolInfo *lookup(string name) {
        if (current == NULL) {
            return NULL;
        }

        ScopeTable *temp = current;
        SymbolInfo *symbol = NULL;

        while (temp != NULL) {
            symbol = temp->lookUp(name);
            if (symbol != NULL) {
                return symbol;
            }
            temp = temp->getParentScope();
        }
        return NULL;
    }

    // More methods...
};
```

### Scope Management

A key aspect of the symbol table is scope management. When the parser enters a new block (e.g., a function body or a compound statement), it creates a new scope table:

```c
inline void enterScope() {
    st.enterScope();
    if (currentFunction != "") {
        SymbolInfo *funcVal = st.lookup(currentFunction);
        for (param p : paramList) {
            SymbolInfo *sym = new SymbolInfo(p.name, "ID");
            sym->setIdType("VARIABLE");
            for (auto &c : p.type)
                c = toupper(c);
            sym->setVarType(p.type);
            insertSymbol(sym);
            asmVarList.push_back(sym->getAsmVar());
            funcVal->paramSymList.push_back(sym);
        }

        if (currentFunction != "main") {
            // Set up function prologue and epilogue
            funcVal->setFuncStart(funcVal->getName() + " PROC\n");
            funcVal->setFuncStart(funcVal->getFuncStart() + "\n" + "POP return_loc");
            for (int i = funcVal->paramSymList.size() - 1; i >= 0; --i) {
                funcVal->setFuncStart(funcVal->getFuncStart() + "\nPOP " +
                                    funcVal->paramSymList[i]->getAsmVar());
            }
            funcVal->setFuncStart(funcVal->getFuncStart() + "\nPUSH BX\nPUSH DX\n");
            funcVal->setFuncEnd(funcVal->funcEndLabel + ": \n" +
                                "POP DX\nPOP BX\nPUSH return_loc\nRET\n" +
                                funcVal->getName() + " ENDP\n\n");
        }
        paramList.clear();
    }
}
```

When it exits a block, it removes the current scope table:

```c
inline void exitScope() {
    st.printAll();
    st.exitScope();
}
```

### Symbol Information

Each symbol in the table is represented by a SymbolInfo object, which contains detailed information about the symbol:

```c
class SymbolInfo {
    string name = "";
    string type = "";
    string idType = "";  // FUNCTION, VARIABLE, ARRAY
    string varType = ""; // INT, FLOAT, VOID
    string returnType = ""; // INT, FLOAT, VOID
    bool funcDefined = false;
    int arrSize = 0;
    int arrIndex = 0;
    int defaultInt = -1;
    float defaultFloat = -1.0;
    SymbolInfo *next;
    string code = " ";
    string asmVar = "";
    bool isConst = false;
    string funcStart;
    string funcEnd;
    vector<string> asmVarList;

public:
    vector<int> intData;
    vector<float> floatData;
    bool isDummy = false;
    SymbolInfo *real = NULL;
    vector<SymbolInfo *> paramSymList;
    vector<SymbolInfo *> varList;
    string funcEndLabel = "";
    string arrAsmVar = "";
    bool isFunctionCall = false;

    // Methods...
};
```

This rich structure allows the compiler to handle complex language features like arrays, functions with parameters, and type checking.

## Type Checking and Semantic Analysis

### Theoretical Background

Type checking ensures that operations are applied to compatible operands. For example, you can't add a string to a number or call a non-function. Type systems can be:
- **Static** (checked at compile time) vs. **dynamic** (checked at runtime)
- **Strong** (few implicit conversions) vs. **weak** (many implicit conversions)
- **Nominal** (type names matter) vs. **structural** (structure matters)

C has a static, relatively weak, nominal type system.

### Implementation

Our compiler performs type checking during parsing. For example, when handling binary operations:

```c
inline SymbolInfo *handleADDOP(SymbolInfo *sym1, SymbolInfo *op, SymbolInfo *sym2) {
    SymbolInfo *result = new SymbolInfo("", "");

    if (sym1->getVarType() == "VOID" || sym2->getVarType() == "VOID") {
        printError("Operand of void type");
        return nullSym();
    }

    if (sym1->getVarType() == "FLOAT" || sym2->getVarType() == "FLOAT") {
        result->setVarType("FLOAT");
    } else {
        result->setVarType("INT");
    }
    result->setIdType("VARIABLE");

    // Code generation...
    
    return result;
}
```

This function checks that neither operand is void, determines the result type based on the operand types, and generates appropriate code.

## Intermediate Code Generation

### Theoretical Background

Intermediate code is a representation of the program that's lower-level than the source code but higher-level than machine code. Common forms include:
- **Three-address code**: Operations with at most three operands per instruction
- **Static single assignment (SSA)**: Each variable is assigned exactly once
- **Abstract syntax tree (AST)**: A tree representation of the program
- **Control flow graph (CFG)**: A graph showing the flow of control

Our compiler generates a form of three-address code, which is then translated to x86 assembly.

### Register Allocation

An important aspect of code generation is register allocation: deciding which values to keep in registers and which to store in memory. Our compiler uses a simple approach where temporary values are assigned to registers or memory locations:

```c
class VarManager {
    int size = 0;
    stack<string> free;

public:
    string getTempVar() {
        string tempVar;
        if (free.empty()) {
            tempVar = "temp" + to_string(size);
            size++;
            asmVarList.push_back(tempVar);
        } else {
            tempVar = free.top();
            free.pop();
        }
        return tempVar;
    }

    void freeTempVar(string tempVar) {
        if (tempVar.substr(0, 4) == "temp") {
            free.push(tempVar);
        }
    }

    int getSize() { return size; }
};
```

This class manages temporary variables, reusing them when possible to minimize memory usage.

### Code Generation for Different Constructs

Let's look at how our compiler generates code for various language constructs:

#### Variables and Array Accesses

```c
inline SymbolInfo *getArrayIndexVar(SymbolInfo *arr, SymbolInfo *index) {
    SymbolInfo *arrIdxVar = st.lookup(arr->getName());
    SymbolInfo *var;
    
    // Error checking...
    
    var = new SymbolInfo(*arrIdxVar);
    var->setArrIndex(index->getIntValue());
    var->setName(arr->getName() + "[" + to_string(index->getIntValue()) + "]");
    var->setReal(arrIdxVar);

    var->addCode(index->getCode());
    var->addCode("MOV BX, " + index->getAsmVar());
    var->addCode("SHL BX, 1");  // Multiply by 2 (size of int)

    if (SIorBX) {
        var->addCode("MOV SI, BX");
        var->setAsmVar(arrIdxVar->getAsmVar() + "[SI]");
    } else {
        var->setAsmVar(arrIdxVar->getAsmVar() + "[BX]");
    }
    vm.freeTempVar(index->getAsmVar());
    var->arrAsmVar = var->getAsmVar();

    SIorBX = !SIorBX;  // Alternate between BX and SI for nested array accesses
    
    return var;
}
```

This function generates code to access an array element. It computes the byte offset (`SHL BX, 1` multiplies by 2 since each int is 2 bytes) and uses either BX or SI as the index register to allow for nested array accesses.

#### Assignment

```c
inline SymbolInfo *handle_assign(SymbolInfo *sym1, SymbolInfo *sym2) {
    SymbolInfo *result;

    // Type checking...

    result = new SymbolInfo(*sym1);
    result->setName(sym1->getName() + "=" + sym2->getName());
    result->setIdType("VARIABLE");

    // Generate code
    if (sym2->getIsConst()) {
        result->setCode(sym1->getCode() + "\n" + sym2->getCode() + "\n" +
                        constToMem(sym1, sym2));
    } else if (sym1->isArray()) {
        result->setCode(sym2->getCode());
        result->addCode(sym1->getCode());
        result->addCode("MOV AX, " + sym2->getAsmVar());
        result->addCode("MOV " + sym1->arrAsmVar + ", AX");
    } else {
        result->setCode(sym1->getCode() + "\n" + sym2->getCode() + "\n" +
                        memToMem(sym1, sym2));
    }

    result->setAsmVar(sym1->getAsmVar());
    vm.freeTempVar(sym2->getAsmVar());
    
    return result;
}
```

This function generates code for assignment statements. It handles different cases (constant values, arrays, variables) and generates appropriate MOV instructions.

#### If-Else Statements

```c
inline SymbolInfo *handle_if_else(SymbolInfo *exp, SymbolInfo *ifstmnt, SymbolInfo *elsestmnt) {
    SymbolInfo *result =
        new SymbolInfo("if(" + exp->getName() + ")" + ifstmnt->getName() +
                        "else " + elsestmnt->getName(),
                    "NON_TERMINAL");

    string label1 = newLabel();  // Label for else part
    string label2 = newLabel();  // Label for end of if-else

    result->setCode(exp->getCode());
    result->addCode("MOV AX, " + exp->getAsmVar());
    result->addCode("CMP AX, 1");
    result->addCode("JNE " + label1);  // Jump to else if condition is false
    result->addCode(ifstmnt->getCode());
    result->addCode("JMP " + label2);  // Skip else part
    result->addCode(label1 + ":");      // Start of else part
    result->addCode(elsestmnt->getCode());
    result->addCode(label2 + ":\n");    // End of if-else
    vm.freeTempVar(exp->getAsmVar());

    return result;
}
```

This function generates code for if-else statements. It creates two labels (one for the else part, one for the end), generates code to evaluate the condition and jump accordingly, and includes the code for both branches.

#### For Loops

```c
inline SymbolInfo *handle_for(SymbolInfo *init, SymbolInfo *termimation, SymbolInfo *inc, SymbolInfo *statement) {
    SymbolInfo *result =
        new SymbolInfo("for(" + init->getName() + termimation->getName() +
                        inc->getName() + ")" + statement->getName(),
                    "NON_TERMINAL");

    string loop = newLabel();      // Start of loop
    string loopExit = newLabel();  // End of loop

    result->addCode(";for loop start");
    result->addCode(init->getCode());     // Initialization
    result->addCode(loop + ":");          // Loop start label
    result->addCode(termimation->getCode()); // Condition
    result->addCode("MOV AX, " + termimation->getAsmVar());
    result->addCode("CMP AX, 0");
    result->addCode("JE " + loopExit);    // Exit if condition is false
    result->addCode(statement->getCode()); // Loop body
    result->addCode(inc->getCode());      // Increment
    result->addCode("JMP " + loop);       // Jump back to start
    result->addCode(loopExit + ":");      // Loop exit label
    result->addCode(";for loop end");
    
    return result;
}
```

This function generates code for for-loops. It creates two labels (loop start and loop exit), generates code for initialization, condition checking, loop body, and increment, and adds jumps to create the loop structure.

#### Function Calls

```c
inline SymbolInfo *handle_function(SymbolInfo *funcVal, SymbolInfo *argList) {
    SymbolInfo *func = st.lookup(funcVal->getName());
    SymbolInfo *sym = new SymbolInfo(
        funcVal->getName() + "(" + argList->getName() + ")", "NON_TERMINAL");

    // Error checking...

    sym->addCode(argList->getCode());

    // Save state for recursive calls
    for (int i = 0; i < func->paramSymList.size(); i++) {
        sym->addCode("PUSH " + func->paramSymList[i]->getAsmVar());
    }
    for (int i = 0; i < func->varList.size(); i++) {
        sym->addCode("PUSH " + func->varList[i]->getAsmVar());
    }
    for (int i = 0; i < vm.getSize(); i++) {
        sym->addCode("PUSH temp" + to_string(i));
    }

    // Push return address and arguments
    sym->addCode("PUSH return_loc");
    for (int i = 0; i < func->paramSymList.size(); i++) {
        sym->addCode("PUSH " + asmArgList[i]);
        vm.freeTempVar(asmArgList[i]);
    }
    asmArgList.clear();

    // Call function
    sym->addCode("CALL " + funcVal->getName());
    sym->addCode("POP return_loc");

    // Restore saved state
    for (int i = vm.getSize() - 1; i >= 0; i--) {
        sym->addCode("POP temp" + to_string(i));
    }
    for (int i = func->varList.size() - 1; i >= 0; i--) {
        sym->addCode("POP " + func->varList[i]->getAsmVar());
    }
    for (int i = func->paramSymList.size() - 1; i >= 0; i--) {
        sym->addCode("POP " + func->paramSymList[i]->getAsmVar());
    }

    sym->isFunctionCall = true;
    sym->setAsmVar("CX");  // Return value in CX
    sym->setIdType("VARIABLE");
    sym->setVarType("INT");
    
    return sym;
}
```

This function generates code for function calls. It saves the current state (for recursive calls), pushes arguments and the return address, calls the function, and restores the state afterward. The function's return value is placed in the CX register.

## Assembly Code Generation and Optimization

### x86 Assembly Basics

x86 assembly language is a low-level programming language specific to the x86 family of processors. It uses:
- **Registers**: Small, fast storage locations in the CPU (AX, BX, CX, DX, SI, DI, BP, SP, etc.)
- **Memory operands**: Addresses in memory, often with complex addressing modes
- **Instructions**: Operations like MOV, ADD, SUB, MUL, DIV, JMP, CALL, etc.
- **Directives**: Instructions to the assembler, like .DATA, .CODE, PROC, ENDP, etc.

### Data Segment

The data segment contains all variables and constants. Our compiler generates it like this:

```c
inline void addDataSegment() {
    code << ".MODEL MEDIUM \n.STACK 100H \n.DATA" << endl << endl;

    asmVarList.push_back("return_loc");
    for (string s : asmVarList) {
        code << s << " DW ?" << endl;
    }

    for (auto p : asmArrList) {
        code << p.first << " DW " << p.second << " DUP (?)" << endl;
    }
}
```

This creates a `.DATA` section with all variables (`DW ?` for uninitialized words) and arrays (`DUP (?)` for arrays of uninitialized words).

### Code Segment

The code segment contains the executable instructions. Our compiler generates it like this:

```c
inline void startCodeSegment() { code << endl << ".CODE" << endl; }

inline void endCodeSegment() { code << endl << "END MAIN\n"; }
```

The `.CODE` directive starts the code segment, and `END MAIN` marks the end of the program, with MAIN as the entry point.

### Function Prologue and Epilogue

Each function needs setup and cleanup code:

```c
// Function prologue
funcVal->setFuncStart(funcVal->getName() + " PROC\n");
funcVal->setFuncStart(funcVal->getFuncStart() + "\n" + "POP return_loc");
for (int i = funcVal->paramSymList.size() - 1; i >= 0; --i) {
    funcVal->setFuncStart(funcVal->getFuncStart() + "\nPOP " +
                        funcVal->paramSymList[i]->getAsmVar());
}
funcVal->setFuncStart(funcVal->getFuncStart() + "\nPUSH BX\nPUSH DX\n");

// Function epilogue
funcVal->setFuncEnd(funcVal->funcEndLabel + ": \n" +
                    "POP DX\nPOP BX\nPUSH return_loc\nRET\n" +
                    funcVal->getName() + " ENDP\n\n");
```

The prologue pops the return address and parameters from the stack, and saves registers BX and DX. The epilogue restores the registers, pushes the return address back onto the stack, and returns.

### Optimization

After generating assembly code, our compiler performs several optimizations:

```c
inline bool optimize_mov(string inst) {
    inst.erase(std::remove(inst.begin(), inst.end(), ','), inst.end());
    vector<string> tokens = split(inst, " ");
    if (tokens.size() == 3 && tokens[0] == "MOV") {
        string movLhs = tokens[1];
        string movRhs = tokens[2];

        if (movLhs == prevMovRhs && movRhs == prevMovLhs) {
            return true;  // Remove redundant MOVs like "MOV AX, BX" followed by "MOV BX, AX"
        } else if (movLhs == "BX") {
            BXval = movRhs;  // Track BX value for arithmetic optimizations
        } else if (movLhs == movRhs) {
            return true;  // Remove MOVs with same source and destination
        }

        prevMovLhs = movLhs;
        prevMovRhs = movRhs;
    }
    return false;
}

inline bool optimize_arithmetic(string inst) {
    inst.erase(std::remove(inst.begin(), inst.end(), ','), inst.end());
    vector<string> tokens = split(inst, " ");

    if (tokens.size() == 3 && (tokens[0] == "ADD" || tokens[0] == "SUB") &&
        tokens[2] == "0") {
        return true;  // Remove ADDs and SUBs with 0
    } else if (tokens.size() == 2 &&
                (tokens[0] == "IMUL" || tokens[0] == "IDIV") && BXval == "1") {
        return true;  // Remove MULs and DIVs by 1
    }

    return false;
}

inline void optimize() {
    ifstream srcFile("code.asm");
    string line;
    int line_count = 0, line_removed = 0;
    vector<string> lines;
    while (std::getline(srcFile, line, '\n')) {
        lines.push_back(line);
    }

    log << "-------------------------------------" << endl;
    log << "Optimizer log: " << endl;

    for (string s : lines) {
        line_count++;

        if (s.substr(0, 1) == "L") {
            // Clear tracking when entering a new label
            prevMovLhs = "";
            prevMovRhs = "";
        }

        if (s == " ") {
            log << "Removed blank line : " << line_count << endl;
            line_removed++;
        } else if (optimize_mov(s)) {
            log << "Optimized redundant MOV operation: " << line_count << endl;
            line_removed++;
        } else if (optimize_arithmetic(s)) {
            log << "Optimized redundant arithmetic operation : " << line_count
                << endl;
            line_removed++;
        } else {
            optimized << s << endl;
        }
    }
    log << "Line removed:" << line_removed << endl;
    log << "-------------------------------------" << endl;
    optimized << "END MAIN" << endl;
    srcFile.close();
}
```

These functions identify and remove:
- Redundant MOV instructions
- Arithmetic operations with identity values (adding 0, multiplying by 1)
- Blank lines

## Testing with Example Programs

Let's examine how our compiler handles a more complex example: a recursive function to calculate Fibonacci numbers.

```c
int fib(int n) {
  if (n <= 1)
    return n;
  return fib(n - 1) + fib(n - 2);
}

int main() {
  int x;
  x = fib(7);
  println(x);
}
```

The compiler will:

1. Parse the function declarations and definitions
2. Generate code for the `fib` function:
   - Evaluate `n <= 1`
   - If true, return n
   - If false, compute `n - 1` and call `fib` recursively
   - Compute `n - 2` and call `fib` recursively
   - Add the results and return
3. Generate code for the `main` function:
   - Declare `x`
   - Call `fib(7)`
   - Assign the result to `x`
   - Print `x`

The recursive calls are particularly challenging because they require saving and restoring the state of the function for each call. Our compiler handles this by:
- Pushing all local variables and parameters onto the stack before each call
- Popping them off the stack after each call returns
- Passing parameters by pushing them onto the stack
- Returning values in the CX register

## Challenges and Best Practices

Building a compiler is a complex task with many challenges:

### Challenge: Error Handling

Compilers must detect and report errors in the source code. Our compiler checks for:
- Lexical errors (invalid tokens)
- Syntax errors (invalid grammar)
- Semantic errors (invalid types, undeclared variables, etc.)

```c
inline void printError(string msg) {
    error << "Error at line no: " << line_count << " - " << msg << endl;
    log << "Error at line no: " << line_count << " - " << msg << endl;
    error_count++;
}

inline void yyerror(const char *s) { printError(s); }
```

### Challenge: Memory Management

Compilers create many temporary objects during compilation, which can lead to memory leaks if not properly managed. Our compiler uses a VarManager class to reuse temporary variables and functions to free resources when they're no longer needed.

### Challenge: Code Generation Complexity

Generating efficient code requires careful consideration of register allocation, control flow, and optimization. Our compiler uses a fairly simple approach, but more advanced compilers might use techniques like:
- Register allocation based on liveness analysis
- Instruction scheduling to minimize stalls
- Peephole optimization to improve instruction sequences
- Loop optimization to reduce iteration overhead
- Inline expansion to eliminate function call overhead

### Best Practice: Modular Design

Our compiler is designed with clear separation of concerns:
- Lexical analysis is handled by Flex and LexUtils
- Parsing is handled by Bison and ParserUtils
- Symbol management is handled by SymbolTable and SymbolInfo
- Code generation is integrated into the parser actions
- Optimization is a separate pass after code generation

This modular approach makes the code easier to understand, maintain, and extend.

## Conclusion

Building a compiler is a challenging but rewarding endeavor that requires deep understanding of programming languages, data structures, algorithms, and computer architecture. Our compiler demonstrates the essential components of a modern compiler:

1. **Lexical analysis** with Flex to break the source code into tokens
2. **Parsing** with Bison to verify the grammar and build a parse tree
3. **Symbol table management** to track variables, functions, and their attributes
4. **Type checking** to ensure operations are applied to compatible operands
5. **Intermediate code generation** to create x86 assembly code
6. **Optimization** to improve the generated code

While our compiler only implements a subset of C, the principles and techniques apply to more complex languages as well. Understanding how compilers work provides invaluable insight into programming languages and computer systems.

## Further Resources

If you're interested in learning more about compilers, here are some excellent resources:

- **"Compilers: Principles, Techniques, and Tools"** by Alfred V. Aho, Monica S. Lam, Ravi Sethi, and Jeffrey D. Ullman (also known as the "Dragon Book")
- **"Engineering a Compiler"** by Keith D. Cooper and Linda Torczon
- **"Modern Compiler Implementation in C"** by Andrew W. Appel
- **"Advanced Compiler Design and Implementation"** by Steven S. Muchnick
- The **LLVM** project: [llvm.org](https://llvm.org/)

These resources provide deeper explorations of compiler theory and practice, from basic concepts to advanced techniques used in modern production compilers.

## Lead Developer | 12-week Project | Systems Programming

<div class="text-end mb-3">
    <a href="https://github.com/thromel/Yet-Another-C-Compiler" target="_blank" class="btn btn-sm btn-outline-dark">
        <i class="fab fa-github"></i> View on GitHub
    </a>
</div>