import { addRule, toMongoQuery, Filters,  } from "../src";

describe("add rules", () => {
  interface I {
    a: string;
    b: number;
    foo: string;
    string_arr: string[];
    boolean_arr: boolean[];
    number_arr: number[];
  }
  it("values empty op", (done) => {
    const f = addRule({} as Filters<I>, "a", "string");
    expect(f["a"]).toEqual([{ op: "=", type: "str", value: "string" }]);
    done();
  });
  it("values ", (done) => {
    const f = addRule({} as Filters<I>, "a", "string", "~");
    expect(f["a"]).toEqual([{ op: "~", type: "str", value: "string" }]);
    done();
  });
  it("values in", (done) => {
    const f = addRule(
      addRule({} as Filters<I>, "foo", "fooo", "~"),
      "foo",
      "bar",
      "~"
    );
    expect(f["foo"]).toEqual([
      { op: "~", type: "str", value: "fooo" },
      { op: "~", type: "str", value: "bar" },
    ]);
    expect(toMongoQuery(f).foo["$in"][0].toString()).toBe("/.*fooo.*/gi");
    expect(toMongoQuery(f).foo["$in"][1].toString()).toBe("/.*bar.*/gi");
    done();
  });
  it("property is array", (done) => {
    const f = addRule(
      addRule(
        addRule({} as Filters<I>, "string_arr", "bar"),
        "boolean_arr",
        true
      ),
      "number_arr",
      1
    );
    expect(f["string_arr"]).toEqual([{ op: "=", type: "str", value: "bar" }]);
    expect(f["boolean_arr"]).toEqual([{ op: "=", type: "bool", value: true }]);
    expect(f["number_arr"]).toEqual([{ op: "=", type: "number", value: 1 }]);
    done();
  });
});
