export function isString(val: any): val is string {
  return typeof val === "string" || val instanceof String;
}

export function isBoolean(val: any): val is Boolean {
  return typeof val == typeof true;
}

export function isNumeric(val: any): boolean {
  return (
    (isString(val) || typeof val === "number") &&
    !isNaN((val as number) - parseInt(val as string))
  );
}

const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);

export function escapeRegExp(string: string) {
  return string && reHasRegExpChar.test(string)
    ? string.replace(reRegExpChar, "\\$&")
    : string;
}

export type Dict<T> = { [key: string]: T | undefined };

export type Values = string | number | boolean;

export type Ops = "=" | "!=" | ">" | "<" | ">=" | "<=" | "~";

export function isOp(val: any): val is Ops {
  return (
    val === "=" ||
    val === "!=" ||
    val === ">" ||
    val === "<" ||
    val === ">=" ||
    val === "<=" ||
    val === "~"
  );
}

export function toOp(val: string): Ops {
  if (!isOp(val)) {
    throw new Error(`unknown op: "${val}"`);
  }
  return val;
}

export function opToText(op: Ops) {
  switch (op) {
    case "~":
      return "contain (~)";
    case "=":
      return "equal (=)";
    case "!=":
      return "not equal (!=)";
    case ">":
      return "greater than (>)";
    case "<":
      return "lower than (<)";
    case ">=":
      return "greater or equal than (>=)";
    case "<=":
      return "lower or equal than (<=)";
    default:
      throw new Error(`unknown operation "${op}"`);
  }
}

export type Types = "number" | "str" | "bool";

export function typeToString(val: any): Types {
  if (isString(val)) {
    return "str";
  } else if (isNumeric(val)) {
    return "number";
  } else if (isBoolean(val)) {
    return "bool";
  } else {
    throw new Error(`unknown value type`);
  }
}