import { addRule, toFilterCb, Filters, Operators } from "../src";

interface I {
  number: number;
  string: string;
  boolean: boolean;
  number_arr: number[];
}

const t: I = {
  number: 5,
  string: "foo",
  boolean: false,
  number_arr: [5, 6],
};

describe("filter cb", () => {
  it("boolean", (done) => {
    expect(
      toFilterCb(addRule({} as Filters<I>, "boolean", Operators.equal, false))(t)
    ).toBeTruthy();
    expect(
      toFilterCb(addRule({} as Filters<I>, "boolean", Operators.equal, true))(t)
    ).toBeFalsy();
    done();
  });

  it("number", (done) => {
    expect(
      toFilterCb(addRule({} as Filters<I>, "number", Operators.equal, 5))(t)
    ).toBeTruthy();
    expect(
      toFilterCb(addRule({} as Filters<I>, "number", Operators.equal, 2))(t)
    ).toBeFalsy();
    expect(
      toFilterCb(addRule({} as Filters<I>, "number", Operators.lessThan, 8))(t)
    ).toBeTruthy();
    expect(
      toFilterCb(addRule({} as Filters<I>, "number", Operators.lessThanOrEqualTo, 5))(t)
    ).toBeTruthy();
    expect(
      toFilterCb(addRule({} as Filters<I>, "number", Operators.greaterThanOrEqualTo, 0))(t)
    ).toBeTruthy();
    expect(
      toFilterCb(addRule({} as Filters<I>, "number", Operators.greaterThan, 0))(t)
    ).toBeTruthy();
    expect(
      toFilterCb(
        addRule(addRule({} as Filters<I>, "number", Operators.greaterThan, 0), "number", Operators.lessThan, 4)
      )(t)
    ).toBeFalsy();

    done();
  });
  it("number_arr", (done) => {
    expect(
      toFilterCb(addRule({} as Filters<I>, "number_arr", Operators.equal, 5))(t)
    ).toBeTruthy();
    expect(
      toFilterCb(addRule({} as Filters<I>, "number_arr", Operators.equal, 4))(t)
    ).toBeFalsy();
    done();
  });

  it("in", (done) => {
    expect(
      toFilterCb(
        addRule(addRule({} as Filters<I>, "number", Operators.equal, 2), "number", Operators.equal, 5)
      )(t)
    ).toBeTruthy();
    done();
  });
  it("string", (done) => {
    expect(
      toFilterCb(addRule({} as Filters<I>, "string", Operators.equal, "foo"))(t)
    ).toBeTruthy();
    expect(
      toFilterCb(addRule({} as Filters<I>, "string", Operators.contains, "o"))(t)
    ).toBeTruthy();
    done();
  });
  it("!=", (done) => {
    expect(
      toFilterCb(addRule({} as Filters<I>, "string", Operators.notEqual, "0"))(t)
    ).toBeTruthy();
    expect(
      toFilterCb(addRule({} as Filters<I>, "boolean", Operators.notEqual, true))(t)
    ).toBeTruthy();
    done();
  });
  it("!= and in", (done) => {
    expect(
      toFilterCb(
        addRule(
          addRule(
            addRule({} as Filters<I>, "number", Operators.equal, 5),
            "string",
            Operators.notEqual,
            "0"
          ),
          "number",
          Operators.equal,
          2
        )
      )(t)
    ).toBeTruthy();
    done();
  });
});
