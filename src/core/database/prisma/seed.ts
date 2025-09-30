import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting the seeding process...");
    await planSeeder();
    console.log(`Seeding done ✅`);
}

async function planSeeder() {
    await prisma.plan.createMany({
        data: [
            {
                name: "free",
                apiCallLimit: 1000,
                queryTokenLimit: 50000,
                embeddingTokenLimit: 10000,
                maxSources: 50,
                stripePriceId: "price_1SCDUqQadB7ZZTKOZnW2FIuB",
                price: 0,
            },
        ],
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
