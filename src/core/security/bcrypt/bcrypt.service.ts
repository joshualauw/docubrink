import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class BcryptService {
    get client(): typeof bcrypt {
        return bcrypt;
    }

    async hash(string: string, length: number = 10): Promise<string> {
        return await bcrypt.hash(string, length);
    }

    async compare(string1: string, string2: string): Promise<boolean> {
        return await bcrypt.compare(string1, string2);
    }
}
