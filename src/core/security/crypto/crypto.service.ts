import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import crypto from "crypto";
import cryptoConfig from "src/config/crypto.config";

@Injectable()
export class CryptoService {
    private readonly ENCRYPT_ALGORITHM = "aes-256-cbc";
    private readonly HASH_ALGORITHM = "sha256";
    private readonly KEY: Buffer;
    private readonly IV_LENGTH = 16; // AES block size

    constructor(@Inject(cryptoConfig.KEY) private cryptoCfg: ConfigType<typeof cryptoConfig>) {
        this.KEY = crypto.createHash("sha256").update(this.cryptoCfg.secret).digest();
    }

    generateKey(length: number = 32): string {
        return crypto.randomBytes(length).toString("hex");
    }

    hash(plainText: string): string {
        return crypto.createHash(this.HASH_ALGORITHM).update(plainText).digest("hex");
    }

    encrypt(plainText: string): string {
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const cipher = crypto.createCipheriv(this.ENCRYPT_ALGORITHM, this.KEY, iv);
        const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);

        return iv.toString("hex") + ":" + encrypted.toString("hex");
    }

    decrypt(cipherText: string): string {
        const [ivHex, encryptedHex] = cipherText.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const encryptedText = Buffer.from(encryptedHex, "hex");
        const decipher = crypto.createDecipheriv(this.ENCRYPT_ALGORITHM, this.KEY, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

        return decrypted.toString("utf8");
    }
}
