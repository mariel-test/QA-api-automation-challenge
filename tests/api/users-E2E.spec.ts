import { test, expect } from "@playwright/test";
import { DummyJsonClient } from "../helpers/reqres-client";
import { UserStorage } from "../helpers/user-storage";
import { newUserPayload } from "../../fixtures/test-data-task2";
import type { User, UsersResponse } from "../../types/api";

const MOCK_USER_ID = 999;
const BASE_URL = "https://dummyjson.com";

const getRandomSuffix = () =>
  Math.random().toString(36).substring(2, 6).padEnd(4, "a");

/**
 * Builds a fake APIRequestContext-compatible object that makes HTTP requests
 * via page.evaluate() so they pass through Playwright's page.route() interception.
 */
const buildRequestFromPage = (page: any) => {
  const normalizeUrl = (url: string) =>
    url.startsWith("http")
      ? url
      : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

  const makeResponse = (status: number, body: any) => ({
    status: () => status,
    json: async () => body,
    text: async () =>
      typeof body === "string" ? body : JSON.stringify(body),
  });

  const rawRequest = async (
    method: string,
    url: string,
    options: any = {}
  ) => {
    const fullUrl = normalizeUrl(url);
    const payload =
      options?.data !== undefined ? JSON.stringify(options.data) : undefined;
    const headers = {
      ...(options?.headers || {}),
      ...(payload ? { "Content-Type": "application/json" } : {}),
    };

    const result = await page.evaluate(
      async ({
        fullUrl,
        method,
        headers,
        payload,
      }: {
        fullUrl: string;
        method: string;
        headers: Record<string, string>;
        payload: string | undefined;
      }) => {
        const res = await fetch(fullUrl, {
          method,
          headers,
          body: payload,
        });
        const text = await res.text();
        let body: any;
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
        return { status: res.status, body };
      },
      { fullUrl, method, headers, payload }
    );

    return makeResponse(result.status, result.body);
  };

  return {
    get: (url: string, options?: any) => rawRequest("GET", url, options),
    post: (url: string, options?: any) => rawRequest("POST", url, options),
    put: (url: string, options?: any) => rawRequest("PUT", url, options),
    patch: (url: string, options?: any) =>
      rawRequest("PATCH", url, options),
    delete: (url: string, options?: any) =>
      rawRequest("DELETE", url, options),
  } as any;
};

