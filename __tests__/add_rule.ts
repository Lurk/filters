import { addRule, toMongoQuery, Filters } from "../src";

interface I {
  string: string;
  number: number;
  boolean: boolean;
  string_arr: string[];
  boolean_arr: boolean[];
  number_arr: number[];
}

describe("add rules", () => {
  it("values empty op", (done) => {
    const f = addRule({} as Filters<I>, "string", "=", "string");
    expect(f["string"]).toEqual([{ op: "=", type: "str", value: "string" }]);
    done();
  });
  it("values ", (done) => {
    const f = addRule({} as Filters<I>, "string", "~", "string");
    expect(f["string"]).toEqual([{ op: "~", type: "str", value: "string" }]);
    done();
  });
  it("values in", (done) => {
    const f = addRule(
      addRule({} as Filters<I>, "string", "~", "fooo"),
      "string",
      "~",
      "bar"
    );
    expect(f["string"]).toEqual([
      { op: "~", type: "str", value: "fooo" },
      { op: "~", type: "str", value: "bar" },
    ]);
    expect(toMongoQuery(f).string["$in"][0].toString()).toBe("/.*fooo.*/gi");
    expect(toMongoQuery(f).string["$in"][1].toString()).toBe("/.*bar.*/gi");
    done();
  });
  it("property is array", (done) => {
    const f = addRule(
      addRule(
        addRule({} as Filters<I>, "string_arr", "=", "bar"),
        "boolean_arr",
        "=",
        true
      ),
      "number_arr",
      "=",
      1
    );
    expect(f["string_arr"]).toEqual([{ op: "=", type: "str", value: "bar" }]);
    expect(f["boolean_arr"]).toEqual([{ op: "=", type: "bool", value: true }]);
    expect(f["number_arr"]).toEqual([{ op: "=", type: "number", value: 1 }]);
    done();
  });
});

describe("addRule runtime checks", () => {
  it("contains filter on non string rule", (done) => {
    expect(() => addRule({} as Filters<I>, "boolean", "~", true)).toThrow(
      'only string fields can be filtered by "contain (~)" filter'
    );
    expect(() => addRule({} as Filters<I>, "number", "~", 1)).toThrow(
      'only string fields can be filtered by "contain (~)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean_arr", "~", true)).toThrow(
      'only string fields can be filtered by "contain (~)" filter'
    );
    expect(() => addRule({} as Filters<I>, "number_arr", "~", 1)).toThrow(
      'only string fields can be filtered by "contain (~)" filter'
    );

    done();
  });
  it(">,<, >=, <= filters on non int rule", (done) => {
    expect(() => addRule({} as Filters<I>, "boolean", ">", true)).toThrow(
      'only number fields can be filtered by "greater than (>)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean", "<", true)).toThrow(
      'only number fields can be filtered by "lower than (<)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean", ">=", true)).toThrow(
      'only number fields can be filtered by "greater or equal than (>=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean", "<=", true)).toThrow(
      'only number fields can be filtered by "lower or equal than (<=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string", ">", "true")).toThrow(
      'only number fields can be filtered by "greater than (>)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string", "<", "true")).toThrow(
      'only number fields can be filtered by "lower than (<)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string", ">=", "true")).toThrow(
      'only number fields can be filtered by "greater or equal than (>=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string", "<=", "true")).toThrow(
      'only number fields can be filtered by "lower or equal than (<=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean_arr", ">", true)).toThrow(
      'only number fields can be filtered by "greater than (>)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean_arr", "<", true)).toThrow(
      'only number fields can be filtered by "lower than (<)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean_arr", ">=", true)).toThrow(
      'only number fields can be filtered by "greater or equal than (>=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean_arr", "<=", true)).toThrow(
      'only number fields can be filtered by "lower or equal than (<=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string_arr", ">", "true")).toThrow(
      'only number fields can be filtered by "greater than (>)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string_arr", "<", "true")).toThrow(
      'only number fields can be filtered by "lower than (<)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string_arr", ">=", "true")).toThrow(
      'only number fields can be filtered by "greater or equal than (>=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string_arr", "<=", "true")).toThrow(
      'only number fields can be filtered by "lower or equal than (<=)" filter'
    );

    done();
  });
});
