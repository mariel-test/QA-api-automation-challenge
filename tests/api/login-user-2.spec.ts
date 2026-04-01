import { test, expect } from "@playwright/test";
import { VALID_CREDENTIALS, INVALID_CREDENTIALS } from "../../fixtures/test-data";
import { GHOST_USER, MISSING_PASSWORD } from '../../fixtures/test-data.invalid';

/**
 * Tests para el endpoint POST /auth/login de la API de DummyJSON.
 * Se prueban diferentes escenarios de login: exitoso, usuario inexistente,
 * contraseña vacía y contraseña incorrecta.
 */
test.describe("POST /auth/login", () => {
  /**
   * Login exitoso con credenciales válidas.
   * Verifica que se retorne status 200, accessToken presente y username correcto.
   */
  test("Login exitoso", async ({ request }) => {
    const response = await request.post("https://dummyjson.com/auth/login", {
      data: VALID_CREDENTIALS,
      headers: { "Content-Type": "application/json" }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.accessToken).toBeTruthy();
    expect(typeof body.accessToken).toBe("string");
    expect(body.username).toBe(VALID_CREDENTIALS.username);
  });

  /**
   * Usuario no existe: intenta login con un username que no existe en DummyJSON.
   * Debe retornar status 400 o 404 con mensaje de error.
   */
  test("Usuario no existe", async ({ request }) => {
    const response = await request.post("https://dummyjson.com/auth/login", {
      data: GHOST_USER,
      headers: { "Content-Type": "application/json" }
    });

    expect([400, 404]).toContain(response.status());

    const body = await response.json();
    expect(body.message).toBeTruthy();
  });

  /**
   * Contraseña vacía / no enviada: envía solo el username sin password.
   * Debe retornar status 400 con mensaje de error.
   */
  test("Contraseña vacía / no enviada", async ({ request }) => {
    const response = await request.post("https://dummyjson.com/auth/login", {
      data: MISSING_PASSWORD,
      headers: { "Content-Type": "application/json" }
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.message).toBeTruthy();
  });

  /**
   * Contraseña incorrecta para usuario existente: username válido pero password errado.
   * Debe retornar status 400 con mensaje de error.
   */
  test("Contraseña incorrecta para usuario existente", async ({ request }) => {
    const response = await request.post("https://dummyjson.com/auth/login", {
      data: INVALID_CREDENTIALS,
      headers: { "Content-Type": "application/json" }
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.message).toBeTruthy();
  });
});
