// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
  expiresInMins?: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  gender: string;
  image: string;
  age: number;
  phone: string;
}

export interface UserPayload {
  firstName: string;
  lastName: string;
  age: number;
}

export interface CreatedUser extends UserPayload {
  id: number;
}

export interface UpdatedUser extends Partial<UserPayload> {
  id: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

// ─── Product (recurso alternativo para tests) ─────────────────────────────────

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}
