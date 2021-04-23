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

export function isBigInt(val: any): boolean {
  return typeof val === "bigint";
}

const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);

export function escapeRegExp(string: string) {
  return string && reHasRegExpChar.test(string)
    ? string.replace(reRegExpChar, "\\$&")
    : string;
}

export type Dict<T> = { [key: string]: T | undefined };

export enum Operators {
  equal = 0,
  notEqual = 1,
  greaterThan = 2,
  lessThan = 3,
  greaterThanOrEqualTo = 4,
  lessThanOrEqualTo = 5,
  contains = 6,
}

export const operatorsAsArray = () => [
  { value: 0, content: "=" },
  { value: 1, content: "!=" },
  { value: 2, content: ">" },
  { value: 3, content: "<" },
  { value: 4, content: ">=" },
  { value: 5, content: "<=" },
  { value: 6, content: "~" },
];

export function isOp(val: any): val is Operators {
  return (
    val === Operators.equal ||
    val === Operators.notEqual ||
    val === Operators.greaterThan ||
    val === Operators.lessThan ||
    val === Operators.greaterThanOrEqualTo ||
    val === Operators.lessThanOrEqualTo ||
    val === Operators.contains
  );
}

export function toOp(val: number): Operators {
  if (!isOp(val)) {
    throw new Error(`unknown op: "${val}"`);
  }
  return val;
}

export function opToText(op: Operators) {
  switch (op) {
    case Operators.contains:
      return "contain (~)";
    case Operators.equal:
      return "equal (=)";
    case Operators.notEqual:
      return "not equal (!=)";
    case Operators.greaterThan:
      return "greater than (>)";
    case Operators.lessThan:
      return "less than (<)";
    case Operators.greaterThanOrEqualTo:
      return "greater than or equal to (>=)";
    case Operators.lessThanOrEqualTo:
      return "less than or equal to (<=)";
    default:
      throw new Error(`unknown operation "${op}"`);
  }
}

type AnyDict<T> = Record<
  keyof T,
  | string
  | number
  | boolean
  | bigint
  | string[]
  | boolean[]
  | number[]
  | bigint[]
>;

type Value<T extends AnyDict<T>, K extends keyof T> = T[K] extends string[]
  ? string
  : T[K] extends number[]
  ? number
  : T[K] extends boolean[]
  ? boolean
  : T[K] extends bigint[]
  ? bigint
  : T[K];

type MarshaledRule<T extends AnyDict<T>, K extends keyof T> =
  | [Value<T, K>, Operators]
  | [Value<T, K>];

interface IRule<T extends AnyDict<T>, K extends keyof T> {
  op: Operators;
  value: Value<T, K>;
}

export type Rule<T extends AnyDict<T>, K extends keyof T> = [
  K,
  Operators,
  Value<T, K>
];

export type Filters<T extends AnyDict<T>> = Rule<T, keyof T>[];

function addOrUpdateRule<T extends AnyDict<T>, K extends keyof T>(
  filters: Filters<T>,
  key: K,
  rule: IRule<T, K>
): Filters<T> {
  return [...filters, [key, rule.op, rule.value]];
}

export function fromString<T extends AnyDict<T>>(str: string): Filters<T> {
  const f = JSON.parse(str);
  return Object.keys(f).reduce((acc: Filters<T>, key: string) => {
    return f[key].reduce(
      (acc2: Filters<T>, chunk: MarshaledRule<T, keyof T>) => {
        return addOrUpdateRule(acc2, key as keyof T, {
          value: chunk[0],
          op: toOp(chunk[1] || Operators.equal),
        });
      },
      acc
    );
  }, [] as Filters<T>);
}

export function fromQueryString<T extends AnyDict<T>>(str: string): Filters<T> {
  return fromString(Buffer.from(str, "base64").toString("utf8"));
}

export function addRule<T extends AnyDict<T>, K extends keyof T>(
  filter: Filters<T>,
  key: K,
  op: Operators,
  value: Value<T, K>
): Filters<T> {
  if (!op) {
    op = Operators.equal;
  }

  if (op === Operators.contains && !isString(value)) {
    throw new Error(
      `only string fields can be filtered by "${opToText(op)}" filter`
    );
  } else if (
    [
      Operators.greaterThan,
      Operators.lessThan,
      Operators.greaterThanOrEqualTo,
      Operators.lessThanOrEqualTo,
    ].includes(op) &&
    !(isNumeric(value) || isBigInt(value))
  ) {
    throw new Error(
      `only number fields can be filtered by "${opToText(op)}" filter`
    );
  }

  return addOrUpdateRule(filter, key as keyof T, {
    value: value,
    op,
  });
}

export function fromArray<T extends AnyDict<T>>(
  array: Rule<T, keyof T>[]
): Filters<T> {
  return array.reduce(
    (acc, v) => addRule(acc, v[0], v[1], v[2]),
    [] as Filters<T>
  );
}

