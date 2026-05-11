import { User } from "@/types/auth.ts";

export interface ApiResponseUser {
  error: string,
  message: string,
  result: User,
  token?:string,
  success: boolean
}