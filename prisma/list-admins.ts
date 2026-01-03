import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listAdmins() {
    const admins = await prisma.admin.findMany({
        select: { email: true, name: true, createdAt: true },
        orderBy: { createdAt: "asc" },
    });

    console.log("📋 All admins in Neon database:\n");
    admins.forEach((admin, i) => {
        console.log(`${i + 1}. ${admin.email} (${admin.name})`);
    });
    console.log(`\nTotal: ${admins.length} admins`);
}

listAdmins()
    .finally(async () => {
        await prisma.$disconnect();
    });
