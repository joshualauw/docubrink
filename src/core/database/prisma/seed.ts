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
                aiTokenLimit: 10000,
                userLimit: 3,
                stripePriceId: "price_1SBYLDHTFU6Tpn45Yz0zeu03",
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
