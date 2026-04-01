import type { User } from "../../types/api";

export class UserStorage {
  private static user: User | null = null;

  static getUser(): User | null {
    return this.user;
  }

  static saveUser(user: User): void {
    this.user = user;
  }

  static clearUser(): void {
    this.user = null;
  }
}
