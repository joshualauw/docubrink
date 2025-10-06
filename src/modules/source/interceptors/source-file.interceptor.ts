import { BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

export const ALLOWED_MIME_TYPES = [
    "text/plain", // .txt
    "application/pdf", // .pdf
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

export const SourceFileInterceptor = FileInterceptor("file", {
    fileFilter: (_, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
            return callback(
                new BadRequestException(`Invalid File Type. Only ${ALLOWED_MIME_TYPES.join(", ")} are allowed`),
                false,
            );
        }
        callback(null, true);
    },
    limits: { fileSize: 1024 * 1024 * 5 }, //5mb
});
