import { User } from "@prisma/client";
import * as z from "zod";

export const registerBody = z
    .object({
        username: z.string().min(1, "username is required"),
        email: z.string().min(1, "email is required"),
        password: z.string().min(3, "password minimum is 3 characters"),
        passwordConfirm: z.string().min(3, "password minimum is 3 characters"),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        message: "password confirmation does not match",
        path: ["passwordConfirm"],
    });

export type RegisterBody = z.infer<typeof registerBody>;

export type RegisterDto = RegisterBody;

export type RegisterResponse = Pick<User, "userId"> & {
    createdAt: string;
};
