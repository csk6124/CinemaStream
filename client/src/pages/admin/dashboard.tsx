import { useEffect, useState, useMemo } from "react";
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
import { analytics, performance, startPerformanceTrace } from "@/lib/firebase";
import { getAnalytics, logEvent } from "firebase/analytics";

// 분석 카드 컴포넌트 메모이제이션
const AnalyticsCard = React.memo(({ 
  title, 
  value, 
  subtitle, 
  icon: Icon 
}: { 
  title: string; 
  value: number; 
  subtitle: string; 
  icon: any 
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Icon className="mr-2 h-5 w-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </CardContent>
  </Card>
));

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const [analyticsData, setAnalyticsData] = useState({
    activeUsers: 0,
    pageViews: 0,
    videoPlays: 0
  });

  // 쿼리 최적화
  const queryOptions = useMemo(() => ({
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    cacheTime: 1000 * 60 * 30, // 30분간 캐시 보관
  }), []);

  // Fetch current user and check if admin
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users/me"],
    ...queryOptions,
    retry: false
  });

  // Fetch courses with optimized query
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    ...queryOptions,
    enabled: !!user?.isAdmin
  });

  // Fetch users with optimized query
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    ...queryOptions,
    enabled: !!user?.isAdmin
  });

  // Fetch questions with optimized query
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/questions"],
    ...queryOptions,
    enabled: !!user?.isAdmin
  });

  useEffect(() => {
    if (!userLoading && (!user || !user.isAdmin)) {
      setLocation("/");
      return;
    }

    const pageLoadTrace = startPerformanceTrace('admin_dashboard_load');

    // Firebase Analytics 데이터 페이지 로드시 기록
    if (analytics) {
      logEvent(analytics, 'admin_dashboard_view');
    }

    const fetchData = async () => {
      try {
        const activeUsers = await fetchActiveUsers();
        const pageViews = await fetchPageViews();
        const videoPlays = await fetchVideoPlays();

        setAnalyticsData({ activeUsers, pageViews, videoPlays });
        pageLoadTrace?.stop();
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        pageLoadTrace?.stop();
      }
    };

    fetchData();
  }, [user, userLoading, setLocation]);

  // 데이터 페칭 함수들 메모이제이션
  const fetchActiveUsers = useMemo(() => async () => {
    const trace = startPerformanceTrace('fetch_active_users');
    try {
      // Implement your Firebase logic
      return 0;
    } finally {
      trace?.stop();
    }
  }, []);

  const fetchPageViews = useMemo(() => async () => {
    const trace = startPerformanceTrace('fetch_page_views');
    try {
      // Implement your Firebase logic
      return 0;
    } finally {
      trace?.stop();
    }
  }, []);

  const fetchVideoPlays = useMemo(() => async () => {
    const trace = startPerformanceTrace('fetch_video_plays');
    try {
      // Implement your Firebase logic
      return 0;
    } finally {
      trace?.stop();
    }
  }, []);

  if (userLoading || coursesLoading || usersLoading || questionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 분석 카드 데이터 메모이제이션
  const analyticsCards = useMemo(() => [
    {
      title: "실시간 사용자",
      value: analyticsData.activeUsers,
      subtitle: "현재 접속중",
      icon: Activity
    },
    {
      title: "페이지 조회",
      value: analyticsData.pageViews,
      subtitle: "오늘",
      icon: Eye
    },
    {
      title: "비디오 재생",
      value: analyticsData.videoPlays,
      subtitle: "오늘 총 재생 수",
      icon: Play
    },
    {
      title: "총 사용자",
      value: users.length,
      subtitle: "가입 사용자 수",
      icon: Users
    }
  ], [analyticsData, users.length]);

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
        {analyticsCards.map((card, index) => (
          <AnalyticsCard key={index} {...card} />
        ))}
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