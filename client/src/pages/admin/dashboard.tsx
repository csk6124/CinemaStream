import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Plus,
  BookOpen,
  Users,
  HelpCircle,
  Loader2,
  Activity,
  Play,
  Eye
} from "lucide-react";
import { analytics } from "@/lib/firebase";
import { getAnalytics, logEvent } from "firebase/analytics";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const [analyticsData, setAnalyticsData] = useState({
    activeUsers: 0,
    pageViews: 0,
    videoPlays: 0
  });

  // Fetch current user and check if admin
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users/me"],
    retry: false
  });

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    enabled: !!user?.isAdmin
  });

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user?.isAdmin
  });

  // Fetch questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/questions"],
    enabled: !!user?.isAdmin
  });

  useEffect(() => {
    if (!userLoading && (!user || !user.isAdmin)) {
      setLocation("/");
    }
  }, [user, userLoading, setLocation]);

  useEffect(() => {
    // Firebase Analytics 데이터 페이지 로드시 기록
    if (analytics) {
      logEvent(analytics, 'admin_dashboard_view');
    }
    // Add Firebase analytics data fetching here (replace with your actual fetching logic)
    // Example:  Fetch real-time user count, page views, video plays from Firebase
    const fetchData = async () => {
      try {
        // Replace with your actual Firebase data fetching
        const activeUsers = await fetchActiveUsers(); // Your function to fetch active users
        const pageViews = await fetchPageViews();     // Your function to fetch page views
        const videoPlays = await fetchVideoPlays();   // Your function to fetch video plays

        setAnalyticsData({ activeUsers, pageViews, videoPlays });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        // Handle error appropriately (e.g., display an error message)
      }
    };
    fetchData();


  }, []);

  const fetchActiveUsers = async () => {
    // Implement your Firebase logic to get active users
    return 0; // Replace with actual data
  };

  const fetchPageViews = async () => {
    // Implement your Firebase logic to get page views
    return 0; // Replace with actual data
  };

  const fetchVideoPlays = async () => {
    // Implement your Firebase logic to get video plays
    return 0; // Replace with actual data
  };


  if (userLoading || coursesLoading || usersLoading || questionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <div className="space-x-4">
          <Button onClick={() => setLocation("/admin/courses/new")}>
            <Plus className="mr-2 h-4 w-4" />
            새 강의 만들기
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              실시간 사용자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analyticsData.activeUsers}</p>
            <p className="text-sm text-gray-500">현재 접속중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              페이지 조회
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analyticsData.pageViews}</p>
            <p className="text-sm text-gray-500">오늘</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="mr-2 h-5 w-5" />
              비디오 재생
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analyticsData.videoPlays}</p>
            <p className="text-sm text-gray-500">오늘 총 재생 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              총 사용자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-sm text-gray-500">가입 사용자 수</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              강의 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{courses.length}</p>
            <p className="text-sm text-gray-500">총 강의 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="mr-2 h-5 w-5" />
              문제 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{questions.length}</p>
            <p className="text-sm text-gray-500">총 문제 수</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 강의</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>작성자</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.slice(0, 5).map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.authorName}</TableCell>
                    <TableCell>{new Date(course.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>활성</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setLocation(`/admin/courses/${course.id}`)}>
                        관리
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.slice(0, 5).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{user.isAdmin ? '관리자' : '사용자'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setLocation(`/admin/users/${user.id}`)}>
                        관리
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}