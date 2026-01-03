import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const newAdmins = [
    { email: "niko@clarity-group.org", password: "niko12345", name: "Niko" },
    { email: "adli@clarity-group.org", password: "adli12345", name: "Adli" },
    { email: "amirhafizi@clarity-group.org", password: "amir12345", name: "Amir Hafizi" },
    { email: "aqil@clarity-group.com", password: "aqil12345", name: "Aqil" },
];

async function addAdmins() {
    console.log("🔐 Adding new admins...\n");

    for (const admin of newAdmins) {
        const hashedPassword = await bcrypt.hash(admin.password, 12);

        try {
            const created = await prisma.admin.upsert({
                where: { email: admin.email },
                update: { password: hashedPassword, name: admin.name },
                create: {
                    email: admin.email,
                    password: hashedPassword,
                    name: admin.name,
                },
            });
            console.log(`✅ Admin added/updated: ${created.email}`);
        } catch (error) {
            console.error(`❌ Error adding ${admin.email}:`, error);
        }
    }

    console.log("\n✨ Done!");
}

addAdmins()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
