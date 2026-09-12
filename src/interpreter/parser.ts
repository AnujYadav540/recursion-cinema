/**
 * Java Parser using Chevrotain
 * 
 * Parses Java source code into an Abstract Syntax Tree (AST).
 * Supports class declarations, methods, control flow, and expressions.
 * 
 * _Requirements: 5.1, 5.9_
 */

import { CstParser, IToken } from 'chevrotain';
import {
  allTokens,
  Public, Private, Protected, Static, Final, Class, Void, Int, Boolean, Char, String,
  If, Else, While, For, Return, New, True, False, Null,
  LessEqual, GreaterEqual, Equal, NotEqual, Less, Greater,
  And, Or, Not,
  PlusAssign, MinusAssign, MultiplyAssign, DivideAssign, Assign,
  Increment, Decrement,
  Plus, Minus, Multiply, Divide, Modulo,
  LParen, RParen, LBrace, RBrace, LBracket, RBracket,
  Semicolon, Comma, Dot,
  IntegerLiteral, StringLiteral, CharLiteral, Identifier,
  tokenize
} from './lexer';
import type {
  ClassDeclaration, MethodDeclaration, FieldDeclaration, Parameter, TypeNode,
  Statement, VariableDeclaration, ExpressionStatement, IfStatement, WhileStatement,
  ForStatement, ReturnStatement, BlockStatement,
  Expression, Identifier as IdentifierNode, Literal, BinaryExpression, UnaryExpression,
  AssignmentExpression, UpdateExpression, MethodCallExpression, ArrayAccessExpression,
  ArrayCreationExpression, ParseResult, ParseError, createTypeNode
} from './ast';

