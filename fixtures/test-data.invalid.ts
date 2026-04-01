const randomString = (n = 8): string =>
  Math.random().toString(36).substring(2, 2 + n);

export const GHOST_USER = {
  username: `ghost_${randomString(6)}`,
  password: `pass_${randomString(6)}`,
};

export const WRONG_PASSWORD = {
  username: "emilys",
  password: `wrong_${randomString(8)}`,
};

export const MISSING_PASSWORD = {
  username: "emilys",
};

export const EMPTY_STRINGS = {
  username: "",
  password: "",
};