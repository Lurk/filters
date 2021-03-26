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

type AnyDict<T> = Record<
  keyof T,
  string | number | boolean | string[] | boolean[] | number[]
>;

type Value<T extends AnyDict<T>, K extends keyof T> = T[K] extends string[]
  ? string
  : T[K] extends number[]
  ? number
  : T[K] extends boolean[]
  ? boolean
  : T[K];

type MarshaledRule<T extends AnyDict<T>, K extends keyof T> =
  | [Value<T, K>, Ops]
  | [Value<T, K>];

interface IRule<T extends AnyDict<T>, K extends keyof T> {
  type: Types;
  op: Ops;
  value: Value<T, K>;
}

export type Filters<T extends AnyDict<T>> = {
  [key in keyof T]?: IRule<T, keyof T>[];
};

export type FromArrayArgumentsInterface<
  T extends AnyDict<T>,
  K extends keyof T
> = [K, Ops, Value<T, K>];

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
        const type = typeToString(chunk[0]);
        return addOrUpdateRule(acc2, key as keyof T, {
          type,
          value: chunk[0],
          op: toOp(chunk[1] || "="),
        });
      },
      acc
    );
  }, {} as Filters<T>);
}

export function fromQueryString<T extends AnyDict<T>>(str: string): Filters<T> {
  return fromString(decodeURIComponent(str));
}

export function addRule<T extends AnyDict<T>, K extends keyof T>(
  filter: Filters<T>,
  key: K,
  op: Ops,
  value: Value<T, K>
): Filters<T> {
  if (!op) {
    op = "=";
  }

  if (op === "~" && !isString(value)) {
    throw new Error(
      `only string fields can be filtered by "${opToText(op)}" filter`
    );
  } else if ([">", "<", ">=", "<="].includes(op) && !isNumeric(value)) {
    throw new Error(
      `only number fields can be filtered by "${opToText(op)}" filter`
    );
  }

  return addOrUpdateRule(filter, key as keyof T, {
    type: typeToString(value),
    value: value,
    op,
  });
}

export function fromArray<T extends AnyDict<T>>(
  array: FromArrayArgumentsInterface<T, keyof T>[]
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
  const {[key]: undefined, ...rest} = filter;
  return rest as Filters<T>;
}

export function toString<T extends AnyDict<T>, K extends keyof T>(
  filter: Filters<T>
) {
  return JSON.stringify(
    Object.keys(filter).reduce((acc: Dict<MarshaledRule<T, K>[]>, key) => {
      //TODO wtf typescript
      acc[key] = (filter[key as K] as IRule<T, K>[]).map((r) =>
        r.op === "=" ? [r.value] : [r.value, r.op]
      );
      return acc;
    }, {})
  );
}

export function toQueryString<T extends AnyDict<T>>(
  filter: Filters<T>
): string {
  return encodeURIComponent(toString(filter));
}

export function toMongoQuery<T extends AnyDict<T>>(
  filter: Filters<T>
): { [key in keyof T]: any } {
  return Object.keys(filter).reduce((acc: { [key in keyof T]: any }, key) => {
    const rule = filter[key as keyof T];
    if (rule) {
      if (rule.length === 1) {
        if (rule[0].op === "!=") {
          acc[key as keyof T] = { $ne: rule[0].value };
        } else if (rule[0].op === ">") {
          acc[key as keyof T] = { $gt: rule[0].value };
        } else if (rule[0].op === "<") {
          acc[key as keyof T] = { $lt: rule[0].value };
        } else if (rule[0].op === ">=") {
          acc[key as keyof T] = { $gte: rule[0].value };
        } else if (rule[0].op === "<=") {
          acc[key as keyof T] = { $lte: rule[0].value };
        } else if (rule[0].op === "~") {
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
            if (v.op === "=") {
              field["$in"] = field["$in"]
                ? [...field["$in"], v.value]
                : [v.value];
            } else if (v.op === "!=") {
              field["$nin"] = field["$nin"]
                ? [...field["$nin"], v.value]
                : [v.value];
            } else if (v.op === ">") {
              field["$gt"] = v.value;
            } else if (v.op === "<") {
              field["$lt"] = v.value;
            } else if (v.op === ">=") {
              field["$gte"] = v.value;
            } else if (v.op === "<=") {
              field["$lte"] = v.value;
            } else if (v.op === "~") {
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
