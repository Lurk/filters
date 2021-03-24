import { addRule, createFilterCb, Filters } from "../src";

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
      createFilterCb(addRule({} as Filters<I>, "boolean", "=", false))(t)
    ).toBeTruthy();
    expect(
      createFilterCb(addRule({} as Filters<I>, "boolean", "=", true))(t)
    ).toBeFalsy();
    done();
  });

  it("number", (done) => {
    expect(
      createFilterCb(addRule({} as Filters<I>, "number", "=", 5))(t)
    ).toBeTruthy();
    expect(
      createFilterCb(addRule({} as Filters<I>, "number", "=", 2))(t)
    ).toBeFalsy();
    expect(
      createFilterCb(addRule({} as Filters<I>, "number", "<", 8))(t)
    ).toBeTruthy();
    expect(
      createFilterCb(addRule({} as Filters<I>, "number", "<=", 5))(t)
    ).toBeTruthy();
    expect(
      createFilterCb(addRule({} as Filters<I>, "number", ">=", 0))(t)
    ).toBeTruthy();
    expect(
      createFilterCb(addRule({} as Filters<I>, "number", ">", 0))(t)
    ).toBeTruthy();
    expect(
      createFilterCb(
        addRule(addRule({} as Filters<I>, "number", ">", 0), "number", "<", 4)
      )(t)
    ).toBeFalsy();

    done();
  });
  it("number_arr", (done) => {
    expect(
      createFilterCb(addRule({} as Filters<I>, "number_arr", "=", 5))(t)
    ).toBeTruthy();
    expect(
      createFilterCb(addRule({} as Filters<I>, "number_arr", "=", 4))(t)
    ).toBeFalsy();
    done();
  });

  it("in", (done) => {
    expect(
      createFilterCb(
        addRule(addRule({} as Filters<I>, "number", "=", 2), "number", "=", 5)
      )(t)
    ).toBeTruthy();
    done();
  });
  it("string", (done) => {
    expect(
      createFilterCb(addRule({} as Filters<I>, "string", "=", "foo"))(t)
    ).toBeTruthy();
    expect(
      createFilterCb(addRule({} as Filters<I>, "string", "~", "o"))(t)
    ).toBeTruthy();
    done();
  });
  it("!=", (done) => {
    expect(
      createFilterCb(addRule({} as Filters<I>, "string", "!=", "0"))(t)
    ).toBeTruthy();
    expect(
      createFilterCb(addRule({} as Filters<I>, "boolean", "!=", true))(t)
    ).toBeTruthy();
    done();
  });
  it("!= and in", (done) => {
    expect(
      createFilterCb(
        addRule(
          addRule(
            addRule({} as Filters<I>, "number", "=", 5),
            "string",
            "!=",
            "0"
          ),
          "number",
          "=",
          2
        )
      )(t)
    ).toBeTruthy();
    done();
  });
});
