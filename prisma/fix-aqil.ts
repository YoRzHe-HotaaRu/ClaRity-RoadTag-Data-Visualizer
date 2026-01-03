import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function fixAqilEmail() {
    console.log("🔧 Fixing Aqil's email...\n");

    // Delete the wrong email entry
    try {
        await prisma.admin.delete({
            where: { email: "aqil@clarity-group.com" },
        });
        console.log("✅ Deleted old entry: aqil@clarity-group.com");
    } catch {
        console.log("ℹ️ Old entry not found (already deleted or doesn't exist)");
    }

    // Add with correct email
    const hashedPassword = await bcrypt.hash("aqil12345", 12);
    const created = await prisma.admin.upsert({
        where: { email: "aqil@clarity-group.org" },
        update: { password: hashedPassword, name: "Aqil" },
        create: {
            email: "aqil@clarity-group.org",
            password: hashedPassword,
            name: "Aqil",
        },
    });
    console.log(`✅ Admin added: ${created.email}`);

    console.log("\n✨ Done!");
}

fixAqilEmail()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
