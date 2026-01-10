import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourapp.briefing',
  appName: 'SHIFT 경제 브리핑',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,  // 네이티브 HTTP 사용으로 CORS 우회
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
