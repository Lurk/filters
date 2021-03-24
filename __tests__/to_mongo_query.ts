import { addRule, Filters, toMongoQuery } from "../src";

interface I {
  foo: number;
  bar: string;
  baz: boolean;
}
describe("to mongo query", () => {
  it("equal", (done) => {
    const f = addRule(
      addRule(addRule({} as Filters<I>, "foo", 1), "bar", "aaa"),
      "baz",
      true
    );
    expect(toMongoQuery(f)).toEqual({ foo: 1, baz: true, bar: "aaa" });
    done();
  });
  it("equal in", (done) => {
    const f = addRule(addRule({} as Filters<I>, "foo", 1), "foo", 2);
    expect(toMongoQuery(f)).toEqual({ foo: { $in: [1, 2] } });
    done();
  });
  it("not equal", (done) => {
    const f = addRule(
      addRule(addRule({} as Filters<I>, "foo", 1, "!="), "bar", "aaa", "!="),
      "baz",
      true,
      "!="
    );
    expect(toMongoQuery(f)).toEqual({
      foo: { $ne: 1 },
      baz: { $ne: true },
      bar: { $ne: "aaa" },
    });
    done();
  });
    it('not equal in', (done) => {
      const f = addRule(addRule({} as Filters<I>, 'foo', 1, '!='),'foo', 2, '!=');
      expect(toMongoQuery(f)).toEqual({ foo: { $nin: [ 1, 2 ] } });
      done();
    });
    it('greater than', (done) => {
      const f = addRule({} as Filters<I>,'foo', 1, '>');
      expect(toMongoQuery(f)).toEqual({ foo: { $gt: 1 } });
      done();
    });
    it('lover than', (done) => {
      const f = addRule({} as Filters<I>,'foo', 1, '<');
      expect(toMongoQuery(f)).toEqual({ foo: { $lt: 1 } });
      done();
    });
    it('greater or equal than', (done) => {
      const f = addRule({} as Filters<I>,'foo', 1, '>=');
      expect(toMongoQuery(f)).toEqual({ foo: { $gte: 1 } });
      done();
    });
    it('lower or equal than', (done) => {
      const f = addRule({} as Filters<I>,'foo', 1, '<=');
      expect(toMongoQuery(f)).toEqual({ foo: { $lte: 1 } });
      done();
    });
    it('contains', (done) => {
      const f = addRule({} as Filters<I>,'bar', 'aaa', '~');
      expect(toMongoQuery(f)).toEqual({ bar: { $regex: `.*aaa.*`, $options: 'gi' } });
      done();
    });
    it('greater than and lower than in', (done) => {
      const f = addRule(addRule({} as Filters<I>, 'foo', 1, '>'),'foo', 2, '<');
      expect(toMongoQuery(f)).toEqual({ foo: { $gt:  1, $lt: 2 } });
      done();
    });
    it('greater or equal than and lower or equal than in', (done) => {
      const f = addRule(addRule({} as Filters<I>,'foo', 1, '>='),'foo', 2, '<=');
      expect(toMongoQuery(f)).toEqual({ foo: { $gte:  1, $lte: 2 } });
      done();
    });
});
