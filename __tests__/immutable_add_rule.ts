import { addRule, Filters, Operators } from "../src";

interface I {
  string: string;
  number: number;
  boolean: boolean;
  string_arr: string[];
  boolean_arr: boolean[];
  number_arr: number[];
}

describe("add rules", () => {
  it("top level", (done) => {
    const filter = addRule(
      [] as Filters<I>,
      "string",
      Operators.equal,
      "string"
    );
    const filter2 = addRule(filter, "boolean", Operators.equal, true);
    expect(filter === filter2).toBeFalsy();
    const filter3 = addRule(filter, "string", Operators.equal, "true");
    expect(filter === filter3).toBeFalsy();
    done();
  });
});
