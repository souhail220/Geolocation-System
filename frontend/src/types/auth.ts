export type Role = "ADMINISTRATOR" | "MANAGER" | "OBSERVER";

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string
  role: Role;
}

export interface RegisterUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  teamId: number;
  role: Role;
}
