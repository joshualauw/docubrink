import { User } from "@prisma/client";

export type GetMeResponse = Pick<User, "userId" | "username" | "email" | "profileUrl">;
