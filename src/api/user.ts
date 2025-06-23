import request from "@/utils/request";

export interface ApiResponse<T> {
    code: number;
    data: T;
    msg: string;
}

export interface User {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export async function getMe(): Promise<User> {
  const response: ApiResponse<User> = await request({
    url: "/auth/me",
    method: "get",
  });
  return response.data;
}

export function updateMe(data: Partial<Pick<User, "username" | "email" | "phone">>): Promise<ApiResponse<null>> {
    return request({
        url: "/users/me",
        method: "put",
        data,
    });
}

export async function getAllUsers(): Promise<User[]> {
  const response: ApiResponse<User[]> = await request({
    url: "/users",
    method: "get",
  });
  return response.data;
}

export function updateUser(id: number, data: Partial<Pick<User, "username" | "email" | "phone" | "role">>): Promise<ApiResponse<null>> {
  return request({
    url: `/users/${id}`,
    method: "put",
    data,
  });
}

export function deleteUser(id: number): Promise<ApiResponse<null>> {
  return request({
    url: `/users/${id}`,
    method: "delete",
  });
}
