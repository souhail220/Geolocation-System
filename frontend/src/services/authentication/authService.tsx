import { ApiResponseUser } from "@/types/authTypes/authResponse.ts";
import { RegisterUser } from "@/types/auth.ts";

const baseUrl = "http://localhost:8080/api/auth"

export async function LoginApi(email, password) : Promise<ApiResponseUser> {
  const response = await fetch(baseUrl + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        password: password
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const data : ApiResponseUser = await response.json();

  // Extract token from response headers
  const token = response.headers.get("Authorization");
  data.token = token ?? "";

  return data;
}

export async function RegisterApi(user: RegisterUser) : Promise<ApiResponseUser> {
  const response = await fetch(baseUrl + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if(!response.ok){
    throw new Error("Register failed");
  }
  const data = await response.json();

  // Extract token from response headers
  const token = response.headers.get("Authorization");
  data.token = token ?? "";

  return data;
}

