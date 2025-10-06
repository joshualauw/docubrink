import { Injectable, Logger } from "@nestjs/common";
import dayjs from "dayjs";
import path from "path";
import fs from "fs/promises";
import { genRandomAlphanum } from "src/utils/common";

@Injectable()
export class LocalStorageService {
    private readonly logger = new Logger(LocalStorageService.name);
    private UPLOAD_DIR = path.join(process.cwd(), "uploads");

    async writeFile(file: Express.Multer.File): Promise<string> {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${genRandomAlphanum(6)}_${dayjs().format("DDMMYYYYHHMMSS")}${fileExtension}`;

        const fullPath = path.join(this.UPLOAD_DIR, fileName);

        await fs.writeFile(fullPath, file.buffer);
        this.logger.log(`Successfully created file: ${fullPath}`);

        return path.join("uploads", fileName);
    }

    async deleteFile(relativePath: string): Promise<void> {
        const fullPath = path.join(process.cwd(), relativePath);

        await fs.unlink(fullPath);
        this.logger.log(`Successfully deleted file: ${fullPath}`);
    }
}