// Parser class using Chevrotain's CstParser
class JavaParser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  // ============ Top-Level Rules ============

  // Class declaration: public class ClassName { ... }
  public classDeclaration = this.RULE('classDeclaration', () => {
    this.MANY(() => this.SUBRULE(this.modifier));
    this.CONSUME(Class);
    this.CONSUME(Identifier);
    this.CONSUME(LBrace);
    this.MANY1(() => this.SUBRULE(this.classMember));
    this.CONSUME(RBrace);
  });

  // Class member: unified rule that parses modifiers + type + name, then decides
  // This avoids ambiguity between method and field declarations
  public classMember = this.RULE('classMember', () => {
    // Parse common prefix: modifiers + type/void + identifier
    this.MANY(() => this.SUBRULE(this.modifier));
    this.SUBRULE(this.typeOrVoid);
    this.CONSUME(Identifier);
    // Now decide: LParen means method, otherwise field
    this.OR([
      {
        ALT: () => {
          // Method: (params) { body }
          this.CONSUME(LParen);
          this.OPTION(() => this.SUBRULE(this.parameterList));
          this.CONSUME(RParen);
          this.SUBRULE(this.block);
        },
      },
      {
        ALT: () => {
          // Field: [= expr] ;
          this.OPTION1(() => {
            this.CONSUME(Assign);
            this.SUBRULE(this.expression);
          });
          this.CONSUME(Semicolon);
        },
      },
    ]);
  });

  // Modifier: public, private, protected, static, final
  public modifier = this.RULE('modifier', () => {
    this.OR([
      { ALT: () => this.CONSUME(Public) },
      { ALT: () => this.CONSUME(Private) },
      { ALT: () => this.CONSUME(Protected) },
      { ALT: () => this.CONSUME(Static) },
      { ALT: () => this.CONSUME(Final) },
    ]);
  });

  // ============ Types ============

  public typeOrVoid = this.RULE('typeOrVoid', () => {
    this.OR([
      { ALT: () => this.CONSUME(Void) },
      { ALT: () => this.SUBRULE(this.type) },
    ]);
  });

  public type = this.RULE('type', () => {
    this.SUBRULE(this.primitiveOrRefType);
    this.MANY(() => {
      this.CONSUME(LBracket);
      this.CONSUME(RBracket);
    });
  });

  public primitiveOrRefType = this.RULE('primitiveOrRefType', () => {
    this.OR([
      { ALT: () => this.CONSUME(Int) },
      { ALT: () => this.CONSUME(Boolean) },
      { ALT: () => this.CONSUME(Char) },
      { ALT: () => this.CONSUME(String) },
      { ALT: () => this.CONSUME(Identifier) },
    ]);
  });

  // Parameter list: (int a, int b, ...)
  public parameterList = this.RULE('parameterList', () => {
    this.SUBRULE(this.parameter);
    this.MANY(() => {
      this.CONSUME(Comma);
      this.SUBRULE1(this.parameter);
    });
  });

  public parameter = this.RULE('parameter', () => {
    this.SUBRULE(this.type);
    this.CONSUME(Identifier);
  });

  // ============ Statements ============

  public block = this.RULE('block', () => {
    this.CONSUME(LBrace);
    this.MANY(() => this.SUBRULE(this.statement));
    this.CONSUME(RBrace);
  });

  public statement = this.RULE('statement', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.block) },
      { ALT: () => this.SUBRULE(this.ifStatement) },
      { ALT: () => this.SUBRULE(this.whileStatement) },
      { ALT: () => this.SUBRULE(this.forStatement) },
      { ALT: () => this.SUBRULE(this.returnStatement) },
      { ALT: () => this.SUBRULE(this.variableDeclarationStatement) },
      { ALT: () => this.SUBRULE(this.expressionStatement) },
    ]);
  });

  public ifStatement = this.RULE('ifStatement', () => {
    this.CONSUME(If);
    this.CONSUME(LParen);
    this.SUBRULE(this.expression);
    this.CONSUME(RParen);
    this.SUBRULE(this.statementOrBlock);
    this.OPTION(() => {
      this.CONSUME(Else);
      this.SUBRULE1(this.statementOrBlock);
    });
  });

  public whileStatement = this.RULE('whileStatement', () => {
    this.CONSUME(While);
    this.CONSUME(LParen);
    this.SUBRULE(this.expression);
    this.CONSUME(RParen);
    this.SUBRULE(this.statementOrBlock);
  });

  public forStatement = this.RULE('forStatement', () => {
    this.CONSUME(For);
    this.CONSUME(LParen);
    this.OPTION(() => this.SUBRULE(this.forInit));
    this.CONSUME(Semicolon);
    this.OPTION1(() => this.SUBRULE(this.expression));
    this.CONSUME1(Semicolon);
    this.OPTION2(() => this.SUBRULE1(this.expression));
    this.CONSUME(RParen);
    this.SUBRULE(this.statementOrBlock);
  });

  public forInit = this.RULE('forInit', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.variableDeclaration) },
      { ALT: () => this.SUBRULE(this.expression) },
    ]);
  });

  public returnStatement = this.RULE('returnStatement', () => {
    this.CONSUME(Return);
    this.OPTION(() => this.SUBRULE(this.expression));
    this.CONSUME(Semicolon);
  });

  public variableDeclarationStatement = this.RULE('variableDeclarationStatement', () => {
    this.SUBRULE(this.variableDeclaration);
    this.CONSUME(Semicolon);
  });

  public variableDeclaration = this.RULE('variableDeclaration', () => {
    this.SUBRULE(this.type);
    this.CONSUME(Identifier);
    this.OPTION(() => {
      this.CONSUME(Assign);
      this.SUBRULE(this.expression);
    });
  });

  public expressionStatement = this.RULE('expressionStatement', () => {
    this.SUBRULE(this.expression);
    this.CONSUME(Semicolon);
  });

  // statementOrBlock is used after if/while/for - just use statement directly
  // since statement already handles blocks as one of its alternatives
  public statementOrBlock = this.RULE('statementOrBlock', () => {
    this.SUBRULE(this.statement);
  });

  // ============ Expressions ============
  // Operator precedence (lowest to highest):
  // 1. Assignment (=, +=, -=, etc.)
  // 2. Ternary (?:)
  // 3. Logical OR (||)
  // 4. Logical AND (&&)
  // 5. Equality (==, !=)
  // 6. Relational (<, <=, >, >=)
  // 7. Additive (+, -)
  // 8. Multiplicative (*, /, %)
  // 9. Unary (!, -, +, ++, --)
  // 10. Primary (literals, identifiers, method calls, array access)

  public expression = this.RULE('expression', () => {
    this.SUBRULE(this.assignmentExpression);
  });

  public assignmentExpression = this.RULE('assignmentExpression', () => {
    this.SUBRULE(this.logicalOrExpression);
    this.OPTION(() => {
      this.SUBRULE(this.assignmentOperator);
      this.SUBRULE1(this.assignmentExpression);
    });
  });

  public assignmentOperator = this.RULE('assignmentOperator', () => {
    this.OR([
      { ALT: () => this.CONSUME(Assign) },
      { ALT: () => this.CONSUME(PlusAssign) },
      { ALT: () => this.CONSUME(MinusAssign) },
      { ALT: () => this.CONSUME(MultiplyAssign) },
      { ALT: () => this.CONSUME(DivideAssign) },
    ]);
  });

  public logicalOrExpression = this.RULE('logicalOrExpression', () => {
    this.SUBRULE(this.logicalAndExpression);
    this.MANY(() => {
      this.CONSUME(Or);
      this.SUBRULE1(this.logicalAndExpression);
    });
  });

  public logicalAndExpression = this.RULE('logicalAndExpression', () => {
    this.SUBRULE(this.equalityExpression);
    this.MANY(() => {
      this.CONSUME(And);
      this.SUBRULE1(this.equalityExpression);
    });
  });

  public equalityExpression = this.RULE('equalityExpression', () => {
    this.SUBRULE(this.relationalExpression);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Equal) },
        { ALT: () => this.CONSUME(NotEqual) },
      ]);
      this.SUBRULE1(this.relationalExpression);
    });
  });

  public relationalExpression = this.RULE('relationalExpression', () => {
    this.SUBRULE(this.additiveExpression);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Less) },
        { ALT: () => this.CONSUME(LessEqual) },
        { ALT: () => this.CONSUME(Greater) },
        { ALT: () => this.CONSUME(GreaterEqual) },
      ]);
      this.SUBRULE1(this.additiveExpression);
    });
  });

  public additiveExpression = this.RULE('additiveExpression', () => {
    this.SUBRULE(this.multiplicativeExpression);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Plus) },
        { ALT: () => this.CONSUME(Minus) },
      ]);
      this.SUBRULE1(this.multiplicativeExpression);
    });
  });

  public multiplicativeExpression = this.RULE('multiplicativeExpression', () => {
    this.SUBRULE(this.unaryExpression);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Multiply) },
        { ALT: () => this.CONSUME(Divide) },
        { ALT: () => this.CONSUME(Modulo) },
      ]);
      this.SUBRULE1(this.unaryExpression);
    });
  });

  public unaryExpression = this.RULE('unaryExpression', () => {
    this.OR([
      {
        ALT: () => {
          this.OR1([
            { ALT: () => this.CONSUME(Not) },
            { ALT: () => this.CONSUME(Minus) },
            { ALT: () => this.CONSUME(Plus) },
            { ALT: () => this.CONSUME(Increment) },
            { ALT: () => this.CONSUME(Decrement) },
          ]);
          this.SUBRULE(this.unaryExpression);
        },
      },
      { ALT: () => this.SUBRULE(this.postfixExpression) },
    ]);
  });

  public postfixExpression = this.RULE('postfixExpression', () => {
    this.SUBRULE(this.primaryExpression);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Increment) },
        { ALT: () => this.CONSUME(Decrement) },
        {
          ALT: () => {
            this.CONSUME(LBracket);
            this.SUBRULE(this.expression);
            this.CONSUME(RBracket);
          },
        },
        {
          ALT: () => {
            this.CONSUME(Dot);
            this.CONSUME(Identifier);
            this.OPTION(() => {
              this.CONSUME(LParen);
              this.OPTION1(() => this.SUBRULE(this.argumentList));
              this.CONSUME(RParen);
            });
          },
        },
      ]);
    });
  });

  public primaryExpression = this.RULE('primaryExpression', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.literal) },
      { ALT: () => this.SUBRULE(this.arrayCreation) },
      { ALT: () => this.SUBRULE(this.methodCallOrIdentifier) },
      {
        ALT: () => {
          this.CONSUME(LParen);
          this.SUBRULE(this.expression);
          this.CONSUME(RParen);
        },
      },
    ]);
  });

  public literal = this.RULE('literal', () => {
    this.OR([
      { ALT: () => this.CONSUME(IntegerLiteral) },
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(CharLiteral) },
      { ALT: () => this.CONSUME(True) },
      { ALT: () => this.CONSUME(False) },
      { ALT: () => this.CONSUME(Null) },
    ]);
  });

  public arrayCreation = this.RULE('arrayCreation', () => {
    this.CONSUME(New);
    this.SUBRULE(this.primitiveOrRefType);
    this.OR([
      {
        ALT: () => {
          this.CONSUME(LBracket);
          this.SUBRULE(this.expression);
          this.CONSUME(RBracket);
        },
      },
      {
        ALT: () => {
          this.CONSUME1(LBracket);
          this.CONSUME1(RBracket);
          this.SUBRULE(this.arrayInitializer);
        },
      },
    ]);
  });

  public arrayInitializer = this.RULE('arrayInitializer', () => {
    this.CONSUME(LBrace);
    this.OPTION(() => {
      this.SUBRULE(this.expression);
      this.MANY(() => {
        this.CONSUME(Comma);
        this.SUBRULE1(this.expression);
      });
    });
    this.CONSUME(RBrace);
  });

  public methodCallOrIdentifier = this.RULE('methodCallOrIdentifier', () => {
    this.CONSUME(Identifier);
    this.OPTION(() => {
      this.CONSUME(LParen);
      this.OPTION1(() => this.SUBRULE(this.argumentList));
      this.CONSUME(RParen);
    });
  });

  public argumentList = this.RULE('argumentList', () => {
    this.SUBRULE(this.expression);
    this.MANY(() => {
      this.CONSUME(Comma);
      this.SUBRULE1(this.expression);
    });
  });
}

