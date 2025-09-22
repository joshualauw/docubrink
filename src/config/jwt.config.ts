import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => ({
    secret: process.env.JWT_SECRET || "S3cr3t",
    expiresIn: parseInt(process.env.JWT_EXPIRES || "3600"),
}));
