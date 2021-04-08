import { addRule, toMongoQuery, Filters, Operators } from "../src";
import { isNumeric } from "../src/lib";

interface I {
  string: string;
  number: number;
  boolean: boolean;
  bigint: bigint;
  string_arr: string[];
  boolean_arr: boolean[];
  number_arr: number[];
  bigint_arr: bigint[];
}

describe("add rules", () => {
  it("values empty op", (done) => {
    const f = addRule({} as Filters<I>, "string", Operators.equal, "string");
    expect(f["string"]).toEqual([{ op: Operators.equal, value: "string" }]);
    done();
  });
  it("values ", (done) => {
    const f = addRule({} as Filters<I>, "string", Operators.contains, "string");
    expect(f["string"]).toEqual([{ op: Operators.contains, value: "string" }]);
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
      { op: Operators.contains, value: "fooo" },
      { op: Operators.contains, value: "bar" },
    ]);
    expect(toMongoQuery(f).string["$in"][0].toString()).toBe("/.*fooo.*/gi");
    expect(toMongoQuery(f).string["$in"][1].toString()).toBe("/.*bar.*/gi");
    done();
  });
  it("property is array", (done) => {
    const f = addRule(
      addRule(
        addRule(
          addRule({} as Filters<I>, "string_arr", Operators.equal, "bar"),
          "boolean_arr",
          Operators.equal,
          true
        ),
        "number_arr",
        Operators.equal,
        1
      ),
      "bigint_arr",
      Operators.equal,
      //@ts-ignore
      34n
    );
    expect(f["string_arr"]).toEqual([{ op: Operators.equal, value: "bar" }]);
    expect(f["boolean_arr"]).toEqual([{ op: Operators.equal, value: true }]);
    expect(f["number_arr"]).toEqual([{ op: Operators.equal, value: 1 }]);
    //@ts-ignore
    expect(f["bigint_arr"]).toEqual([{ op: Operators.equal, value: 34n }]);
    done();
  });
});

describe("addRule runtime checks", () => {
  it("contains filter on non string rule", (done) => {
    expect(() =>
      addRule({} as Filters<I>, "boolean", Operators.contains, true)
    ).toThrow('only string fields can be filtered by "contain (~)" filter');
    expect(() =>
      addRule({} as Filters<I>, "number", Operators.contains, 1)
    ).toThrow('only string fields can be filtered by "contain (~)" filter');
    expect(() =>
      addRule({} as Filters<I>, "boolean_arr", Operators.contains, true)
    ).toThrow('only string fields can be filtered by "contain (~)" filter');
    expect(() =>
      addRule({} as Filters<I>, "number_arr", Operators.contains, 1)
    ).toThrow('only string fields can be filtered by "contain (~)" filter');
    expect(() =>
      //@ts-ignore
      addRule({} as Filters<I>, "bigint_arr", Operators.contains, 34n)
    ).toThrow('only string fields can be filtered by "contain (~)" filter');

    done();
  });
  it(">,<, >=, <= filters on non int rule", (done) => {
    expect(() =>
      addRule({} as Filters<I>, "boolean", Operators.greaterThan, true)
    ).toThrow(
      'only number fields can be filtered by "greater than (>)" filter'
    );
    expect(() =>
      addRule({} as Filters<I>, "boolean", Operators.lessThan, true)
    ).toThrow('only number fields can be filtered by "less than (<)" filter');
    expect(() =>
      addRule({} as Filters<I>, "boolean", Operators.greaterThanOrEqualTo, true)
    ).toThrow(
      'only number fields can be filtered by "greater than or equal to (>=)" filter'
    );
    expect(() =>
      addRule({} as Filters<I>, "boolean", Operators.lessThanOrEqualTo, true)
    ).toThrow(
      'only number fields can be filtered by "less than or equal to (<=)" filter'
    );
    expect(() =>
      addRule({} as Filters<I>, "string", Operators.greaterThan, "true")
    ).toThrow(
      'only number fields can be filtered by "greater than (>)" filter'
    );
    expect(() =>
      addRule({} as Filters<I>, "string", Operators.lessThan, "true")
    ).toThrow('only number fields can be filtered by "less than (<)" filter');
    expect(() =>
      addRule(
        {} as Filters<I>,
        "string",
        Operators.greaterThanOrEqualTo,
        "true"
      )
    ).toThrow(
      'only number fields can be filtered by "greater than or equal to (>=)" filter'
    );
    expect(() =>
      addRule({} as Filters<I>, "string", Operators.lessThanOrEqualTo, "true")
    ).toThrow(
      'only number fields can be filtered by "less than or equal to (<=)" filter'
    );
    expect(() =>
      addRule({} as Filters<I>, "boolean_arr", Operators.greaterThan, true)
    ).toThrow(
      'only number fields can be filtered by "greater than (>)" filter'
    );
    expect(() =>
      addRule({} as Filters<I>, "boolean_arr", Operators.lessThan, true)
    ).toThrow('only number fields can be filtered by "less than (<)" filter');
    expect(() =>
      addRule(
        {} as Filters<I>,
        "boolean_arr",
        Operators.greaterThanOrEqualTo,
        true
      )
    ).toThrow(
      'only number fields can be filtered by "greater than or equal to (>=)" filter'
    );
    expect(() =>
      addRule(
        {} as Filters<I>,
        "boolean_arr",
        Operators.lessThanOrEqualTo,
        true
      )
    ).toThrow(
      'only number fields can be filtered by "less than or equal to (<=)" filter'
    );
    expect(() =>
      addRule({} as Filters<I>, "string_arr", Operators.greaterThan, "true")
    ).toThrow(
      'only number fields can be filtered by "greater than (>)" filter'
    );
    expect(() =>
      addRule({} as Filters<I>, "string_arr", Operators.lessThan, "true")
    ).toThrow('only number fields can be filtered by "less than (<)" filter');
    expect(() =>
      addRule(
        {} as Filters<I>,
        "string_arr",
        Operators.greaterThanOrEqualTo,
        "true"
      )
    ).toThrow(
      'only number fields can be filtered by "greater than or equal to (>=)" filter'
    );
    expect(() =>
      addRule(
        {} as Filters<I>,
        "string_arr",
        Operators.lessThanOrEqualTo,
        "true"
      )
    ).toThrow(
      'only number fields can be filtered by "less than or equal to (<=)" filter'
    );

    done();
  });
  it("contains pass on string", (done) => {
    expect(() => {
      addRule({} as Filters<I>, "string", Operators.contains, "foo");
      addRule({} as Filters<I>, "string_arr", Operators.contains, "foo");
    }).not.toThrow();
    done();
  });
  it(">,<, >=, <= pass on number and bigint", (done) => {
    expect(() => {
      Object.values(Operators)
        .filter((op) => isNumeric(op) && op !== Operators.contains)
        .forEach((op) => {
          addRule({} as Filters<I>, "number", op as Operators, 1);
          addRule({} as Filters<I>, "number_arr", op as Operators, 1);
          //@ts-ignore
          addRule({} as Filters<I>, "bigint", op as Operators, 1n);
          //@ts-ignore
          addRule({} as Filters<I>, "bigint_arr", op as Operators, 1n);

        });
    }).not.toThrow();
    done();
  });
});