// Create parser instance
const parserInstance = new JavaParser();


// ============ CST to AST Visitor ============

class ASTBuilder {
  private getLine(token: IToken | undefined): number {
    return token?.startLine ?? 1;
  }

  buildClassDeclaration(cst: any): ClassDeclaration {
    const name = cst.Identifier[0].image;
    const methods: MethodDeclaration[] = [];
    const fields: FieldDeclaration[] = [];

    if (cst.classMember) {
      for (const member of cst.classMember) {
        const memberCst = member.children;
        // Check if it's a method (has LParen) or field (has Semicolon without LParen)
        if (memberCst.LParen) {
          methods.push(this.buildMethodFromUnified(memberCst));
        } else {
          fields.push(this.buildFieldFromUnified(memberCst));
        }
      }
    }

    return {
      type: 'ClassDeclaration',
      name,
      methods,
      fields,
      line: this.getLine(cst.Class?.[0]),
    };
  }

  buildMethodFromUnified(cst: any): MethodDeclaration {
    const modifiers = this.buildModifiers(cst.modifier);
    const returnType = this.buildTypeOrVoid(cst.typeOrVoid[0].children);
    const name = cst.Identifier[0].image;
    const parameters = cst.parameterList 
      ? this.buildParameterList(cst.parameterList[0].children)
      : [];
    const body = this.buildBlock(cst.block[0].children);

    return {
      type: 'MethodDeclaration',
      name,
      modifiers,
      returnType,
      parameters,
      body,
      line: this.getLine(cst.Identifier?.[0]),
      lineEnd: this.getLine(cst.block?.[0]?.children?.RBrace?.[0]) ?? 1,
    };
  }

