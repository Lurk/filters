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

export type Filters<T extends AnyDict<T>> = {
  [key in keyof T]?: IRule<T, keyof T>[];
};

export type RulesArray<T extends AnyDict<T>, K extends keyof T> = [
  K,
  Operators,
  Value<T, K>
];

function addOrUpdateRule<T extends AnyDict<T>, K extends keyof T>(
  filters: Filters<T>,
  key: K,
  rule: IRule<T, K>
): Filters<T> {
  if (filters[key] && Array.isArray(filters[key])) {
    return {
      ...filters,
      [key]: [...(filters[key] as IRule<T, K>[]), rule],
    };
  } else {
    return {
      ...filters,
      [key]: [rule],
    };
  }
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
  }, {} as Filters<T>);
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
  array: RulesArray<T, keyof T>[]
): Filters<T> {
  return array.reduce(
    (acc, v) => addRule(acc, v[0], v[1], v[2]),
    {} as Filters<T>
  );
}

export function removeRule<T extends AnyDict<T>>(
  filter: Filters<T>,
  key: keyof T
): Filters<T> {
  const { [key]: undefined, ...rest } = filter;
  return rest as Filters<T>;
}

export function toString<T extends AnyDict<T>, K extends keyof T>(
  filter: Filters<T>
) {
  return JSON.stringify(
    Object.keys(filter).reduce((acc: Dict<MarshaledRule<T, K>[]>, key) => {
      //TODO wtf typescript
      acc[key] = (filter[key as K] as IRule<T, K>[]).map((r) =>
        r.op === Operators.equal ? [r.value] : [r.value, r.op]
      );
      return acc;
    }, {})
  );
}

export function toQueryString<T extends AnyDict<T>>(
  filter: Filters<T>
): string {
  return Buffer.from(toString(filter)).toString("base64");
}

export function toMongoQuery<T extends AnyDict<T>>(
  filter: Filters<T>
): { [key in keyof T]: any } {
  return Object.keys(filter).reduce((acc: { [key in keyof T]: any }, key) => {
    const rule = filter[key as keyof T];
    if (rule) {
      if (rule.length === 1) {
        if (rule[0].op === Operators.notEqual) {
          acc[key as keyof T] = { $ne: rule[0].value };
        } else if (rule[0].op === Operators.greaterThan) {
          acc[key as keyof T] = { $gt: rule[0].value };
        } else if (rule[0].op === Operators.lessThan) {
          acc[key as keyof T] = { $lt: rule[0].value };
        } else if (rule[0].op === Operators.greaterThanOrEqualTo) {
          acc[key as keyof T] = { $gte: rule[0].value };
        } else if (rule[0].op === Operators.lessThanOrEqualTo) {
          acc[key as keyof T] = { $lte: rule[0].value };
        } else if (rule[0].op === Operators.contains) {
          acc[key as keyof T] = {
            $regex: `.*${escapeRegExp(String(rule[0].value))}.*`,
            $options: "gi",
          };
        } else {
          acc[key as keyof T] = rule[0].value;
        }
      } else if (rule.length > 1) {
        acc[key as keyof T] = rule.reduce(
          (field: { [key: string]: any }, v) => {
            if (v.op === Operators.equal) {
              field["$in"] = field["$in"]
                ? [...field["$in"], v.value]
                : [v.value];
            } else if (v.op === Operators.notEqual) {
              field["$nin"] = field["$nin"]
                ? [...field["$nin"], v.value]
                : [v.value];
            } else if (v.op === Operators.greaterThan) {
              field["$gt"] = v.value;
            } else if (v.op === Operators.lessThan) {
              field["$lt"] = v.value;
            } else if (v.op === Operators.greaterThanOrEqualTo) {
              field["$gte"] = v.value;
            } else if (v.op === Operators.lessThanOrEqualTo) {
              field["$lte"] = v.value;
            } else if (v.op === Operators.contains) {
              const r = new RegExp(
                `.*${escapeRegExp(String(v.value))}.*`,
                "gi"
              );
              field["$in"] = field["$in"] ? [...field["$in"], r] : [r];
            }
            return field;
          },
          {}
        );
      }
    }
    return acc;
  }, {} as { [key in keyof T]: any });
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

export function toArray<T extends AnyDict<T>>(
  filter: Filters<T>
): RulesArray<T, keyof T>[] {
  return Object.keys(filter).reduce((acc, v) => {
    (filter[v as keyof T] as IRule<T, keyof T>[]).forEach((element) => {
      acc.push([v as keyof T, element.op, element.value]);
    });
    return acc;
  }, [] as RulesArray<T, keyof T>[]);
}
