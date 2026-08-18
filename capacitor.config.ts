import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.asp.app',
  appName: 'Automated Student Planner',
  webDir: 'public',
  server: {
  url: 'http://10.182.51.248:3000',
  cleartext: true,
},
};

export default config;