  buildFieldFromUnified(cst: any): FieldDeclaration {
    const modifiers = this.buildModifiers(cst.modifier);
    // For fields, typeOrVoid should be a type (not void)
    const varType = this.buildTypeOrVoid(cst.typeOrVoid[0].children);
    const name = cst.Identifier[0].image;
    const initializer = cst.expression 
      ? this.buildExpression(cst.expression[0].children)
      : undefined;

    return {
      type: 'FieldDeclaration',
      name,
      modifiers,
      varType,
      initializer,
      line: this.getLine(cst.Identifier?.[0]),
    };
  }

  buildModifiers(modifierCst: any[] | undefined): string[] {
    if (!modifierCst) return [];
    if (!Array.isArray(modifierCst)) {
      return [];
    }
    return modifierCst.map((m: any) => {
      const children = m.children;
      if (children.Public) return 'public';
      if (children.Private) return 'private';
      if (children.Protected) return 'protected';
      if (children.Static) return 'static';
      if (children.Final) return 'final';
      return '';
    }).filter((s) => s !== '');
  }

  buildTypeOrVoid(cst: any): TypeNode {
    if (cst.Void) {
      return { baseType: 'void', isArray: false, arrayDimensions: 0 };
    }
    return this.buildType(cst.type[0].children);
  }

  buildType(cst: any): TypeNode {
    const baseType = this.buildPrimitiveOrRefType(cst.primitiveOrRefType[0].children);
    const arrayDimensions = cst.LBracket ? cst.LBracket.length : 0;
    return {
      baseType,
      isArray: arrayDimensions > 0,
      arrayDimensions,
    };
  }

  buildPrimitiveOrRefType(cst: any): string {
    if (cst.Int) return 'int';
    if (cst.Boolean) return 'boolean';
    if (cst.Char) return 'char';
    if (cst.String) return 'String';
    if (cst.Identifier) return cst.Identifier[0].image;
    return 'unknown';
  }

  buildParameterList(cst: any): Parameter[] {
    const params: Parameter[] = [];
    if (cst.parameter) {
      for (const p of cst.parameter) {
        params.push(this.buildParameter(p.children));
      }
    }
    return params;
  }

  buildParameter(cst: any): Parameter {
    return {
      name: cst.Identifier[0].image,
      paramType: this.buildType(cst.type[0].children),
    };
  }

  buildBlock(cst: any): Statement[] {
    const statements: Statement[] = [];
    if (cst.statement) {
      for (const stmt of cst.statement) {
        statements.push(this.buildStatement(stmt.children));
      }
    }
    return statements;
  }

