import { UserButton } from "@clerk/nextjs";
import React from "react";

export default function Home() {
    return (
        <div>
            Home
            <UserButton />
        </div>
    );
}
