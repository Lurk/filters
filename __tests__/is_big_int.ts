import { isBigInt } from "../src/lib";

describe("isBigInt", () => {
  it("happy path", (done) => {
    //@ts-ignore
    expect(isBigInt(34n)).toBeTruthy();
    expect(isBigInt(34)).toBeFalsy();
    expect(isBigInt("34n")).toBeFalsy();
    done();
  });
});
