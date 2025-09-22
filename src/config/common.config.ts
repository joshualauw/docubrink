import { registerAs } from "@nestjs/config";

export default registerAs("common", () => ({
    port: parseInt(process.env.PORT || "3001"),
    baseUrl: process.env.BASE_URL || "http://localhost:3001",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
}));