import { User } from "@prisma/client";
import { AuthToken } from "src/modules/auth/dtos/AuthToken";
import * as z from "zod";

export const loginBody = z.object({
    email: z.string().min(1, "email is required").email({ message: "email must be a valid email" }),
    password: z.string().min(3, "password minimum is 3 characters"),
});

export type LoginBody = z.infer<typeof loginBody>;

export type LoginDto = LoginBody;

export interface LoginResponse {
    user: Pick<User, "userId" | "email" | "username" | "profileUrl">;
    token: AuthToken;
}
