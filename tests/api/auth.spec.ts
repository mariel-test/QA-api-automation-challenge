import { test, expect } from "@playwright/test";
import { DummyJsonClient } from "../helpers/reqres-client";
import { VALID_CREDENTIALS, INVALID_CREDENTIALS } from "../../fixtures/test-data";

/**
 * EXAMPLE — Auth endpoints
 * Cubre login, obtención del usuario autenticado y refresh de token.
 */

test.describe("Auth — login y sesión", () => {
  let client: DummyJsonClient;

  test.beforeEach(({ request }) => {
    client = new DummyJsonClient(request);
  });

  // ─── Login ───────────────────────────────────────────────────────────────────

  test.describe("POST /auth/login", () => {
    test("login exitoso retorna 200 con accessToken y refreshToken", async () => {
      const { response, body } = await client.login(VALID_CREDENTIALS);

      expect(response.status()).toBe(200);
      expect(body.accessToken).toBeTruthy();
      expect(body.refreshToken).toBeTruthy();
      expect(typeof body.accessToken).toBe("string");
    });

    test("login exitoso retorna datos del usuario", async () => {
      const { body } = await client.login(VALID_CREDENTIALS);

      expect(body.username).toBe(VALID_CREDENTIALS.username);
      expect(body.email).toContain("@");
      expect(body.id).toBeGreaterThan(0);
    });

    test("login con credenciales inválidas retorna 400", async () => {
      const { response } = await client.login(INVALID_CREDENTIALS);
      expect(response.status()).toBe(400);
    });
  });

  // ─── Auth user ───────────────────────────────────────────────────────────────

  test.describe("GET /auth/me", () => {
    test("retorna el usuario autenticado con un token válido", async () => {
      // Primero hacemos login para obtener el token
      await client.login(VALID_CREDENTIALS);

      const { response, body } = await client.getAuthUser();

      expect(response.status()).toBe(200);
      expect(body.username).toBe(VALID_CREDENTIALS.username);
    });

    test("retorna 401 sin token de autenticación", async () => {
      // Cliente sin login previo — no tiene token
      const { response } = await client.getAuthUser().catch(async () => {
        // El cliente tira error si no hay token; lo capturamos
        const raw = await client["request"].get("/auth/me");
        return { response: raw, body: {} };
      });
      expect([401, 403]).toContain(response.status());
    });
  });

  // ─── Refresh token ───────────────────────────────────────────────────────────

  test.describe("POST /auth/refresh", () => {
    test("refresh exitoso retorna nuevos tokens", async () => {
      // 1. Login para obtener el refreshToken inicial
      const { body: loginBody } = await client.login(VALID_CREDENTIALS);
      const { refreshToken } = loginBody;

      // 2. Usar el refreshToken para obtener nuevos tokens
      const { response, body } = await client.refreshToken({
        refreshToken,
        expiresInMins: 30,
      });

      expect(response.status()).toBe(200);
      expect(body.accessToken).toBeTruthy();
      expect(body.refreshToken).toBeTruthy();
    });
  });
});
