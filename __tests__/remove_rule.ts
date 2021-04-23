import { addRule, removeRule, Filters, Operators } from "../src";

interface I {
  string: string;
  number: number;
  boolean: boolean;
  string_arr: string[];
  boolean_arr: boolean[];
  number_arr: number[];
}

describe("remove rule", () => {
  it("should remove rule", (done) => {
    const f = addRule(
      addRule([] as Filters<I>, "string", Operators.equal, "string"),
      "boolean_arr",
      Operators.equal,
      true
    );
    const removed = removeRule(f, 0);
    expect(f === removed).toBeFalsy();
    expect(removed).toHaveLength(1);
    expect(removed[0][0]).toEqual("boolean_arr");
    done();
  });
});
