export type NikGender = "MALE" | "FEMALE";

export type ParsedNik = {
  nik: string;
  provinceCode: string;
  regencyCode: string;
  districtCode: string;
  encodedDay: number;
  birthDay: number;
  birthMonth: number;
  birthYearSuffix: number;
  gender: NikGender;
  sequenceNumber: string;
};

export class NikParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NikParseError";
  }
}

export function parseNik(value: string): ParsedNik {
  const nik = value.trim();

  if (!/^\d{16}$/.test(nik)) {
    throw new NikParseError("NIK harus terdiri dari tepat 16 digit angka.");
  }

  const encodedDay = Number(nik.slice(6, 8));
  const birthMonth = Number(nik.slice(8, 10));
  const birthYearSuffix = Number(nik.slice(10, 12));
  const gender: NikGender = encodedDay > 40 ? "FEMALE" : "MALE";
  const birthDay = gender === "FEMALE" ? encodedDay - 40 : encodedDay;

  if (birthDay < 1 || birthDay > 31) {
    throw new NikParseError("Kode tanggal lahir pada NIK tidak valid.");
  }

  if (birthMonth < 1 || birthMonth > 12) {
    throw new NikParseError("Kode bulan lahir pada NIK tidak valid.");
  }

  return {
    nik,
    provinceCode: nik.slice(0, 2),
    regencyCode: nik.slice(0, 4),
    districtCode: nik.slice(0, 6),
    encodedDay,
    birthDay,
    birthMonth,
    birthYearSuffix,
    gender,
    sequenceNumber: nik.slice(12, 16),
  };
}

/** NIK stores two year digits, so choose the latest matching, non-future date. */
export function inferNikBirthDate(parsed: ParsedNik, today = new Date()): Date {
  const currentYear = today.getUTCFullYear();
  let year = Math.floor(currentYear / 100) * 100 + parsed.birthYearSuffix;
  let result = new Date(Date.UTC(year, parsed.birthMonth - 1, parsed.birthDay));

  if (result.getTime() > today.getTime()) {
    year -= 100;
    result = new Date(Date.UTC(year, parsed.birthMonth - 1, parsed.birthDay));
  }

  if (
    result.getUTCFullYear() !== year ||
    result.getUTCMonth() !== parsed.birthMonth - 1 ||
    result.getUTCDate() !== parsed.birthDay
  ) {
    throw new NikParseError("Kode tanggal lahir pada NIK tidak valid.");
  }

  return result;
}
