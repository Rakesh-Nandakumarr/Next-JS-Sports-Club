
import Player from "@/models/Player"; // Adjust the path to where Player is defined

import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const player = await Player.create({
        name: "Jonah Hudson",
        age: 42,
        contact: "Eligendi cillum sequ",
        description: "Autem sint dolor ma",
        imageUrl: "/uploads/1744921682998.jpeg",
        sport: "67fd7774b60fb4c611208fa7",
        team: "67fd8492b60fb4c611208fc4",
        additionalFields: {
            name: "Vol",
            option: "Option 3"
        }
    });
    return NextResponse.json({ message: "Player created successfully", player });
}
