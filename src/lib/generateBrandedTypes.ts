type TypeGenerationPreferences = {
  /**
   * Set `true` to use `declare const fooBrand: unique symbol;` to remove the symbol from runtime code.
   */
  useDeclareConst: boolean;
};

/**
 * BrandedType生成関数
 * @param input 入力テキスト (CSV または タブ区切り)
 * @returns BrandedTypeのコードを文字列で返す
 */
export function generateBrandedTypes(
  input: string,
  preferences: TypeGenerationPreferences,
): string {
  const lines = input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);
  const output: string[] = [];
  const primitiveTypes = ['string', 'number', 'boolean', 'bigint', 'symbol'];

  for (const line of lines) {
    // CSV または タブ区切りの行を分割
    const [name, type] = line.includes(',')
      ? line.split(',').map((item) => item.trim())
      : line.split('\t').map((item) => item.trim());

    if (!name || !type) {
      throw new Error(`Invalid input format: "${line}"`);
    }
    if (!primitiveTypes.includes(type)) {
      throw new Error(`"${type}" is not a primitive type.`);
    }

    const camelCaseName = name.charAt(0).toUpperCase() + name.slice(1);
    const brand = `${name}Brand`;

    const brandSymbol = preferences.useDeclareConst
      ? `declare const ${brand}: unique symbol;`
      : `const ${brand} = Symbol();`;

    output.push(
      `
${brandSymbol}

export type ${camelCaseName} = ${type} & { [${brand}]: unknown };

export function create${camelCaseName}(p: ${type}): ${camelCaseName} {
  return p as ${camelCaseName};
}
    `.trim(),
    );
  }

  return output.join('\n\n');
}
