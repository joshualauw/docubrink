import "winston-daily-rotate-file";
import { format, transports } from "winston";
import TransportStream from "winston-transport";

const { combine, timestamp, printf, colorize, json } = format;

export const createWinstonTransports = (options: {
    fileLogging?: boolean;
    consoleLogging?: boolean;
}): TransportStream[] => {
    const activeTransports: TransportStream[] = [];

    if (options.consoleLogging) {
        activeTransports.push(
            new transports.Console({
                format: combine(
                    colorize(),
                    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                    printf(({ timestamp, level, message }) => {
                        return `[${timestamp}] ${level}: ${message}`;
                    }),
                ),
            }),
        );
    }

    if (options.fileLogging) {
        activeTransports.push(
            new transports.DailyRotateFile({
                dirname: "logs",
                filename: "app-%DATE%.log",
                datePattern: "YYYY-MM-DD",
                zippedArchive: true,
                maxSize: "20m",
                maxFiles: "14d",
                format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json({ deterministic: false })),
            }),
        );
    }

    return activeTransports;
};
