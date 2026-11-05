import ts from 'typescript';

export interface FieldReferenceLocation {
  filePath: string;
  line: number;
  character: number;
  contextSnippet: string;
  expression: string;
}

export interface AstAnalysisResult {
  filePath: string;
  targetedField: string;
  references: FieldReferenceLocation[];
  hasReference: boolean;
}

/**
 * Parses a TypeScript/TSX file and locates references to a specific field name
 * (e.g. property accesses like `order.total_amount` or Zod properties like `total_amount: z.number()`).
 */
export function analyzeSourceForField(
  sourceCode: string,
  filePath: string,
  fieldName: string
): AstAnalysisResult {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const references: FieldReferenceLocation[] = [];

  function visit(node: ts.Node) {
    // 1. Property access expression: object.fieldName
    if (ts.isPropertyAccessExpression(node)) {
      if (node.name.text === fieldName) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const startLinePos = sourceFile.getPositionOfLineAndCharacter(line, 0);
        const endLinePos = sourceFile.getLineEndOfPosition(node.getStart());
        const contextSnippet = sourceCode.substring(startLinePos, endLinePos).trim();

        references.push({
          filePath,
          line: line + 1,
          character: character + 1,
          contextSnippet,
          expression: node.getText(sourceFile)
        });
      }
    }

    // 2. Property assignment in object literal or Zod schema: { fieldName: ... }
    if (ts.isPropertyAssignment(node)) {
      const name = node.name.getText(sourceFile);
      if (name === fieldName || name === `"${fieldName}"` || name === `'${fieldName}'`) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const startLinePos = sourceFile.getPositionOfLineAndCharacter(line, 0);
        const endLinePos = sourceFile.getLineEndOfPosition(node.getStart());
        const contextSnippet = sourceCode.substring(startLinePos, endLinePos).trim();

        references.push({
          filePath,
          line: line + 1,
          character: character + 1,
          contextSnippet,
          expression: node.getText(sourceFile)
        });
      }
    }

    // 3. Property signature in interface or type: fieldName: type;
    if (ts.isPropertySignature(node)) {
      const name = node.name.getText(sourceFile);
      if (name === fieldName || name === `"${fieldName}"` || name === `'${fieldName}'`) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const startLinePos = sourceFile.getPositionOfLineAndCharacter(line, 0);
        const endLinePos = sourceFile.getLineEndOfPosition(node.getStart());
        const contextSnippet = sourceCode.substring(startLinePos, endLinePos).trim();

        references.push({
          filePath,
          line: line + 1,
          character: character + 1,
          contextSnippet,
          expression: node.getText(sourceFile)
        });
      }
    }

    // 4. Binding element in destructuring: const { fieldName } = order;
    if (ts.isBindingElement(node)) {
      const name = node.name.getText(sourceFile);
      if (name === fieldName) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const startLinePos = sourceFile.getPositionOfLineAndCharacter(line, 0);
        const endLinePos = sourceFile.getLineEndOfPosition(node.getStart());
        const contextSnippet = sourceCode.substring(startLinePos, endLinePos).trim();

        references.push({
          filePath,
          line: line + 1,
          character: character + 1,
          contextSnippet,
          expression: node.getText(sourceFile)
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    filePath,
    targetedField: fieldName,
    references,
    hasReference: references.length > 0
  };
}

