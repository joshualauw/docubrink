import { registerAs } from "@nestjs/config";

export default registerAs("mailer", () => ({
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER || "joshtest@mail.com",
    from: process.env.SMTP_FROM || "noreply@example.com",
    password: process.env.SMTP_PASS || "123",
}));
