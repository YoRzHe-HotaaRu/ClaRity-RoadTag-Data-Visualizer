import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const malaysianStates = [
    "Johor",
    "Kedah",
    "Kelantan",
    "Melaka",
    "Negeri Sembilan",
    "Pahang",
    "Penang",
    "Perak",
    "Perlis",
    "Sabah",
    "Sarawak",
    "Selangor",
    "Terengganu",
    "Kuala Lumpur",
    "Labuan",
    "Putrajaya",
];

async function main() {
    console.log("🌱 Starting seed...");

    // Create admin user
    const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || "admin123",
        12
    );

    const admin = await prisma.admin.upsert({
        where: { email: process.env.ADMIN_EMAIL || "admin@clarity.com" },
        update: {},
        create: {
            email: process.env.ADMIN_EMAIL || "admin@clarity.com",
            password: hashedPassword,
            name: "Administrator",
        },
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create sample locations
    const sampleLocations = [
        {
            name: "Petronas Twin Towers",
            latitude: 3.1578,
            longitude: 101.7117,
            elevation: 45,
            state: "Kuala Lumpur",
            description: "Iconic twin skyscrapers in KLCC",
            imageryDate: new Date("2024-06-15"),
        },
        {
            name: "Batu Caves",
            latitude: 3.2379,
            longitude: 101.684,
            elevation: 100,
            state: "Selangor",
            description: "Limestone hill with Hindu temples",
            imageryDate: new Date("2024-05-20"),
        },
        {
            name: "George Town Heritage",
            latitude: 5.4141,
            longitude: 100.3288,
            elevation: 5,
            state: "Penang",
            description: "UNESCO World Heritage Site",
            imageryDate: new Date("2024-07-10"),
        },
        {
            name: "Mount Kinabalu Base",
            latitude: 6.0756,
            longitude: 116.5586,
            elevation: 1866,
            state: "Sabah",
            description: "Base camp of Mount Kinabalu",
            imageryDate: new Date("2024-04-05"),
        },
        {
            name: "Langkawi Sky Bridge",
            latitude: 6.377,
            longitude: 99.6646,
            elevation: 660,
            state: "Kedah",
            description: "Curved pedestrian bridge at Gunung Mat Cincang",
            imageryDate: new Date("2024-08-22"),
        },
    ];

    for (const location of sampleLocations) {
        const created = await prisma.location.upsert({
            where: { id: location.name.toLowerCase().replace(/\s+/g, "-") },
            update: location,
            create: {
                ...location,
                id: location.name.toLowerCase().replace(/\s+/g, "-"),
            },
        });
        console.log(`📍 Location created: ${created.name}`);
    }

    console.log("✨ Seed completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
