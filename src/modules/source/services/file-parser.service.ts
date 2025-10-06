import { BadRequestException, Injectable } from "@nestjs/common";
import mammoth from "mammoth";
import { PdfReader } from "pdfreader";

@Injectable()
export class FileParserService {
    async parse(file: Express.Multer.File): Promise<string> {
        const mimeType = file.mimetype;

        if (mimeType === "text/plain") {
            return file.buffer.toString("utf8");
        }

        if (mimeType === "application/pdf") {
            return new Promise((resolve, reject) => {
                let allText: string[] = [];
                const reader = new PdfReader();

                reader.parseBuffer(file.buffer, (err, item) => {
                    if (err) return reject(err);
                    if (!item) {
                        resolve(allText.join(" "));
                    } else if (item.text) {
                        allText.push(item.text);
                    }
                });
            });
        }

        if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            return result.value;
        }

        throw new BadRequestException("Unsupported parsing format");
    }
}

export default FileParserService;
