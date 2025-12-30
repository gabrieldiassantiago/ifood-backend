import { Role } from "../../../../generated/prisma/client"

export interface CreateUserInput {
  name: string
  phone: string
  email?: string
  password: string
  role?: Role
}

export interface UserResponse {
  id: string
  name: string
  phone: string
  email?: string | null
  role: Role
  createdAt: Date
}
