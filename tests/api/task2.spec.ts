import { test, expect } from "@playwright/test";
import { DummyJsonClient } from "../helpers/reqres-client";
import { UserStorage } from "../helpers/user-storage";
import { newUserPayload } from "../../fixtures/test-data-task2";
import type { User, UsersResponse, CreatedUser } from "../../types/api";

const MOCK_USER_ID = 999;

const BASE_URL = "https://dummyjson.com";

const getRandomSuffix = () =>
  Math.random().toString(36).substring(2, 6).padEnd(4, "a");

const buildRequestFromPage = (page: any) => {
  const normalizeUrl = (url: string) =>
    url.startsWith("http") ? url : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

  const makeResponse = (status: number, body: any) => ({
    status: () => status,
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  });

  const rawRequest = async (method: string, url: string, options: any = {}) => {
    const fullUrl = normalizeUrl(url);
    const payload = options?.data !== undefined ? JSON.stringify(options.data) : undefined;
    const headers = {
      ...(options?.headers || {}),
      ...(payload ? { "Content-Type": "application/json" } : {}),
    };

    console.log('DEBUG rawRequest', method, fullUrl, payload);

    const result = await page.evaluate(
      async ({ fullUrl, method, headers, payload }) => {
        const res = await fetch(fullUrl, {
          method,
          headers,
          body: payload,
        });
        const text = await res.text();
        let body;
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
    patch: (url: string, options?: any) => rawRequest("PATCH", url, options),
    delete: (url: string, options?: any) => rawRequest("DELETE", url, options),
  } as any;
};


test.describe("Task 2 — script automatizado de usuarios", () => {
  let client: DummyJsonClient;
  let apiRequest: any;

  test.beforeEach(async ({ context, page }) => {
    UserStorage.clearUser();
    apiRequest = buildRequestFromPage(page);
    client = new DummyJsonClient(apiRequest);

    const usersListHandler = async (route: any) => {
      const storedUser = UserStorage.getUser();
      const users = storedUser ? [storedUser] : [];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ users, total: users.length, skip: 0, limit: users.length }),
      });
    };

    const usersAddHandler = async (route: any) => {
      const req = route.request();
      console.log('DEBUG usersAddHandler hit', req.method(), req.url());
      const payload = (await req.postDataJSON()) as Partial<User>;

      const newUser: User & Record<string, unknown> = {
        id: MOCK_USER_ID,
        firstName: payload.firstName as string,
        lastName: payload.lastName as string,
        username: payload.username as string,
        email: payload.email as string,
        gender: (payload.gender as string) || "male",
        age: (payload.age as number) || 30,
        phone: (payload.phone as string) || "+54 351-000-0000",
        image: "https://i.pravatar.cc/150?img=1",
      };

      // Campos adicionales fijos para simular user completo
      newUser.birthDate = "1990-01-01";
      newUser.bloodGroup = "A+";
      newUser.height = 170;
      newUser.weight = 70;
      newUser.eyeColor = "brown";
      newUser.hair = { color: "black", type: "straight" };
      newUser.address = { city: "Córdoba", street: "Falsa" };

      UserStorage.saveUser(newUser as User);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(newUser),
      });
    };

    await context.route("**", async (route) => {
      const req = route.request();
      console.log('DEBUG global route', req.method(), req.url());
      await route.continue();
    });

    await context.route("**/users?*", usersListHandler);

    await context.route("**/users/add", usersAddHandler);

    await context.route("**/users/filter*", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      const key = url.searchParams.get("key");
      const value = url.searchParams.get("value");
      const storedUser = UserStorage.getUser();
      const users: User[] = [];

      if (storedUser && key && value) {
        const field = (storedUser as any)[key];
        if (field !== undefined && String(field).toLowerCase() === value.toLowerCase()) {
          users.push(storedUser);
        }
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ users, total: users.length, skip: 0, limit: users.length }),
      });
    });

    await context.route("**/users/*", async (route) => {
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

        UserStorage.clearUser();

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...storedUser, isDeleted: true, deletedOn: new Date().toISOString() }),
        });
        return;
      }

      await route.continue();
    });
  });

  test("flujo completo: listar → crear → filtrar → listar → actualizar → filtrar → obtener → eliminar → listar", async ({ context, page }) => {
    const payload = newUserPayload();

    // Paso 1
    const getBefore = await apiRequest.get("/users?select=firstName,lastName,email");
    const getBeforeBody = (await getBefore.json()) as UsersResponse;

    console.log("[1] === GET All Users (antes de crear) ===");
    console.log(`    Status: ${getBefore.status()}`);
    console.log(`    Total usuarios en lista: ${getBeforeBody.total}`);
    console.log(`    ✓ El usuario a crear NO existe aún en el listado`);

    expect(getBefore.status()).toBe(200);
    expect(Array.isArray(getBeforeBody.users)).toBe(true);
    expect(getBeforeBody.users.some((u) => u.email === payload.email)).toBe(false);

    // Paso 2
    const created = await client.createUser(payload as unknown as any);
    const createResp = created.response;
    const createdUser = created.body as User;

    console.log("[2] === POST Create User ===");
    console.log(`    Status: ${createResp.status()}`);
    console.log(`    ID asignado: ${createdUser.id}`);
    console.log(`    Nombre: ${createdUser.firstName} ${createdUser.lastName}`);
    console.log(`    Email: ${createdUser.email}`);
    console.log(`    Username: ${createdUser.username}`);

    expect(createResp.status()).toBe(201);
    expect(createdUser.firstName).toBe(payload.firstName);
    expect(createdUser.email).toBe(payload.email);
    expect(createdUser.id).toBe(MOCK_USER_ID);

    // Paso 3
    const filterFields = ["firstName", "lastName", "email"] as const;
    for (const field of filterFields) {
      const value = String((createdUser as any)[field]);
      const filterResp = await apiRequest.get(`/users/filter?key=${field}&value=${encodeURIComponent(value)}`);
      const filterBody = (await filterResp.json()) as UsersResponse;

      console.log(`[3] === GET Filter Users by Field (${field}) ===`);
      console.log(`    Filtrando por ${field}: ${value}`);
      console.log(`    Status: ${filterResp.status()}`);
      console.log(`    Resultados encontrados: ${filterBody.total}`);
      console.log(`    ✓ Usuario encontrado: ${createdUser.firstName} ${createdUser.lastName} (ID: ${createdUser.id})`);

      expect(filterResp.status()).toBe(200);
      expect(filterBody.users.length).toBeGreaterThan(0);
      expect(filterBody.users.some((u) => u.id === createdUser.id)).toBe(true);
    }

    // Paso 4
    const getAfter = await apiRequest.get("/users?select=firstName,lastName,email");
    const getAfterBody = (await getAfter.json()) as UsersResponse;

    console.log("[4] === GET All Users (después de crear) ===");
    console.log(`    Status: ${getAfter.status()}`);
    console.log(`    Total usuarios: ${getAfterBody.total}`);
    console.log(`    ✓ Usuario '${createdUser.firstName} ${createdUser.lastName}' aparece en el listado`);

    expect(getAfter.status()).toBe(200);
    expect(getAfterBody.users.some((u) => u.email === payload.email)).toBe(true);

    // Paso 5
    const newLastName = `Test${getRandomSuffix()}`;
    const patchResp = await apiRequest.patch(`/users/${createdUser.id}`, { data: { lastName: newLastName } });
    const patchBody = (await patchResp.json()) as User & { isUpdated?: boolean };

    console.log("[5] === PATCH Update User ===");
    console.log(`    Actualizando ID: ${createdUser.id}`);
    console.log(`    lastName anterior: ${payload.lastName}`);
    console.log(`    lastName nuevo: ${newLastName}`);
    console.log(`    Status: ${patchResp.status()}`);
    console.log(`    ✓ Usuario actualizado correctamente`);

    expect(patchResp.status()).toBe(200);
    expect(patchBody.lastName).toBe(newLastName);
    expect(patchBody.firstName).toBe(payload.firstName);

    // Paso 6
    const updatedFields = [
      ["firstName", payload.firstName],
      ["lastName", newLastName],
      ["email", payload.email],
    ] as const;

    for (const [field, value] of updatedFields) {
      const filterResp = await apiRequest.get(`/users/filter?key=${field}&value=${encodeURIComponent(value as string)}`);
      const filterBody = (await filterResp.json()) as UsersResponse;

      console.log(`[6] === GET Filter Users by Field (${field}) ===`);
      console.log(`    Filtrando por ${field}: ${value}`);
      console.log(`    Status: ${filterResp.status()}`);
      console.log(`    Resultados encontrados: ${filterBody.total}`);
      console.log(`    ✓ Usuario encontrado con datos actualizados: ${payload.firstName} ${newLastName} (ID: ${createdUser.id})`);

      expect(filterResp.status()).toBe(200);
      expect(filterBody.users.length).toBeGreaterThan(0);
      expect(filterBody.users.some((u) => u.id === createdUser.id)).toBe(true);
    }

    // Paso 7
    const getByIdResp = await apiRequest.get(`/users/${createdUser.id}`);
    const getByIdBody = (await getByIdResp.json()) as User;

    console.log("[7] === GET User by ID ===");
    console.log(`    Buscando ID: ${createdUser.id}`);
    console.log(`    Status: ${getByIdResp.status()}`);
    console.log(`    Nombre actual: ${getByIdBody.firstName} ${getByIdBody.lastName}`);
    console.log(`    Email: ${getByIdBody.email}`);
    console.log(`    ✓ lastName modificado confirmado: ${newLastName}`);

    expect(getByIdResp.status()).toBe(200);
    expect(getByIdBody.id).toBe(createdUser.id);
    expect(getByIdBody.lastName).toBe(newLastName);
    expect(getByIdBody.email).toBe(payload.email);

    // Paso 8
    const deleteResp = await apiRequest.delete(`/users/${createdUser.id}`);
    const deleteBody = await deleteResp.json();

    console.log("[8] === DELETE User ===");
    console.log(`    Eliminando ID: ${createdUser.id}`);
    console.log(`    Nombre: ${createdUser.firstName} ${newLastName}`);
    console.log(`    Status: ${deleteResp.status()}`);
    console.log(`    isDeleted: ${deleteBody.isDeleted}`);
    console.log(`    ✓ Usuario eliminado exitosamente`);

    expect(deleteResp.status()).toBe(200);
    expect(deleteBody.isDeleted).toBe(true);

    // Paso 9
    const getAfterDelete = await apiRequest.get("/users?select=firstName,lastName,email");
    const getAfterDeleteBody = (await getAfterDelete.json()) as UsersResponse;

    console.log("[9] === GET All Users (después de eliminar) ===");
    console.log(`    Status: ${getAfterDelete.status()}`);
    console.log(`    Total usuarios: ${getAfterDeleteBody.total}`);
    console.log(`    ✓ Usuario '${createdUser.firstName} ${newLastName}' ya NO aparece en el listado`);

    expect(getAfterDelete.status()).toBe(200);
    expect(getAfterDeleteBody.users.some((u) => u.email === payload.email)).toBe(false);

    console.log("\n✅ FLUJO COMPLETO EXITOSO: listar → crear → filtrar → listar → actualizar → filtrar → obtener → eliminar → listar\n");
  });
});
