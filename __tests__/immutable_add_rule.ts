import { addRule, Filters } from "../src";

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
    const filter = addRule({} as Filters<I>, "string", "=", "string");
    const filter2 = addRule(filter, "boolean", "=", true);
    expect(filter === filter2).toBeFalsy();
    const filter3 = addRule(filter, "string", "=", "true");
    expect(filter === filter3).toBeFalsy();
    done();
  });
  it("key level", (done) => {
    const filter = addRule({} as Filters<I>, "string", "=", "string");
    const filter2 = addRule(filter, "string", "=", "true");
    expect(filter["string"] === filter2["string"]).toBeFalsy();
    const filter3 = addRule(filter, "boolean", "=", true);
    expect(filter["string"] === filter3["string"]).toBeTruthy();
    done();
  });
});
