import { addRule, Filters, toFlat } from "../src";

interface I {
  foo: number;
  bar: number;
}

describe("to flat", () => {
  it("happy path", (done) => {
    const f = addRule(addRule({} as Filters<I>, "foo", 1, "="), "foo", 2, "=");

    const flat = toFlat(f);

    expect(flat).toHaveLength(2);
    expect(flat[0].key).toBe("foo");
    expect(flat[0].value).toBe(1);
    expect(flat[0].op).toBe("=");
    expect(flat[0].type).toBe("number");
    expect(flat[1].key).toBe("foo");
    expect(flat[1].value).toBe(2);
    expect(flat[1].op).toBe("=");
    expect(flat[1].type).toBe("number");

    done();
  });
  it("one key", (done) => {
    const f = addRule(addRule({} as Filters<I>, "foo", 1, "="), "bar", 2, "=");

    const flat = toFlat(f);

    expect(flat).toHaveLength(2);
    expect(flat[0].key).toBe("foo");
    expect(flat[0].value).toBe(1);
    expect(flat[0].op).toBe("=");
    expect(flat[0].type).toBe("number");
    expect(flat[1].key).toBe("bar");
    expect(flat[1].value).toBe(2);
    expect(flat[1].op).toBe("=");
    expect(flat[1].type).toBe("number");

    done();
  });
  it("more than one key key", (done) => {
    const f = addRule(
      addRule(
        addRule(addRule({} as Filters<I>, "foo", 1, "="), "foo", 2, "="),
        "bar",
        1,
        "="
      ),
      "bar",
      2,
      "="
    );

    const flat = toFlat(f);

    expect(flat).toHaveLength(4);
    expect(flat[0].key).toBe("foo");
    expect(flat[0].value).toBe(1);
    expect(flat[0].op).toBe("=");
    expect(flat[0].type).toBe("number");
    expect(flat[1].key).toBe("foo");
    expect(flat[1].value).toBe(2);
    expect(flat[1].op).toBe("=");
    expect(flat[1].type).toBe("number");
    expect(flat[2].key).toBe("bar");
    expect(flat[2].value).toBe(1);
    expect(flat[2].op).toBe("=");
    expect(flat[2].type).toBe("number");
    expect(flat[3].key).toBe("bar");
    expect(flat[3].value).toBe(2);
    expect(flat[3].op).toBe("=");
    expect(flat[3].type).toBe("number");

    done();
  });
});
