import { calculateAgeFromDateInput } from "../../utils/dateAge";

describe("calculateAgeFromDateInput", () => {
  it("returns the completed age for a valid birthdate", () => {
    const today = new Date(2026, 3, 22);

    expect(calculateAgeFromDateInput("2006-06-21", today)).toBe("19");
  });

  it("increments age on the exact birthday", () => {
    const today = new Date(2026, 5, 21);

    expect(calculateAgeFromDateInput("2006-06-21", today)).toBe("20");
  });

  it("returns an empty string for an invalid date", () => {
    const today = new Date(2026, 3, 22);

    expect(calculateAgeFromDateInput("2006-02-31", today)).toBe("");
  });

  it("returns an empty string for a future birthdate", () => {
    const today = new Date(2026, 3, 22);

    expect(calculateAgeFromDateInput("2026-12-01", today)).toBe("");
  });
});