  buildStatement(cst: any): Statement {
    if (cst.block) {
      return this.buildBlockStatement(cst.block[0].children);
    }
    if (cst.ifStatement) {
      return this.buildIfStatement(cst.ifStatement[0].children);
    }
    if (cst.whileStatement) {
      return this.buildWhileStatement(cst.whileStatement[0].children);
    }
    if (cst.forStatement) {
      return this.buildForStatement(cst.forStatement[0].children);
    }
    if (cst.returnStatement) {
      return this.buildReturnStatement(cst.returnStatement[0].children);
    }
    if (cst.variableDeclarationStatement) {
      return this.buildVariableDeclaration(
        cst.variableDeclarationStatement[0].children.variableDeclaration[0].children
      );
    }
    if (cst.expressionStatement) {
      return this.buildExpressionStatement(cst.expressionStatement[0].children);
    }
    throw new Error('Unknown statement type');
  }

  buildBlockStatement(cst: any): BlockStatement {
    return {
      type: 'BlockStatement',
      body: this.buildBlock(cst),
      line: this.getLine(cst.LBrace?.[0]),
    };
  }

  buildIfStatement(cst: any): IfStatement {
    const condition = this.buildExpression(cst.expression[0].children);
    const consequent = this.buildStatementOrBlock(cst.statementOrBlock[0].children);
    const alternate = cst.statementOrBlock[1]
      ? this.buildStatementOrBlock(cst.statementOrBlock[1].children)
      : undefined;

    return {
      type: 'IfStatement',
      condition,
      consequent,
      alternate,
      line: this.getLine(cst.If?.[0]),
    };
  }

  buildWhileStatement(cst: any): WhileStatement {
    return {
      type: 'WhileStatement',
      condition: this.buildExpression(cst.expression[0].children),
      body: this.buildStatementOrBlock(cst.statementOrBlock[0].children),
      line: this.getLine(cst.While?.[0]),
    };
  }

  buildForStatement(cst: any): ForStatement {
    let init: VariableDeclaration | Expression | undefined;
    if (cst.forInit) {
      const forInitCst = cst.forInit[0].children;
      if (forInitCst.variableDeclaration) {
        init = this.buildVariableDeclaration(forInitCst.variableDeclaration[0].children);
      } else if (forInitCst.expression) {
        init = this.buildExpression(forInitCst.expression[0].children);
      }
    }

    const condition = cst.expression && cst.expression[0]
      ? this.buildExpression(cst.expression[0].children)
      : undefined;
    
    const update = cst.expression && cst.expression[1]
      ? this.buildExpression(cst.expression[1].children)
      : undefined;

    return {
      type: 'ForStatement',
      init,
      condition,
      update,
      body: this.buildStatementOrBlock(cst.statementOrBlock[0].children),
      line: this.getLine(cst.For?.[0]),
    };
  }

  buildReturnStatement(cst: any): ReturnStatement {
    return {
      type: 'ReturnStatement',
      argument: cst.expression 
        ? this.buildExpression(cst.expression[0].children)
        : undefined,
      line: this.getLine(cst.Return?.[0]),
    };
  }

  buildVariableDeclaration(cst: any): VariableDeclaration {
    return {
      type: 'VariableDeclaration',
      name: cst.Identifier[0].image,
      varType: this.buildType(cst.type[0].children),
      initializer: cst.expression 
        ? this.buildExpression(cst.expression[0].children)
        : undefined,
      line: this.getLine(cst.Identifier?.[0]),
    };
  }

  buildExpressionStatement(cst: any): ExpressionStatement {
    return {
      type: 'ExpressionStatement',
      expression: this.buildExpression(cst.expression[0].children),
      line: this.getLine(cst.expression?.[0]?.children?.assignmentExpression?.[0]?.children?.logicalOrExpression?.[0]?.children?.logicalAndExpression?.[0]?.children?.equalityExpression?.[0]?.children?.relationalExpression?.[0]?.children?.additiveExpression?.[0]?.children?.multiplicativeExpression?.[0]?.children?.unaryExpression?.[0]?.children?.postfixExpression?.[0]?.children?.primaryExpression?.[0]?.children?.Identifier?.[0]) ?? 1,
    };
  }

  buildStatementOrBlock(cst: any): Statement[] {
    // statementOrBlock now just wraps statement, which handles blocks as one of its alternatives
    if (cst.statement) {
      const stmt = this.buildStatement(cst.statement[0].children);
      // If it's a block statement, return its body; otherwise wrap in array
      if (stmt.type === 'BlockStatement') {
        return (stmt as BlockStatement).body;
      }
      return [stmt];
    }
    return [];
  }

  // ============ Expression Building ============

