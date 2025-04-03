import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import RecordsTable from "@/components/RecordsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RecordsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-10">
      <div className="container mx-auto px-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-2xl font-bold text-gray-900">Kayıtlarım</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <RecordsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 