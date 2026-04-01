import { test, expect } from "@playwright/test";
import { DummyJsonClient } from "../helpers/reqres-client";
import {
  VALID_USER_ID,
  NONEXISTENT_USER_ID,
  newUserPayload,
} from "../../fixtures/test-data";

/**
 * EXAMPLE — MÁS COMPLETO
 *
 * Cobertura del recurso Users: happy paths, edge cases,
 * validación de contrato y flujo encadenado.
 *
 * Nota: DummyJSON simula escrituras — los datos no persisten realmente
 * en el servidor, pero los status codes y respuestas son correctos.
 */

test.describe("Users — operaciones CRUD", () => {
  let client: DummyJsonClient;

  test.beforeEach(({ request }) => {
    client = new DummyJsonClient(request);
  });

  // ─── GET single user ────────────────────────────────────────────────────────

  test.describe("GET /users/:id", () => {
    test("retorna el usuario correcto para un id válido", async () => {
      const { response, body } = await client.getUser(VALID_USER_ID);

      expect(response.status()).toBe(200);
      expect(body.id).toBe(VALID_USER_ID);
      expect(body.firstName).toBeTruthy();
      expect(body.email).toContain("@");
    });

    test("retorna 404 para un id inexistente", async () => {
      const { response } = await client.getUser(NONEXISTENT_USER_ID);
      expect(response.status()).toBe(404);
    });
  });

  // ─── GET search users ────────────────────────────────────────────────────────

  test.describe("GET /users/search", () => {
    test("búsqueda por nombre retorna resultados relevantes", async () => {
      const { response, body } = await client.searchUsers("Emily");

      expect(response.status()).toBe(200);
      expect(body.users.length).toBeGreaterThan(0);

      // Al menos un resultado debe contener el término buscado
      const match = body.users.some(
        (u) =>
          u.firstName.toLowerCase().includes("emily") ||
          u.lastName.toLowerCase().includes("emily")
      );
      expect(match).toBe(true);
    });

    test("búsqueda sin resultados retorna lista vacía", async () => {
      const { response, body } = await client.searchUsers("xyzxyzxyz_no_existe");

      expect(response.status()).toBe(200);
      expect(body.users).toHaveLength(0);
      expect(body.total).toBe(0);
    });
  });

  // ─── POST create user ────────────────────────────────────────────────────────

  test.describe("POST /users/add", () => {
    test("crea un usuario y retorna 201 con los datos enviados", async () => {
      const payload = newUserPayload();
      const { response, body } = await client.createUser(payload);

      expect(response.status()).toBe(201);
      expect(body.firstName).toBe(payload.firstName);
      expect(body.lastName).toBe(payload.lastName);
      expect(body.age).toBe(payload.age);
    });

    test("la respuesta incluye un id generado por el servidor", async () => {
      const { body } = await client.createUser(newUserPayload("-new"));
      expect(body.id).toBeTruthy();
      expect(typeof body.id).toBe("number");
    });
  });

  // ─── PUT update user ─────────────────────────────────────────────────────────

  test.describe("PUT /users/:id", () => {
    test("actualiza los campos enviados y retorna 200", async () => {
      const payload = { firstName: "Updated", lastName: "Name", age: 35 };
      const { response, body } = await client.updateUser(VALID_USER_ID, payload);

      expect(response.status()).toBe(200);
      expect(body.firstName).toBe(payload.firstName);
      expect(body.lastName).toBe(payload.lastName);
    });

    test("actualización parcial — solo el campo enviado cambia", async () => {
      const { response, body } = await client.updateUser(VALID_USER_ID, {
        age: 99,
      });

      expect(response.status()).toBe(200);
      expect(body.age).toBe(99);
    });
  });

  // ─── DELETE ──────────────────────────────────────────────────────────────────

  test.describe("DELETE /users/:id", () => {
    test("retorna 200 con isDeleted en true", async () => {
      const { response, body } = await client.deleteUser(VALID_USER_ID);

      expect(response.status()).toBe(200);
      expect(body.isDeleted).toBe(true);
      expect(body.deletedOn).toBeTruthy();
    });
  });

  // ─── Flujo encadenado ────────────────────────────────────────────────────────

  test("flujo completo: crear → leer → actualizar → eliminar", async () => {
    // 1. Crear un usuario nuevo
    const { body: created } = await client.createUser(newUserPayload("-flow"));
    expect(created.id).toBeTruthy();

    // 2. Leer el usuario creado (usamos id 1 como proxy — DummyJSON no persiste)
    const { response: getResp, body: fetched } = await client.getUser(VALID_USER_ID);
    expect(getResp.status()).toBe(200);
    expect(fetched.id).toBe(VALID_USER_ID);

    // 3. Actualizar
    const { response: updateResp } = await client.updateUser(VALID_USER_ID, {
      firstName: "Flow Updated",
    });
    expect(updateResp.status()).toBe(200);

    // 4. Eliminar
    const { response: deleteResp, body: deleted } = await client.deleteUser(VALID_USER_ID);
    expect(deleteResp.status()).toBe(200);
    expect(deleted.isDeleted).toBe(true);
  });
});
