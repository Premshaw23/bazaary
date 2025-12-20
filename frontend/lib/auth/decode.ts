import { jwtDecode } from "jwt-decode";

export type JwtPayload = {
  sub: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  exp: number;
};

export function decodeToken(token: string): JwtPayload {
  return jwtDecode<JwtPayload>(token);
}
