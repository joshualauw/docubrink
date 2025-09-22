import { PipeTransform, ArgumentMetadata, BadRequestException, Paramtype } from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
    constructor(
        private schema: ZodSchema,
        private type: Paramtype = "body",
    ) { }

    transform(value: unknown, metadata: ArgumentMetadata) {
        if (metadata.type != this.type) return value;

        try {
            return this.schema.parse(value);
        } catch (e) {
            if (e instanceof ZodError) {
                const errors = e.issues.map((zd) => zd.message);
                throw new BadRequestException(errors);
            }
            throw new BadRequestException("Validation failed");
        }
    }
}