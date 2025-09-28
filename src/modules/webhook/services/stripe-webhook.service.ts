import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import Stripe from "stripe";

@Injectable()
export class StripeWebhookService {
    constructor(private prismaService: PrismaService) {}
}
