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
                description: "Free plan for Docubrink",
                queryTokenLimit: 5000,
                embeddingTokenLimit: 1000,
                maxSources: 25,
                price: 0,
            },
            {
                name: "basic",
                description: "Basic plan for Docubrink",
                queryTokenLimit: 25000,
                embeddingTokenLimit: 5000,
                maxSources: 75,
                price: 500,
                stripePriceId: "price_1SFSKiQadB7ZZTKOa0cVUA18",
            },
            {
                name: "pro",
                description: "Paid plan for Docubrink",
                queryTokenLimit: 75000,
                embeddingTokenLimit: 15000,
                maxSources: 200,
                price: 1500,
                stripePriceId: "price_1SFSNfQadB7ZZTKOUHTl1Irz",
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
