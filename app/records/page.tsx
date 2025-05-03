import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RecordsTable from "@/components/RecordsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RecordsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="py-10">
      <div className="container mx-auto">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-2xl font-bold text-gray-900">Kayıtlarım</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <RecordsTable />
          </CardContent>
      </div>
    </div>
  );
} 