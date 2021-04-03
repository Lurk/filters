import { fromQueryString, fromArray, Operators, toQueryString } from "../src";

interface I {
  foo: number;
  bar: string;
  baz: boolean;
}

describe("to/from query string", () => {
  it("from string decodes to same filter", (done) => {
    const f = fromArray<I>([
      ["baz", Operators.equal, true],
      ["foo", Operators.greaterThan, 1],
      ["foo", Operators.greaterThanOrEqualTo, 1],
      ["foo", Operators.lessThanOrEqualTo, 1],
      ["foo", Operators.lessThan, 1],
      ["foo", Operators.notEqual, 1],
      ["bar", Operators.equal, "fooo"],
      ["bar", Operators.contains, "fooo"],
    ]);

    expect(fromQueryString(toQueryString(f))).toEqual(f);

    done();
  });
});
