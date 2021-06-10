import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import firebase from 'react-native-firebase';
import { registerAppListener } from "./Listeners";
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import DeviceInfo from 'react-native-device-info';

import Welcome from './user/Welcome';
import Login from './user/Login';
import SignUp from './user/SignUp';
import ForgotPassword from './user/ForgotPassword';
import ContactUs from './menu/ContactUs';
import WrestleMoney from './menu/WrestleMoney';
import FullWebview from './common/FullWebview';
import PinchImage from './timeline/PinchImage';
import { TabLabel } from './common/Component';

import News from './tab/News';
import Memes from './tab/Memes';
import Videos from './tab/Videos';
import OldSchool from './tab/OldSchool';
import Raw from './tab/Raw';
import SmackDown from './tab/SmackDown';
import Nxt from './tab/Nxt';
import Aew from './tab/Aew';
import Divas from './tab/Divas';
import config from './config';
import Tabs from './common/Tabs';

let notch = DeviceInfo.hasNotch();

const Dashboard = createMaterialTopTabNavigator(
    {
        News: News,
        Memes: Memes,
        Divas: Divas,
        Videos: Videos,
        OldSchool: OldSchool,
        // Raw: Raw,
        // SmackDown: SmackDown,
        // Nxt: Nxt,
        Aew: Aew
    },{
        defaultNavigationOptions: ({ navigation }) => ({
            tabBarLabel: ({ focused, horizontal, tintColor, title }) => {
                let tab_name = navigation.state.routeName;
                return(
                    <TabLabel name={tab_name} status={focused} />
                )
            }
        }),
        tabBarComponent: (props) => { return(<Tabs {...props} />) },
        tabBarOptions: {
            scrollEnabled: true,
            showIcon: false,
            showLabel: true,
            lazyLoad: true,
            style: {
                backgroundColor: 'transparent',
                position: 'absolute',
                left: 46,
                right: 8,
                top: config.ios ? notch ? 24 : 0 : 0,
                zIndex: 1, 
                paddingTop: 12, 
                paddingBottom: 12 
            },
            tabStyle: {
                paddingLeft: 0,
                paddingRight: 0,
                width: 110,
                height: 56
            },
            indicatorStyle: {
                backgroundColor: 'transparent'
            },
        },
        
    }
)

const AppNavigator = createStackNavigator(
    {
        Welcome: Welcome,
        Login: Login,
        SignUp: SignUp,
        ForgotPassword: ForgotPassword,
        Dashboard: Dashboard,
        ContactUs: ContactUs,
        WrestleMoney: WrestleMoney,
        FullWebview: FullWebview,
        PinchImage: PinchImage,
    },
    {
      initialRouteName: 'Welcome',
      headerMode: 'none'  
    }
);
const AppContainer = createAppContainer(AppNavigator);



class AppBase extends Component {
    async componentDidMount() {
        registerAppListener(this.props.navigation); 
        this.getFirebaseSetup()
        try {
            await firebase.messaging().requestPermission();
            // User has authorised
        } catch (error) {
            // User has rejected permissions
        }
    }

    getFirebaseSetup() {
        
    }

    render() {
        return(
            <AppContainer />
        )
    }
}

export default AppBase;