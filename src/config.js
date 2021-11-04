import { Platform, StatusBar } from 'react-native';

export const get = (obj, ...fields) => {
  fields = fields.map(field => {
    if(Array.isArray(field)){
      const [key, handler] = field
      return handler(key.split(".").reduce((obj, key) => (obj ? obj[key] : obj), obj))
    }
    else return field.split(".").reduce((obj, key) => (obj ? obj[key] : obj), obj)
  })
  return fields.length > 1 ? fields : fields[0]
}

const config = {
    base: 'https://proapp.wwfoldschool.com',
    base_api: 'https://proapp.wwfoldschool.com/API10/',
    wrestler_api: 'https://proapp.wwfoldschool.com/wrestler',
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
    advert: Platform.OS === 'ios'? 'ca-app-pub-3940256099942544/8691691433' : 'ca-app-pub-3940256099942544/1033173712'
};
  
export default config;
  