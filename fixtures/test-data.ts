/**
 * Shared test data usado en todos los specs.
 * Credenciales válidas de DummyJSON — son públicas y fijas.
 * Ver lista completa de usuarios en: https://dummyjson.com/users
 */

export const VALID_USER_ID = 1;
export const NONEXISTENT_USER_ID = 9999;

export const VALID_CREDENTIALS = {
  username: "emilys",
  password: "emilyspass",
  expiresInMins: 30,
};

export const INVALID_CREDENTIALS = {
  username: "emilys",
  password: "wrongpassword",
};

export const newUserPayload = (suffix = "") => ({
  firstName: `QA${suffix}`,
  lastName: `Tester${suffix}`,
  age: 30,
});