  buildExpression(cst: any): Expression {
    return this.buildAssignmentExpression(cst.assignmentExpression[0].children);
  }

  buildAssignmentExpression(cst: any): Expression {
    const left = this.buildLogicalOrExpression(cst.logicalOrExpression[0].children);
    
    if (cst.assignmentOperator) {
      const opCst = cst.assignmentOperator[0].children;
      let operator: '=' | '+=' | '-=' | '*=' | '/=' = '=';
      if (opCst.Assign) operator = '=';
      else if (opCst.PlusAssign) operator = '+=';
      else if (opCst.MinusAssign) operator = '-=';
      else if (opCst.MultiplyAssign) operator = '*=';
      else if (opCst.DivideAssign) operator = '/=';

      const right = this.buildAssignmentExpression(cst.assignmentExpression[0].children);
      
      return {
        type: 'AssignmentExpression',
        operator,
        left,
        right,
        line: (left as any).line ?? 1,
      };
    }
    
    return left;
  }

  buildLogicalOrExpression(cst: any): Expression {
    let left = this.buildLogicalAndExpression(cst.logicalAndExpression[0].children);
    
    if (cst.Or && cst.logicalAndExpression.length > 1) {
      for (let i = 1; i < cst.logicalAndExpression.length; i++) {
        const right = this.buildLogicalAndExpression(cst.logicalAndExpression[i].children);
        left = {
          type: 'BinaryExpression',
          operator: '||',
          left,
          right,
          line: (left as any).line ?? 1,
        };
      }
    }
    
    return left;
  }

  buildLogicalAndExpression(cst: any): Expression {
    let left = this.buildEqualityExpression(cst.equalityExpression[0].children);
    
    if (cst.And && cst.equalityExpression.length > 1) {
      for (let i = 1; i < cst.equalityExpression.length; i++) {
        const right = this.buildEqualityExpression(cst.equalityExpression[i].children);
        left = {
          type: 'BinaryExpression',
          operator: '&&',
          left,
          right,
          line: (left as any).line ?? 1,
        };
      }
    }
    
    return left;
  }

  buildEqualityExpression(cst: any): Expression {
    let left = this.buildRelationalExpression(cst.relationalExpression[0].children);
    
    const operators = [...(cst.Equal || []), ...(cst.NotEqual || [])].sort(
      (a, b) => a.startOffset - b.startOffset
    );
    
    if (operators.length > 0 && cst.relationalExpression.length > 1) {
      for (let i = 0; i < operators.length; i++) {
        const op = operators[i].tokenType.name === 'Equal' ? '==' : '!=';
        const right = this.buildRelationalExpression(cst.relationalExpression[i + 1].children);
        left = {
          type: 'BinaryExpression',
          operator: op,
          left,
          right,
          line: (left as any).line ?? 1,
        };
      }
    }
    
    return left;
  }

  buildRelationalExpression(cst: any): Expression {
    let left = this.buildAdditiveExpression(cst.additiveExpression[0].children);
    
    const operators = [
      ...(cst.Less || []),
      ...(cst.LessEqual || []),
      ...(cst.Greater || []),
      ...(cst.GreaterEqual || []),
    ].sort((a, b) => a.startOffset - b.startOffset);
    
    if (operators.length > 0 && cst.additiveExpression.length > 1) {
      for (let i = 0; i < operators.length; i++) {
        const opName = operators[i].tokenType.name;
        let op: '<' | '<=' | '>' | '>=' = '<';
        if (opName === 'Less') op = '<';
        else if (opName === 'LessEqual') op = '<=';
        else if (opName === 'Greater') op = '>';
        else if (opName === 'GreaterEqual') op = '>=';
        
        const right = this.buildAdditiveExpression(cst.additiveExpression[i + 1].children);
        left = {
          type: 'BinaryExpression',
          operator: op,
          left,
          right,
          line: (left as any).line ?? 1,
        };
      }
    }
    
    return left;
  }

  buildAdditiveExpression(cst: any): Expression {
    let left = this.buildMultiplicativeExpression(cst.multiplicativeExpression[0].children);
    
    const operators = [...(cst.Plus || []), ...(cst.Minus || [])].sort(
      (a, b) => a.startOffset - b.startOffset
    );
    
    if (operators.length > 0 && cst.multiplicativeExpression.length > 1) {
      for (let i = 0; i < operators.length; i++) {
        const op = operators[i].tokenType.name === 'Plus' ? '+' : '-';
        const right = this.buildMultiplicativeExpression(cst.multiplicativeExpression[i + 1].children);
        left = {
          type: 'BinaryExpression',
          operator: op,
          left,
          right,
          line: (left as any).line ?? 1,
        };
      }
    }
    
    return left;
  }

