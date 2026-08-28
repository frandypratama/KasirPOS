import { Sidebar } from "@/src/component/layout/sidebar";
import { Header } from "@/src/component/layout/header";
import React from "react";
export default function DashboardLayout({children}:
{children: React.ReactNode}) {
    return <div>
        <Sidebar /> <Header /> {children}
    </div>;
}  