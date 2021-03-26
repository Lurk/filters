import { addRule, removeRule, Filters } from "../src";

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
      addRule({} as Filters<I>, "string", "=", "string"),
      "boolean_arr",
      "=",
      true
    );
    const removed = removeRule(f, "string");
    expect(f === removed).toBeFalsy();
    expect(removed["string"]).toEqual(undefined);
    expect(removed["boolean_arr"]).toHaveLength(1);
    done();
  });
});