  buildMultiplicativeExpression(cst: any): Expression {
    let left = this.buildUnaryExpression(cst.unaryExpression[0].children);
    
    const operators = [
      ...(cst.Multiply || []),
      ...(cst.Divide || []),
      ...(cst.Modulo || []),
    ].sort((a, b) => a.startOffset - b.startOffset);
    
    if (operators.length > 0 && cst.unaryExpression.length > 1) {
      for (let i = 0; i < operators.length; i++) {
        const opName = operators[i].tokenType.name;
        let op: '*' | '/' | '%' = '*';
        if (opName === 'Multiply') op = '*';
        else if (opName === 'Divide') op = '/';
        else if (opName === 'Modulo') op = '%';
        
        const right = this.buildUnaryExpression(cst.unaryExpression[i + 1].children);
        left = {
          type: 'BinaryExpression',
          operator: op,
          left,
          right,
          line: (left as any).line ?? 1,
        };
      }
    }
    
    return left;
  }

  buildUnaryExpression(cst: any): Expression {
    // Check for prefix operators
    if (cst.Not || cst.Minus || cst.Plus || cst.Increment || cst.Decrement) {
      let operator: '!' | '-' | '+' | '++' | '--' = '!';
      if (cst.Not) operator = '!';
      else if (cst.Minus) operator = '-';
      else if (cst.Plus) operator = '+';
      else if (cst.Increment) operator = '++';
      else if (cst.Decrement) operator = '--';

      const argument = this.buildUnaryExpression(cst.unaryExpression[0].children);
      
      if (operator === '++' || operator === '--') {
        return {
          type: 'UpdateExpression',
          operator,
          argument,
          prefix: true,
          line: this.getLine(cst.Increment?.[0] || cst.Decrement?.[0]),
        };
      }
      
      return {
        type: 'UnaryExpression',
        operator: operator as '!' | '-' | '+',
        argument,
        prefix: true,
        line: this.getLine(cst.Not?.[0] || cst.Minus?.[0] || cst.Plus?.[0]),
      };
    }
    
    return this.buildPostfixExpression(cst.postfixExpression[0].children);
  }

  buildPostfixExpression(cst: any): Expression {
    let expr = this.buildPrimaryExpression(cst.primaryExpression[0].children);
    
    // Handle postfix operations: ++, --, [], .member, .method()
    const postfixOps = [
      ...(cst.Increment || []).map((t: any) => ({ type: 'inc', token: t })),
      ...(cst.Decrement || []).map((t: any) => ({ type: 'dec', token: t })),
      ...(cst.LBracket || []).map((t: any, i: number) => ({ 
        type: 'array', 
        token: t, 
        expr: cst.expression?.[i] 
      })),
      ...(cst.Dot || []).map((t: any, i: number) => ({ 
        type: 'member', 
        token: t, 
        id: cst.Identifier?.[i],
        hasCall: cst.LParen && cst.LParen.length > i,
        args: cst.argumentList?.[i]
      })),
    ].sort((a, b) => a.token.startOffset - b.token.startOffset);

    for (const op of postfixOps) {
      if (op.type === 'inc' || op.type === 'dec') {
        expr = {
          type: 'UpdateExpression',
          operator: op.type === 'inc' ? '++' : '--',
          argument: expr,
          prefix: false,
          line: (expr as any).line ?? 1,
        };
      } else if (op.type === 'array' && op.expr) {
        expr = {
          type: 'ArrayAccessExpression',
          array: expr,
          index: this.buildExpression(op.expr.children),
          line: (expr as any).line ?? 1,
        };
      } else if (op.type === 'member' && op.id) {
        if (op.hasCall) {
          expr = {
            type: 'MethodCallExpression',
            callee: op.id.image,
            object: expr,
            arguments: op.args 
              ? this.buildArgumentList(op.args.children)
              : [],
            line: (expr as any).line ?? 1,
          };
        } else {
          expr = {
            type: 'MemberExpression',
            object: expr,
            property: op.id.image,
            line: (expr as any).line ?? 1,
          };
        }
      }
    }
    
    return expr;
  }

  buildPrimaryExpression(cst: any): Expression {
    if (cst.literal) {
      return this.buildLiteral(cst.literal[0].children);
    }
    if (cst.arrayCreation) {
      return this.buildArrayCreation(cst.arrayCreation[0].children);
    }
    if (cst.methodCallOrIdentifier) {
      return this.buildMethodCallOrIdentifier(cst.methodCallOrIdentifier[0].children);
    }
    if (cst.expression) {
      return this.buildExpression(cst.expression[0].children);
    }
    throw new Error('Unknown primary expression');
  }

