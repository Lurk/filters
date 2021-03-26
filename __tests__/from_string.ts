import { addRule, toString, fromString, Filters, fromArray, Operators } from "../src";

interface I {
  foo: number;
  bar: boolean;
  baz: boolean;
  str: string;
}
describe("from string", () => {
  it("number", (done) => {
    const filter = addRule({} as Filters<I>, "foo", Operators.equal, 1);

    const f = fromString<I>(toString(filter));
    const foo = f["foo"];
    expect(foo).toHaveLength(1);
    if (foo) {
      expect(foo[0]).toEqual({ op: Operators.equal, type: "number", value: 1 });
    }
    done();
  });
  it("boolean", (done) => {
    const filter = addRule(
      addRule({} as Filters<I>, "baz", Operators.equal, true),
      "bar",
      Operators.equal,
      false
    );
    const f = fromString<I>(toString(filter));
    expect(f.baz).toHaveLength(1);
    if (f.baz) {
      expect(f.baz[0]).toEqual({ op: Operators.equal, type: "bool", value: true });
    }
    expect(f.bar).toHaveLength(1);
    if (f.bar) {
      expect(f.bar[0]).toEqual({ op: Operators.equal, type: "bool", value: false });
    }
    done();
  });
  it("array", (done) => {
    const filter = addRule(
      addRule({} as Filters<I>, "bar", Operators.equal, true),
      "bar",
      Operators.equal,
      false
    );
    const f = fromString<I>(toString(filter));
    expect(f.bar).toHaveLength(2);
    if (f.bar) {
      expect(f.bar[0]).toEqual({ op: Operators.equal, type: "bool", value: true });
      expect(f.bar[1]).toEqual({ op: Operators.equal, type: "bool", value: false });
    }
    done();
  });
  it("string with :", (done) => {
    const filter = addRule({} as Filters<I>, "str", Operators.equal, "bar");
    const f = fromString<I>(toString(filter));
    expect(f.str).toEqual([{ op: Operators.equal, type: "str", value: "bar" }]);
    done();
  });
  it("ops", (done) => {
    const filter = fromArray<I>([
      ["bar", Operators.equal, true],
      ["foo", Operators.greaterThan, 1],
      ["foo", Operators.greaterThanOrEqualTo, 1],
      ["foo", Operators.lessThanOrEqualTo, 1],
      ["foo", Operators.lessThan, 1],
      ["foo", Operators.notEqual, 1],
      ["str", Operators.equal, "fooo"],
      ["str", Operators.contains, "fooo"],
    ]);
    const f = fromString<I>(toString(filter));

    expect(f.foo).toEqual([
      { op: Operators.greaterThan, type: "number", value: 1 },
      { op: Operators.greaterThanOrEqualTo, type: "number", value: 1 },
      { op: Operators.lessThanOrEqualTo, type: "number", value: 1 },
      { op: Operators.lessThan, type: "number", value: 1 },
      { op: Operators.notEqual, type: "number", value: 1 },
    ]);
    expect(f.str).toEqual([
      { op: Operators.equal, type: "str", value: "fooo" },
      { op: Operators.contains, type: "str", value: "fooo" },
    ]);
    expect(f.bar).toEqual([{ op: Operators.equal, type: "bool", value: true }]);

    done();
  });
});
