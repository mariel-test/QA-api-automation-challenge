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
    console.log("Datos enviados:", VALID_CREDENTIALS);
    const response = await request.post("https://dummyjson.com/auth/login", {
      data: VALID_CREDENTIALS,
      headers: { "Content-Type": "application/json" }
    });

    console.log("Status de respuesta:", response.status());
    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log("AccessToken:", body.accessToken);
    expect(body.accessToken).toBeTruthy();
    console.log("Tipo de accessToken:", typeof body.accessToken);
    expect(typeof body.accessToken).toBe("string");
    console.log("Username en respuesta:", body.username);
    console.log("Username esperado:", VALID_CREDENTIALS.username);
    expect(body.username).toBe(VALID_CREDENTIALS.username);
  });

  /**
   * Usuario no existe: intenta login con un username que no existe en DummyJSON.
   * Debe retornar status 400 o 404 con mensaje de error.
   */
  test("Usuario no existe", async ({ request }) => {
    console.log("Datos enviados:", GHOST_USER);
    const response = await request.post("https://dummyjson.com/auth/login", {
      data: GHOST_USER,
      headers: { "Content-Type": "application/json" }
    });

    console.log("Status de respuesta:", response.status());
    expect([400, 404]).toContain(response.status());

    const body = await response.json();
    console.log("Mensaje de error:", body.message);
    expect(body.message).toBeTruthy();
  });

  /**
   * Contraseña vacía / no enviada: envía solo el username sin password.
   * Debe retornar status 400 con mensaje de error.
   */
  test("Contraseña vacía / no enviada", async ({ request }) => {
    console.log("Datos enviados:", MISSING_PASSWORD);
    const response = await request.post("https://dummyjson.com/auth/login", {
      data: MISSING_PASSWORD,
      headers: { "Content-Type": "application/json" }
    });

    console.log("Status de respuesta:", response.status());
    expect(response.status()).toBe(400);

    const body = await response.json();
    console.log("Mensaje de error:", body.message);
    expect(body.message).toBeTruthy();
  });

  /**
   * Contraseña incorrecta para usuario existente: username válido pero password errado.
   * Debe retornar status 400 con mensaje de error.
   */
  test("Contraseña incorrecta para usuario existente", async ({ request }) => {
    console.log("Datos enviados:", INVALID_CREDENTIALS);
    const response = await request.post("https://dummyjson.com/auth/login", {
      data: INVALID_CREDENTIALS,
      headers: { "Content-Type": "application/json" }
    });

    console.log("Status de respuesta:", response.status());
    expect(response.status()).toBe(400);

    const body = await response.json();
    console.log("Mensaje de error:", body.message);
    expect(body.message).toBeTruthy();
  });
});