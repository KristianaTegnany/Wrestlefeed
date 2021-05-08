import { Platform, StatusBar } from 'react-native';

const config = {
    base_api: 'https://app.wwfoldschool.com/API10/',
    prev_base_api: 'https://devapp.wwfoldschool.com/API9',
    show_days_limit: 1,
    ios: Platform.OS == 'ios' ? true : false,
    statusbar_height: StatusBar.currentHeight,
    no_story_ads: 7,
    android_ads_unit_id: 'ca-app-pub-3940256099942544/1033173712',
    post_number_ads: 7,
    android: {
        client_id: '126096465796-8v9vo61qobjuel9pgpdc0gfnpvctjg6h.apps.googleusercontent.com',
        client_secret: 'Tw799qAnuAIRFrhgXPpAyvRH',
    },
};
  
export default config;
  