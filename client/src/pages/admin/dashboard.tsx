import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  
  // Fetch current user and check if admin
  const { data: user, isLoading } = useQuery({ 
    queryKey: ["/api/users/me"],
    retry: false
  });

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>강의 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-gray-500">총 강의 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>문제 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-gray-500">총 문제 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>사용자 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-gray-500">총 사용자 수</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
