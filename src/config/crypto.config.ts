import { registerAs } from "@nestjs/config";

export default registerAs("crypto", () => ({
    secret: process.env.CRYPTO_SECRET || "32-bytes-key",
}));
