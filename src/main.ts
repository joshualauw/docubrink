import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { WinstonModule } from "nest-winston";
import { createWinstonTransports } from "src/core/logger/winston/winston-setup";
import { HttpExceptionFilter } from "src/common/filters/http-exception.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        rawBody: true,
        bodyParser: true,
        logger: WinstonModule.createLogger({
            transports: createWinstonTransports({
                fileLogging: true,
                consoleLogging: true
            })
        })
    });

    app.enableShutdownHooks();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.enableCors();

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
