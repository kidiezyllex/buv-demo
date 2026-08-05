import LeadApiTesterPage from "@/components/LeadApiTesterPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lead API Tester | Salesforce",
    description: "Test REST API tạo Lead trên Salesforce",
};

export default function Page() {
    return (
        <main className="h-screen overflow-y-auto">
            <LeadApiTesterPage />
        </main>
    );
}
