import { Module } from "@nestjs/common";
import { LocalStorageService } from "src/core/storage/local/local-storage.service";

@Module({
    providers: [LocalStorageService],
    exports: [LocalStorageService],
})
export class StorageModule {}
