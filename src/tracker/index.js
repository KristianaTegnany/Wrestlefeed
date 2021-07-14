import { GoogleAnalyticsSettings, GoogleAnalyticsTracker } from 'react-native-google-analytics-bridge';

GoogleAnalyticsSettings.setDryRun(false);
GoogleAnalyticsSettings.setDispatchInterval(100);

export const tracker = new GoogleAnalyticsTracker('UA-194373132-1');