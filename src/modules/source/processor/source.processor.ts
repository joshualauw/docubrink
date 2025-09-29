import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { QueueKey } from "src/types/QueueKey";

@Processor(QueueKey.SOURCE)
export class SourceProcessor extends WorkerHost {
    async process(job: Job<number>): Promise<void> {
        console.log(job.data);
    }
}
