import {
  addRule,
  toString,
  fromString,
  Filters,
  fromArray,
  Operators,
} from "../src";

interface I {
  foo: number;
  bar: boolean;
  baz: boolean;
  str: string;
}
describe("from string", () => {
  it("number", (done) => {
    const filter = addRule([] as Filters<I>, "foo", Operators.equal, 1);

    const f = fromString<I>(toString(filter));
    expect(f).toHaveLength(1);
    expect(f[0]).toEqual(["foo", Operators.equal, 1]);
    done();
  });
  it("boolean", (done) => {
    const filter = addRule(
      addRule([] as Filters<I>, "baz", Operators.equal, true),
      "bar",
      Operators.equal,
      false
    );
    const f = fromString<I>(toString(filter));
    expect(f).toHaveLength(2);
    expect(f[0]).toEqual(["baz", Operators.equal, true]);
    expect(f[1]).toEqual(["bar", Operators.equal, false]);
    done();
  });
  it("array", (done) => {
    const filter = addRule(
      addRule([] as Filters<I>, "bar", Operators.equal, true),
      "bar",
      Operators.equal,
      false
    );
    const f = fromString<I>(toString(filter));
    expect(f).toHaveLength(2);
    expect(f[0]).toEqual(["bar", Operators.equal, true]);
    expect(f[1]).toEqual(["bar", Operators.equal, false]);
    done();
  });
  it("string with :", (done) => {
    const filter = addRule([] as Filters<I>, "str", Operators.equal, "bar:");
    const f = fromString<I>(toString(filter));
    expect(f).toEqual([["str", Operators.equal, "bar:"]]);
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
    expect(f).toHaveLength(8);
    expect(f).toEqual([
      ["bar", Operators.equal, true],
      ["foo", Operators.greaterThan, 1],
      ["foo", Operators.greaterThanOrEqualTo, 1],
      ["foo", Operators.lessThanOrEqualTo, 1],
      ["foo", Operators.lessThan, 1],
      ["foo", Operators.notEqual, 1],
      ["str", Operators.equal, "fooo"],
      ["str", Operators.contains, "fooo"],
    ]);
    done();
  });
});