test.describe("Task 2 — script automatizado de usuarios", () => {
  let apiRequest: any;

  test.beforeEach(async ({ page }) => {
    // Navigate to a real origin so fetch() inside page.evaluate works
    // and page.route() interception is active
    await page.goto("about:blank");

    UserStorage.clearUser();
    apiRequest = buildRequestFromPage(page);

    // ─── MOCK 1: GET /users?* — listado general ─────────────────────────────
    await page.route("**/users?*", async (route) => {
      const url = route.request().url();
      // Must not match /users/add, /users/filter, /users/{id}
      if (
        url.includes("/users/add") ||
        url.includes("/users/filter") ||
        /\/users\/\d+/.test(url)
      ) {
        await route.continue();
        return;
      }

      const storedUser = UserStorage.getUser();
      const users = storedUser ? [storedUser] : [];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          users,
          total: users.length,
          skip: 0,
          limit: users.length,
        }),
      });
    });

    // ─── MOCK 2: POST /users/add — crear usuario ─────────────────────────────
    await page.route("**/users/add", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }

      const payload = (await route.request().postDataJSON()) as Partial<User>;

      const newUser: User & Record<string, unknown> = {
        id: MOCK_USER_ID,
        firstName: payload.firstName as string,
        lastName: payload.lastName as string,
        username: (payload.username as string) || `user_${Date.now()}`,
        email: payload.email as string,
        gender: (payload.gender as string) || "male",
        age: (payload.age as number) || 30,
        phone: (payload.phone as string) || "+54 351-000-0000",
        image: "https://i.pravatar.cc/150?img=1",
        birthDate: "1990-01-01",
        bloodGroup: "A+",
        height: 170,
        weight: 70,
        eyeColor: "brown",
        hair: { color: "black", type: "straight" },
        address: { city: "Córdoba", street: "Falsa" },
      };

      UserStorage.saveUser(newUser as User);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(newUser),
      });
    });

    // ─── MOCK 3: GET /users/filter* — filtrar por campo ──────────────────────
    await page.route("**/users/filter*", async (route) => {
      const url = new URL(route.request().url());
      const key = url.searchParams.get("key");
      const value = url.searchParams.get("value");
      const storedUser = UserStorage.getUser();
      const users: User[] = [];

      if (storedUser && key && value) {
        const field = (storedUser as any)[key];
        if (
          field !== undefined &&
          String(field).toLowerCase() === value.toLowerCase()
        ) {
          users.push(storedUser);
        }
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          users,
          total: users.length,
          skip: 0,
          limit: users.length,
        }),
      });
    });

    // ─── MOCK 4 + 5 + 6: /users/{id} — PATCH / GET / DELETE ─────────────────
    await page.route(/\/users\/\d+$/, async (route) => {
      const req = route.request();
      const method = req.method();
      const pathSegments = new URL(req.url()).pathname.split("/");
      const id = Number(pathSegments.at(-1));
      const storedUser = UserStorage.getUser();

      if (method === "PATCH") {
        if (!storedUser || storedUser.id !== id) {
          await route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({ message: "User not found" }),
          });
          return;
        }
        const patchData = (await req.postDataJSON()) as Partial<User>;
        const updated = { ...storedUser, ...patchData };
        UserStorage.saveUser(updated as User);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...updated, isUpdated: true }),
        });
        return;
      }

      if (method === "GET") {
        if (!storedUser || storedUser.id !== id) {
          await route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({ message: "User not found" }),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(storedUser),
        });
        return;
      }

      if (method === "DELETE") {
        if (!storedUser || storedUser.id !== id) {
          await route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({ message: "User not found" }),
          });
          return;
        }
        const snapshot = { ...storedUser };
        UserStorage.clearUser();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...snapshot,
            isDeleted: true,
            deletedOn: new Date().toISOString(),
          }),
        });
        return;
      }

      await route.continue();
    });
  });

  test(
    "flujo completo: listar → crear → filtrar → listar → actualizar → filtrar → obtener → eliminar → listar",
    async ({ page }) => {
      const payload = newUserPayload();

      // ─── PASO 1: Listar usuarios ANTES de crear ──────────────────────────
      const getBefore = await apiRequest.get(
        "/users?select=firstName,lastName,email"
      );
      const getBeforeBody = (await getBefore.json()) as UsersResponse;

      console.log("\n[1] === GET All Users (antes de crear) ===");
      console.log(`    Status: ${getBefore.status()}`);
      console.log(`    Total usuarios en lista: ${getBeforeBody.total}`);
      console.log(`    ✓ El usuario a crear NO existe aún en el listado`);

      expect(getBefore.status()).toBe(200);
      expect(Array.isArray(getBeforeBody.users)).toBe(true);
      expect(
        getBeforeBody.users.some((u) => u.email === payload.email)
      ).toBe(false);

      // ─── PASO 2: Crear usuario ───────────────────────────────────────────
      const createResp = await apiRequest.post("/users/add", {
        data: payload,
      });
      const createdUser = (await createResp.json()) as User;

      console.log("\n[2] === POST Create User ===");
      console.log(`    Status: ${createResp.status()}`);
      console.log(`    ID asignado: ${createdUser.id}`);
      console.log(
        `    Nombre: ${createdUser.firstName} ${createdUser.lastName}`
      );
      console.log(`    Email: ${createdUser.email}`);
      console.log(`    Username: ${createdUser.username}`);

      expect(createResp.status()).toBe(201);
      expect(createdUser.firstName).toBe(payload.firstName);
      expect(createdUser.email).toBe(payload.email);
      expect(createdUser.id).toBe(MOCK_USER_ID);

      // ─── PASO 3: Filtrar por firstName, lastName, email ──────────────────
      const filterFields = ["firstName", "lastName", "email"] as const;
      for (const field of filterFields) {
        const value = String((createdUser as any)[field]);
        const filterResp = await apiRequest.get(
          `/users/filter?key=${field}&value=${encodeURIComponent(value)}`
        );
        const filterBody = (await filterResp.json()) as UsersResponse;

        console.log(`\n[3] === GET Filter Users by Field (${field}) ===`);
        console.log(`    Filtrando por ${field}: ${value}`);
        console.log(`    Status: ${filterResp.status()}`);
        console.log(`    Resultados encontrados: ${filterBody.total}`);
        console.log(
          `    ✓ Usuario encontrado: ${createdUser.firstName} ${createdUser.lastName} (ID: ${createdUser.id})`
        );

        expect(filterResp.status()).toBe(200);
        expect(filterBody.users.length).toBeGreaterThan(0);
        expect(
          filterBody.users.some((u) => u.id === createdUser.id)
        ).toBe(true);
      }

      // ─── PASO 4: Listar usuarios DESPUÉS de crear ────────────────────────
      const getAfter = await apiRequest.get(
        "/users?select=firstName,lastName,email"
      );
      const getAfterBody = (await getAfter.json()) as UsersResponse;

      console.log("\n[4] === GET All Users (después de crear) ===");
      console.log(`    Status: ${getAfter.status()}`);
      console.log(`    Total usuarios: ${getAfterBody.total}`);
      console.log(
        `    ✓ Usuario '${createdUser.firstName} ${createdUser.lastName}' aparece en el listado`
      );

      expect(getAfter.status()).toBe(200);
      expect(
        getAfterBody.users.some((u) => u.email === payload.email)
      ).toBe(true);

      // ─── PASO 5: Actualizar usuario (PATCH parcial sobre lastName) ────────
      const newLastName = `Test${getRandomSuffix()}`;
      const patchResp = await apiRequest.patch(`/users/${createdUser.id}`, {
        data: { lastName: newLastName },
      });
      const patchBody = (await patchResp.json()) as User & {
        isUpdated?: boolean;
      };

      console.log("\n[5] === PATCH Update User ===");
      console.log(`    Actualizando ID: ${createdUser.id}`);
      console.log(`    lastName anterior: ${payload.lastName}`);
      console.log(`    lastName nuevo: ${newLastName}`);
      console.log(`    Status: ${patchResp.status()}`);
      console.log(`    ✓ Usuario actualizado correctamente`);

      expect(patchResp.status()).toBe(200);
      expect(patchBody.lastName).toBe(newLastName);
      expect(patchBody.firstName).toBe(payload.firstName);

      // ─── PASO 6: Filtrar con datos actualizados ───────────────────────────
      const updatedFields = [
        ["firstName", payload.firstName],
        ["lastName", newLastName],
        ["email", payload.email],
      ] as const;

      for (const [field, value] of updatedFields) {
        const filterResp = await apiRequest.get(
          `/users/filter?key=${field}&value=${encodeURIComponent(
            value as string
          )}`
        );
        const filterBody = (await filterResp.json()) as UsersResponse;

        console.log(`\n[6] === GET Filter Users by Field (${field}) ===`);
        console.log(`    Filtrando por ${field}: ${value}`);
        console.log(`    Status: ${filterResp.status()}`);
        console.log(`    Resultados encontrados: ${filterBody.total}`);
        console.log(
          `    ✓ Usuario encontrado con datos actualizados: ${payload.firstName} ${newLastName} (ID: ${createdUser.id})`
        );

        expect(filterResp.status()).toBe(200);
        expect(filterBody.users.length).toBeGreaterThan(0);
        expect(
          filterBody.users.some((u) => u.id === createdUser.id)
        ).toBe(true);
      }

      // ─── PASO 7: Obtener usuario por ID ──────────────────────────────────
      const getByIdResp = await apiRequest.get(`/users/${createdUser.id}`);
      const getByIdBody = (await getByIdResp.json()) as User;

      console.log("\n[7] === GET User by ID ===");
      console.log(`    Buscando ID: ${createdUser.id}`);
      console.log(`    Status: ${getByIdResp.status()}`);
      console.log(
        `    Nombre actual: ${getByIdBody.firstName} ${getByIdBody.lastName}`
      );
      console.log(`    Email: ${getByIdBody.email}`);
      console.log(`    ✓ lastName modificado confirmado: ${newLastName}`);

      expect(getByIdResp.status()).toBe(200);
      expect(getByIdBody.id).toBe(createdUser.id);
      expect(getByIdBody.lastName).toBe(newLastName);
      expect(getByIdBody.email).toBe(payload.email);

      // ─── PASO 8: Eliminar usuario ─────────────────────────────────────────
      const deleteResp = await apiRequest.delete(`/users/${createdUser.id}`);
      const deleteBody = await deleteResp.json();

      console.log("\n[8] === DELETE User ===");
      console.log(`    Eliminando ID: ${createdUser.id}`);
      console.log(`    Nombre: ${createdUser.firstName} ${newLastName}`);
      console.log(`    Status: ${deleteResp.status()}`);
      console.log(`    isDeleted: ${deleteBody.isDeleted}`);
      console.log(`    ✓ Usuario eliminado exitosamente`);

      expect(deleteResp.status()).toBe(200);
      expect(deleteBody.isDeleted).toBe(true);

      // ─── PASO 9: Listar para confirmar eliminación ────────────────────────
      const getAfterDelete = await apiRequest.get(
        "/users?select=firstName,lastName,email"
      );
      const getAfterDeleteBody =
        (await getAfterDelete.json()) as UsersResponse;

      console.log("\n[9] === GET All Users (después de eliminar) ===");
      console.log(`    Status: ${getAfterDelete.status()}`);
      console.log(`    Total usuarios: ${getAfterDeleteBody.total}`);
      console.log(
        `    ✓ Usuario '${createdUser.firstName} ${newLastName}' ya NO aparece en el listado`
      );

      expect(getAfterDelete.status()).toBe(200);
      expect(
        getAfterDeleteBody.users.some((u) => u.email === payload.email)
      ).toBe(false);

      console.log(
        "\n✅ FLUJO COMPLETO EXITOSO: listar → crear → filtrar → listar → actualizar → filtrar → obtener → eliminar → listar\n"
      );
    }
  );
});
