import { describe, expect, it } from "vitest";
import { inferNikBirthDate, NikParseError, parseNik } from "@/lib/nik-parser";

describe("parseNik", () => {
  it("parses a male NIK and its region codes", () => {
    expect(parseNik("3326160911060005")).toMatchObject({
      provinceCode: "33",
      regencyCode: "3326",
      districtCode: "332616",
      birthDay: 9,
      birthMonth: 11,
      birthYearSuffix: 6,
      gender: "MALE",
      sequenceNumber: "0005",
    });
  });

  it("subtracts 40 from a female birth day", () => {
    expect(parseNik("3326164911060005")).toMatchObject({ birthDay: 9, gender: "FEMALE" });
  });

  it("rejects malformed and impossible dates", () => {
    expect(() => parseNik("332616091106005")).toThrow(NikParseError);
    expect(() => parseNik("33261609110600AB")).toThrow(NikParseError);
    expect(() => inferNikBirthDate(parseNik("3326163102060005"))).toThrow("Kode tanggal lahir");
  });

  it("infers the latest non-future century", () => {
    const today = new Date("2026-09-04T12:00:00.000Z");
    expect(inferNikBirthDate(parseNik("3326160911060005"), today).toISOString().slice(0, 10)).toBe("2006-11-09");
    expect(inferNikBirthDate(parseNik("3326160901800005"), today).toISOString().slice(0, 10)).toBe("1980-01-09");
  });
});
