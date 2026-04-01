import { APIRequestContext } from "@playwright/test";
import type {
  LoginPayload,
  LoginResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  User,
  UserPayload,
  CreatedUser,
  UpdatedUser,
  UsersResponse,
} from "../../types/api";

/**
 * Thin wrapper around Playwright's APIRequestContext que tipea
 * las respuestas y centraliza la base path para endpoints de DummyJSON.
 */
export class DummyJsonClient {
  private accessToken: string | null = null;

  constructor(private readonly request: APIRequestContext) {}

  // ─── Auth ────────────────────────────────────────────────────────────────────

  async login(payload: LoginPayload) {
    const response = await this.request.post("/auth/login", { data: payload });
    const body = (await response.json()) as LoginResponse;
    if (body.accessToken) {
      this.accessToken = body.accessToken;
    }
    return { response, body };
  }

  async getAuthUser() {
    const response = await this.request.get("/auth/me", {
      headers: this.authHeaders(),
    });
    const body = (await response.json()) as User;
    return { response, body };
  }

  async refreshToken(payload: RefreshTokenPayload) {
    const response = await this.request.post("/auth/refresh", { data: payload });
    const body = (await response.json()) as RefreshTokenResponse;
    return { response, body };
  }

  // ─── Users ───────────────────────────────────────────────────────────────────

  async listUsers(limit = 10, skip = 0) {
    const response = await this.request.get(
      `/users?limit=${limit}&skip=${skip}`
    );
    const body = (await response.json()) as UsersResponse;
    return { response, body };
  }

  async getUser(id: number) {
    const response = await this.request.get(`/users/${id}`);
    const body = (await response.json()) as User;
    return { response, body };
  }

  async searchUsers(query: string) {
    const response = await this.request.get(
      `/users/search?q=${encodeURIComponent(query)}`
    );
    const body = (await response.json()) as UsersResponse;
    return { response, body };
  }

  async createUser(payload: UserPayload) {
    const response = await this.request.post("/users/add", { data: payload });
    const body = (await response.json()) as CreatedUser;
    return { response, body };
  }

  async updateUser(id: number, payload: Partial<UserPayload>) {
    const response = await this.request.put(`/users/${id}`, { data: payload });
    const body = (await response.json()) as UpdatedUser;
    return { response, body };
  }

  async deleteUser(id: number) {
    const response = await this.request.delete(`/users/${id}`);
    const body = (await response.json()) as User & { isDeleted: boolean; deletedOn: string };
    return { response, body };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private authHeaders() {
    if (!this.accessToken) {
      throw new Error("No accessToken disponible — llamá a login() primero");
    }
    return { Authorization: `Bearer ${this.accessToken}` };
  }
}