export function removeRule<T extends AnyDict<T>>(
  filter: Filters<T>,
  index: number
): Filters<T> {
  return [...filter.slice(0, index), ...filter.slice(index + 1)];
}

function toMarshaled<T extends AnyDict<T>>(
  filter: Filters<T>
): Dict<MarshaledRule<T, keyof T>[]> {
  return filter.reduce((acc, v) => {
    const val: MarshaledRule<T, keyof T> =
      v[1] === Operators.equal ? [v[2]] : [v[2], v[1]];
    if (acc[v[0] as string] === undefined) {
      acc[v[0] as string] = [val];
    } else {
      acc[v[0] as string]?.push(val);
    }
    return acc;
  }, {} as Dict<MarshaledRule<T, keyof T>[]>);
}

export function toString<T extends AnyDict<T>>(filter: Filters<T>) {
  return JSON.stringify(toMarshaled(filter));
}

export function toQueryString<T extends AnyDict<T>>(
  filter: Filters<T>
): string {
  return Buffer.from(toString(filter)).toString("base64");
}

export function toMongoQuery<T extends AnyDict<T>>(
  filter: Filters<T>
): { [key in keyof T]: any } {
  const marshaled = toMarshaled(filter);
  return Object.keys(marshaled).reduce(
    (acc: { [key in keyof T]: any }, key) => {
      const rule = marshaled[key as string];
      if (rule) {
        if (rule.length === 1) {
          if (rule[0][1] === Operators.notEqual) {
            acc[key as keyof T] = { $ne: rule[0][0] };
          } else if (rule[0][1] === Operators.greaterThan) {
            acc[key as keyof T] = { $gt: rule[0][0] };
          } else if (rule[0][1] === Operators.lessThan) {
            acc[key as keyof T] = { $lt: rule[0][0] };
          } else if (rule[0][1] === Operators.greaterThanOrEqualTo) {
            acc[key as keyof T] = { $gte: rule[0][0] };
          } else if (rule[0][1] === Operators.lessThanOrEqualTo) {
            acc[key as keyof T] = { $lte: rule[0][0] };
          } else if (rule[0][1] === Operators.contains) {
            acc[key as keyof T] = {
              $regex: `.*${escapeRegExp(String(rule[0][0]))}.*`,
              $options: "gi",
            };
          } else {
            acc[key as keyof T] = rule[0][0];
          }
        } else if (rule.length > 1) {
          acc[key as keyof T] = rule.reduce(
            (field: { [key: string]: any }, v) => {
              if (v[1] === undefined) {
                field["$in"] = field["$in"] ? [...field["$in"], v[0]] : [v[0]];
              } else if (v[1] === Operators.notEqual) {
                field["$nin"] = field["$nin"]
                  ? [...field["$nin"], v[0]]
                  : [v[0]];
              } else if (v[1] === Operators.greaterThan) {
                field["$gt"] = v[0];
              } else if (v[1] === Operators.lessThan) {
                field["$lt"] = v[0];
              } else if (v[1] === Operators.greaterThanOrEqualTo) {
                field["$gte"] = v[0];
              } else if (v[1] === Operators.lessThanOrEqualTo) {
                field["$lte"] = v[0];
              } else if (v[1] === Operators.contains) {
                const r = new RegExp(`.*${escapeRegExp(String(v[0]))}.*`, "gi");
                field["$in"] = field["$in"] ? [...field["$in"], r] : [r];
              }
              return field;
            },
            {}
          );
        }
      }
      return acc;
    },
    {} as { [key in keyof T]: any }
  );
}

export function toFilterCb<T extends AnyDict<T>>(
  filter: Filters<T>
): (v: T) => boolean {
  const query = toMongoQuery(filter);
  const keys = Object.keys(query) as Array<keyof T>;
  return (element) =>
    keys.every((key) => {
      if (element[key] !== undefined) {
        if (Array.isArray(element[key])) {
          return (element[key] as any[]).some((element) =>
            cb(query[key], element)
          );
        } else {
          return cb(query[key], element[key]);
        }
      }
      return false;
    });
}

function cb(query: any, element: any) {
  if (isString(query) || isNumeric(query) || isBoolean(query)) {
    return query === element;
  } else {
    return Object.keys(query).every((f) => {
      if (f === "$in") {
        return query[f].some((val: any) => element === val);
      } else if (f === "$nin") {
        return query[f].every((val: any) => element !== val);
      } else if (f === "$gt") {
        return query[f] < element;
      } else if (f === "$lt") {
        return query[f] > element;
      } else if (f === "$gte") {
        return query[f] <= element;
      } else if (f === "$lte") {
        return query[f] >= element;
      } else if (f === "$regex") {
        return new RegExp(query[f], "gi").test(element as string);
      } else if (f === "$options") {
        return true;
      } else if (f === "$ne") {
        return query[f] !== element;
      }
    });
  }
}
