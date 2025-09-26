import { Module } from "@nestjs/common";
import { BcryptService } from "src/core/security/bcrypt/bcrypt.service";
import { CryptoService } from "src/core/security/crypto/crypto.service";

@Module({
    providers: [CryptoService, BcryptService],
    exports: [CryptoService, BcryptService],
})
export class SecurityModule {}
