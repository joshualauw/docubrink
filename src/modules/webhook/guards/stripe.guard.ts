import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    RawBodyRequest,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Request } from "express";
import stripeConfig from "src/config/stripe.config";
import { StripeService } from "src/core/payment/stripe/stripe.service";

@Injectable()
export class StripeWebhookGuard implements CanActivate {
    constructor(
        private stripe: StripeService,
        @Inject(stripeConfig.KEY) private stripeCfg: ConfigType<typeof stripeConfig>,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<RawBodyRequest<Request>>();
        const signature = req.headers["stripe-signature"] as string;

        if (!req.rawBody || !signature) {
            throw new UnauthorizedException("stripe body or signature is missing");
        }

        try {
            req.body = this.stripe.client.webhooks.constructEvent(req.rawBody, signature, this.stripeCfg.webhookSecret);
            return true;
        } catch (err: any) {
            throw new UnauthorizedException(`stripe webhook verification failed: ${err.message}`);
        }
    }
}
