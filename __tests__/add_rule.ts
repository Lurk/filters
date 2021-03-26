import { addRule, toMongoQuery, Filters, Operators } from "../src";

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
    const f = addRule({} as Filters<I>, "string", Operators.equal, "string");
    expect(f["string"]).toEqual([{ op: Operators.equal, type: "str", value: "string" }]);
    done();
  });
  it("values ", (done) => {
    const f = addRule({} as Filters<I>, "string", Operators.contains, "string");
    expect(f["string"]).toEqual([{ op: Operators.contains, type: "str", value: "string" }]);
    done();
  });
  it("values in", (done) => {
    const f = addRule(
      addRule({} as Filters<I>, "string", Operators.contains, "fooo"),
      "string",
      Operators.contains,
      "bar"
    );
    expect(f["string"]).toEqual([
      { op: Operators.contains, type: "str", value: "fooo" },
      { op: Operators.contains, type: "str", value: "bar" },
    ]);
    expect(toMongoQuery(f).string["$in"][0].toString()).toBe("/.*fooo.*/gi");
    expect(toMongoQuery(f).string["$in"][1].toString()).toBe("/.*bar.*/gi");
    done();
  });
  it("property is array", (done) => {
    const f = addRule(
      addRule(
        addRule({} as Filters<I>, "string_arr", Operators.equal, "bar"),
        "boolean_arr",
        Operators.equal,
        true
      ),
      "number_arr",
      Operators.equal,
      1
    );
    expect(f["string_arr"]).toEqual([{ op: Operators.equal, type: "str", value: "bar" }]);
    expect(f["boolean_arr"]).toEqual([{ op: Operators.equal, type: "bool", value: true }]);
    expect(f["number_arr"]).toEqual([{ op: Operators.equal, type: "number", value: 1 }]);
    done();
  });
});

describe("addRule runtime checks", () => {
  it("contains filter on non string rule", (done) => {
    expect(() => addRule({} as Filters<I>, "boolean", Operators.contains, true)).toThrow(
      'only string fields can be filtered by "contain (~)" filter'
    );
    expect(() => addRule({} as Filters<I>, "number", Operators.contains, 1)).toThrow(
      'only string fields can be filtered by "contain (~)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean_arr", Operators.contains, true)).toThrow(
      'only string fields can be filtered by "contain (~)" filter'
    );
    expect(() => addRule({} as Filters<I>, "number_arr", Operators.contains, 1)).toThrow(
      'only string fields can be filtered by "contain (~)" filter'
    );

    done();
  });
  it(">,<, >=, <= filters on non int rule", (done) => {
    expect(() => addRule({} as Filters<I>, "boolean", Operators.greaterThan, true)).toThrow(
      'only number fields can be filtered by "greater than (>)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean", Operators.lessThan, true)).toThrow(
      'only number fields can be filtered by "less than (<)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean", Operators.greaterThanOrEqualTo, true)).toThrow(
      'only number fields can be filtered by "greater than or equal to (>=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean", Operators.lessThanOrEqualTo, true)).toThrow(
      'only number fields can be filtered by "less than or equal to (<=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string", Operators.greaterThan, "true")).toThrow(
      'only number fields can be filtered by "greater than (>)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string", Operators.lessThan, "true")).toThrow(
      'only number fields can be filtered by "less than (<)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string", Operators.greaterThanOrEqualTo, "true")).toThrow(
      'only number fields can be filtered by "greater than or equal to (>=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string", Operators.lessThanOrEqualTo, "true")).toThrow(
      'only number fields can be filtered by "less than or equal to (<=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean_arr", Operators.greaterThan, true)).toThrow(
      'only number fields can be filtered by "greater than (>)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean_arr", Operators.lessThan, true)).toThrow(
      'only number fields can be filtered by "less than (<)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean_arr", Operators.greaterThanOrEqualTo, true)).toThrow(
      'only number fields can be filtered by "greater than or equal to (>=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "boolean_arr", Operators.lessThanOrEqualTo, true)).toThrow(
      'only number fields can be filtered by "less than or equal to (<=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string_arr", Operators.greaterThan, "true")).toThrow(
      'only number fields can be filtered by "greater than (>)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string_arr", Operators.lessThan, "true")).toThrow(
      'only number fields can be filtered by "less than (<)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string_arr", Operators.greaterThanOrEqualTo, "true")).toThrow(
      'only number fields can be filtered by "greater than or equal to (>=)" filter'
    );
    expect(() => addRule({} as Filters<I>, "string_arr", Operators.lessThanOrEqualTo, "true")).toThrow(
      'only number fields can be filtered by "less than or equal to (<=)" filter'
    );

    done();
  });
});
