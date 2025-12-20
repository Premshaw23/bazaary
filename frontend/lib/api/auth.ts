import { apiFetch } from "./client";

type AuthResponse = {
  access_token: string;
};

export function loginApi(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerApi(
  email: string,
  password: string,
  role: "BUYER" | "SELLER"
) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}
