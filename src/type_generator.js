/**
 * TypeScript Type Generator from JSON payloads
 * Inspects arbitrarily nested JSON objects and produces strongly typed TypeScript declarations.
 */

export function jsonToTypeScript(json, interfaceName = 'WebhookPayload') {
  if (typeof json === 'string') {
    try {
      json = JSON.parse(json);
    } catch {
      return `export type ${interfaceName} = string;\n`;
    }
  }

  if (json === null || typeof json !== 'object') {
    return `export type ${interfaceName} = ${typeof json};\n`;
  }

  const auxiliaryInterfaces = [];

  function inferType(val, keyName) {
    if (val === null) return 'any | null';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      const innerType = inferType(val[0], `${keyName}Item`);
      return `${innerType}[]`;
    }
    if (typeof val === 'object') {
      const childName = keyName.charAt(0).toUpperCase() + keyName.slice(1);
      generateInterface(val, childName);
      return childName;
    }
    return typeof val;
  }

  function generateInterface(obj, name) {
    let out = `export interface ${name} {\n`;
    for (const [k, v] of Object.entries(obj)) {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      const inferred = inferType(v, k);
      out += `  ${safeKey}: ${inferred};\n`;
    }
    out += `}\n`;
    auxiliaryInterfaces.push(out);
  }

  generateInterface(json, interfaceName);
  return auxiliaryInterfaces.join('\n');
}
