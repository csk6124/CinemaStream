import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getPerformance, trace } from "firebase/performance";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const analytics = getAnalytics(app);
const performance = getPerformance(app);
const provider = new GoogleAuthProvider();

// 성능 모니터링 함수
export const startPerformanceTrace = (traceName: string) => {
  try {
    if (!performance) {
      console.warn("Firebase Performance is not initialized");
      return null;
    }
    const newTrace = trace(performance, traceName);
    console.log(`Performance trace started: ${traceName}`);
    return newTrace;
  } catch (error) {
    console.error("Performance trace failed to start:", error);
    // Firebase Performance 초기화 상태 확인
    if (!app.options.measurementId) {
      console.error("Firebase measurementId is missing");
    }
    return null;
  }
};

// 기본 이벤트 로깅 함수
export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
  try {
    if (!analytics) {
      console.warn("Firebase Analytics is not initialized");
      return;
    }
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error("Analytics event logging failed:", error);
    // Analytics 초기화 상태 확인
    if (!app.options.measurementId) {
      console.error("Firebase measurementId is missing");
    }
  }
};

// 사용자 로그인 이벤트
export async function signInWithGoogle() {
  const authTrace = startPerformanceTrace('auth_signin');
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    authTrace?.stop();

    logAnalyticsEvent('login', {
      method: 'google',
      userId: user.uid
    });

    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    authTrace?.stop();
    throw error;
  }
}

// 페이지 조회 이벤트 트래킹
export const trackPageView = (pageName: string) => {
  logAnalyticsEvent('page_view', {
    page_name: pageName,
    page_location: window.location.href
  });
};

// 비디오 관련 이벤트 트래킹
export const trackVideoEvent = (eventType: 'play' | 'pause' | 'complete', videoId: string) => {
  logAnalyticsEvent(`video_${eventType}`, {
    video_id: videoId,
    timestamp: new Date().toISOString()
  });
};

export { auth, analytics, performance };