const randomSuffix = () =>
  Math.random().toString(36).substring(2, 6).padEnd(4, "a");

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDigits = (count: number) =>
  Math.floor(Math.random() * Math.pow(10, count))
    .toString()
    .padStart(count, "0");

export const newUserPayload = (suffix = "") => {
  const randomSuffixValue = randomSuffix();
  const now = Date.now();

  return {
    firstName: `User${randomSuffixValue}${suffix}`,
    lastName: `Test${randomSuffixValue}${suffix}`,
    age: randomInt(18, 60),
    email: `user-${now}@example.com`,
    phone: `+54 351-${randomDigits(3)}-${randomDigits(4)}`,
    username: `user_${now}`,
    password: `Pass_${now}`,
    gender: Math.random() > 0.5 ? "male" : "female",
  };
};
