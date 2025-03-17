import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Analytics 측정 ID 추가
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();

// 기본 이벤트 로깅 함수
export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error("Analytics event logging failed:", error);
  }
};

// 사용자 로그인 이벤트
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 로그인 성공 이벤트 기록
    logAnalyticsEvent('login', {
      method: 'google',
      userId: user.uid
    });

    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
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

export { auth, analytics };