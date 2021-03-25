import { addRule, toString, Filters, fromArray } from "../src";

interface I {
  foo: number;
  bar: string;
  baz: boolean;
}

describe("to string", () => {
  it("number", (done) => {
    const f = addRule({} as Filters<I>, "foo", "=", 1);
    expect(toString(f)).toBe('{"foo":[[1]]}');
    done();
  });
  it("string", (done) => {
    const f = addRule({} as Filters<I>, "bar", "=", "fooo");
    expect(toString(f)).toBe('{"bar":[["fooo"]]}');
    done();
  });
  it("boolean", (done) => {
    const f = addRule({} as Filters<I>, "baz", "=", true);
    expect(toString(f)).toBe('{"baz":[[true]]}');
    done();
  });
  it("more than one rule", (done) => {
    const f = addRule(
      addRule(addRule({} as Filters<I>, "baz", "=", true), "foo", "=", 1),
      "bar",
      "=",
      "fooo"
    );
    expect(toString(f)).toBe('{"baz":[[true]],"foo":[[1]],"bar":[["fooo"]]}');
    done();
  });
  it("more than one rule same name", (done) => {
    const f = addRule(
      addRule(addRule({} as Filters<I>, "foo", "=", 1), "foo", "=", 2),
      "bar",
      "=",
      "fooo"
    );
    expect(toString(f)).toBe('{"foo":[[1],[2]],"bar":[["fooo"]]}');
    done();
  });
  it("different ops", (done) => {
    const f = fromArray([
      ["baz", "=", true],
      ["foo", ">", 1],
      ["foo", ">=", 1],
      ["foo", "<=", 1],
      ["foo", "<", 1],
      ["foo", "!=", 1],
      ["bar", "=", "fooo"],
      ["bar", "~", "fooo"],
    ]);

    expect(toString(f)).toBe(
      '{"baz":[[true]],"foo":[[1,">"],[1,">="],[1,"<="],[1,"<"],[1,"!="]],"bar":[["fooo"],["fooo","~"]]}'
    );
    done();
  });
});
