import { addRule, toString, fromString, Filters, fromArray } from "../src";

interface I {
  foo: number;
  bar: boolean;
  baz: boolean;
  str: string;
}
describe("from string", () => {
  it("number", (done) => {
    const filter = addRule({} as Filters<I>, "foo", "=", 1);

    const f = fromString<I>(toString(filter));
    const foo = f["foo"];
    expect(foo).toHaveLength(1);
    if (foo) {
      expect(foo[0]).toEqual({ op: "=", type: "number", value: 1 });
    }
    done();
  });
  it("boolean", (done) => {
    const filter = addRule(
      addRule({} as Filters<I>, "baz", "=", true),
      "bar",
      "=",
      false
    );
    const f = fromString<I>(toString(filter));
    expect(f.baz).toHaveLength(1);
    if (f.baz) {
      expect(f.baz[0]).toEqual({ op: "=", type: "bool", value: true });
    }
    expect(f.bar).toHaveLength(1);
    if (f.bar) {
      expect(f.bar[0]).toEqual({ op: "=", type: "bool", value: false });
    }
    done();
  });
  it("array", (done) => {
    const filter = addRule(
      addRule({} as Filters<I>, "bar", "=", true),
      "bar",
      "=",
      false
    );
    const f = fromString<I>(toString(filter));
    expect(f.bar).toHaveLength(2);
    if (f.bar) {
      expect(f.bar[0]).toEqual({ op: "=", type: "bool", value: true });
      expect(f.bar[1]).toEqual({ op: "=", type: "bool", value: false });
    }
    done();
  });
  it("string with :", (done) => {
    const filter = addRule({} as Filters<I>, "str", "=", "bar");
    const f = fromString<I>(toString(filter));
    expect(f.str).toEqual([
      { op: "=", type: "str", value: "bar" },
    ]);
    done();
  });
  it("ops", (done) => {
    const filter = fromArray<I>([
      ["bar", "=", true],
      ["foo", ">", 1],
      ["foo", ">=", 1],
      ["foo", "<=", 1],
      ["foo", "<", 1],
      ["foo", "!=", 1],
      ["str", "=", "fooo"],
      ["str", "~", "fooo"],
    ]);
    const f = fromString<I>(toString(filter));

    expect(f.foo).toEqual([
      { op: ">", type: "number", value: 1 },
      { op: ">=", type: "number", value: 1 },
      { op: "<=", type: "number", value: 1 },
      { op: "<", type: "number", value: 1 },
      { op: "!=", type: "number", value: 1 },
    ]);
    expect(f.str).toEqual([
      { op: "=", type: "str", value: "fooo" },
      { op: "~", type: "str", value: "fooo" },
    ]);
    expect(f.bar).toEqual([{ op: "=", type: "bool", value: true }]);

    done();
  });
});
