import { addRule, toString, Filters, fromArray, Operators } from "../src";

interface I {
  foo: number;
  bar: string;
  baz: boolean;
}

describe("to string", () => {
  it("number", (done) => {
    const f = addRule([] as Filters<I>, "foo", Operators.equal, 1);
    expect(toString(f)).toBe('{"foo":[[1]]}');
    done();
  });
  it("string", (done) => {
    const f = addRule([] as Filters<I>, "bar", Operators.equal, "fooo");
    expect(toString(f)).toBe('{"bar":[["fooo"]]}');
    done();
  });
  it("boolean", (done) => {
    const f = addRule([] as Filters<I>, "baz", Operators.equal, true);
    expect(toString(f)).toBe('{"baz":[[true]]}');
    done();
  });
  it("more than one rule", (done) => {
    const f = addRule(
      addRule(
        addRule([] as Filters<I>, "baz", Operators.equal, true),
        "foo",
        Operators.equal,
        1
      ),
      "bar",
      Operators.equal,
      "fooo"
    );
    expect(toString(f)).toBe('{"baz":[[true]],"foo":[[1]],"bar":[["fooo"]]}');
    done();
  });
  it("more than one rule same name", (done) => {
    const f = addRule(
      addRule(
        addRule([] as Filters<I>, "foo", Operators.equal, 1),
        "foo",
        Operators.equal,
        2
      ),
      "bar",
      Operators.equal,
      "fooo"
    );
    expect(toString(f)).toBe('{"foo":[[1],[2]],"bar":[["fooo"]]}');
    done();
  });
  it("different ops", (done) => {
    const f = fromArray([
      ["baz", Operators.equal, true],
      ["foo", Operators.greaterThan, 1],
      ["foo", Operators.greaterThanOrEqualTo, 1],
      ["foo", Operators.lessThanOrEqualTo, 1],
      ["foo", Operators.lessThan, 1],
      ["foo", Operators.notEqual, 1],
      ["bar", Operators.equal, "fooo"],
      ["bar", Operators.contains, "fooo"],
    ]);

    expect(toString(f)).toBe(
      '{"baz":[[true]],"foo":[[1,2],[1,4],[1,5],[1,3],[1,1]],"bar":[["fooo"],["fooo",6]]}'
    );
    done();
  });
});
