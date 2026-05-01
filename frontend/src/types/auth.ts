export type Role = "admin" | "supervisor" | "operator" | "viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}
