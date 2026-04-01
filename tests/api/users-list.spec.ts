import { test, expect } from "@playwright/test";
import { DummyJsonClient } from "../helpers/reqres-client";

/**
 * EXAMPLE — BÁSICO
 *
 * Tests simples sobre el listado de usuarios.
 * Foco: status codes, estructura de respuesta, paginación.
 */

test.describe("GET /users — listado de usuarios", () => {
  let client: DummyJsonClient;

  test.beforeEach(({ request }) => {
    client = new DummyJsonClient(request);
  });

  test("devuelve 200 y una lista de usuarios", async () => {
    const { response, body } = await client.listUsers();

    expect(response.status()).toBe(200);
    expect(body.users).toBeInstanceOf(Array);
    expect(body.users.length).toBeGreaterThan(0);
  });

  test("cada usuario tiene los campos esperados", async () => {
    const { body } = await client.listUsers();

    for (const user of body.users) {
      expect(user).toMatchObject({
        id: expect.any(Number),
        firstName: expect.any(String),
        lastName: expect.any(String),
        email: expect.stringContaining("@"),
        username: expect.any(String),
      });
    }
  });

  test("respeta el parámetro limit", async () => {
    const { body } = await client.listUsers(5);
    expect(body.users.length).toBeLessThanOrEqual(5);
  });

  test("paginación — skip devuelve usuarios distintos", async () => {
    const page1 = await client.listUsers(5, 0);
    const page2 = await client.listUsers(5, 5);

    const ids1 = page1.body.users.map((u) => u.id);
    const ids2 = page2.body.users.map((u) => u.id);

    expect(ids1).not.toEqual(expect.arrayContaining(ids2));
  });

});