  buildLiteral(cst: any): Literal {
    if (cst.IntegerLiteral) {
      const raw = cst.IntegerLiteral[0].image;
      return {
        type: 'Literal',
        value: parseInt(raw, 10),
        raw,
        line: this.getLine(cst.IntegerLiteral[0]),
      };
    }
    if (cst.StringLiteral) {
      const raw = cst.StringLiteral[0].image;
      return {
        type: 'Literal',
        value: raw.slice(1, -1), // Remove quotes
        raw,
        line: this.getLine(cst.StringLiteral[0]),
      };
    }
    if (cst.CharLiteral) {
      const raw = cst.CharLiteral[0].image;
      return {
        type: 'Literal',
        value: raw.slice(1, -1),
        raw,
        line: this.getLine(cst.CharLiteral[0]),
      };
    }
    if (cst.True) {
      return {
        type: 'Literal',
        value: true,
        raw: 'true',
        line: this.getLine(cst.True[0]),
      };
    }
    if (cst.False) {
      return {
        type: 'Literal',
        value: false,
        raw: 'false',
        line: this.getLine(cst.False[0]),
      };
    }
    if (cst.Null) {
      return {
        type: 'Literal',
        value: null,
        raw: 'null',
        line: this.getLine(cst.Null[0]),
      };
    }
    throw new Error('Unknown literal type');
  }

  buildArrayCreation(cst: any): ArrayCreationExpression {
    const elementType = {
      baseType: this.buildPrimitiveOrRefType(cst.primitiveOrRefType[0].children),
      isArray: false,
      arrayDimensions: 0,
    };

    if (cst.expression) {
      return {
        type: 'ArrayCreationExpression',
        elementType,
        size: this.buildExpression(cst.expression[0].children),
        line: this.getLine(cst.New?.[0]),
      };
    }

    if (cst.arrayInitializer) {
      const initCst = cst.arrayInitializer[0].children;
      const initializer = initCst.expression
        ? initCst.expression.map((e: any) => this.buildExpression(e.children))
        : [];
      
      return {
        type: 'ArrayCreationExpression',
        elementType,
        size: { type: 'Literal', value: initializer.length, raw: `${initializer.length}`, line: 1 },
        initializer,
        line: this.getLine(cst.New?.[0]),
      };
    }

    throw new Error('Invalid array creation');
  }

  buildMethodCallOrIdentifier(cst: any): Expression {
    const name = cst.Identifier[0].image;
    
    if (cst.LParen) {
      // It's a method call
      const args = cst.argumentList
        ? this.buildArgumentList(cst.argumentList[0].children)
        : [];
      
      return {
        type: 'MethodCallExpression',
        callee: name,
        arguments: args,
        line: this.getLine(cst.Identifier[0]),
      };
    }
    
    // It's just an identifier
    return {
      type: 'Identifier',
      name,
      line: this.getLine(cst.Identifier[0]),
    };
  }

  buildArgumentList(cst: any): Expression[] {
    if (!cst.expression) return [];
    return cst.expression.map((e: any) => this.buildExpression(e.children));
  }
}

// ============ Public Parse Function ============

const astBuilder = new ASTBuilder();

/**
 * Parse Java source code into an AST
 * 
 * @param code - Java source code
 * @returns ParseResult with AST or errors
 */
export function parse(code: string): ParseResult {
  // Tokenize
  const lexResult = tokenize(code);
  
  if (lexResult.errors.length > 0) {
    return {
      success: false,
      errors: lexResult.errors.map(e => ({
        message: e.message,
        line: e.line,
        column: e.column,
      })),
    };
  }

  // Parse
  parserInstance.input = lexResult.tokens;
  const cst = parserInstance.classDeclaration();

  if (parserInstance.errors.length > 0) {
    return {
      success: false,
      errors: parserInstance.errors.map(e => {
        // Handle cases where token is missing or has invalid line number
        let line = 1;
        if (e.token && typeof e.token.startLine === 'number' && !isNaN(e.token.startLine)) {
          line = e.token.startLine;
        } else if (lexResult.tokens.length > 0) {
          // Use the last token's line as a fallback
          const lastToken = lexResult.tokens[lexResult.tokens.length - 1];
          line = lastToken.startLine ?? 1;
        }
        return {
          message: e.message,
          line,
          column: e.token?.startColumn ?? 1,
        };
      }),
    };
  }

  // Build AST
  try {
    const ast = astBuilder.buildClassDeclaration(cst.children);
    return {
      success: true,
      ast,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: error instanceof Error ? error.message : 'AST building failed',
        line: 1,
      }],
    };
  }
}

export { JavaParser, parserInstance };
