import { registerAs } from "@nestjs/config";

export default registerAs("stripe", () => ({
    apiKey: process.env.STRIPE_API_KEY || "sk_",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_",
}));
