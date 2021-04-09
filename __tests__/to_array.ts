import { fromArray, Operators, toArray } from "../src";

interface I {
  foo: number;
  bar: boolean;
  baz: boolean;
  str: string;
}
describe("to array", () => {
  it("happy path", (done) => {
    const array = [
      ["bar", Operators.equal, true],
      ["foo", Operators.greaterThan, 1],
      ["foo", Operators.greaterThanOrEqualTo, 1],
      ["foo", Operators.lessThanOrEqualTo, 1],
      ["foo", Operators.lessThan, 1],
      ["foo", Operators.notEqual, 1],
      ["str", Operators.equal, "fooo"],
      ["str", Operators.contains, "fooo"],
    ];
    const filter = fromArray<I>(array as any);
    const res = toArray<I>(filter);

    expect(res).toEqual(array);
    done();
  });
});
