import React, { Component } from 'react';
import { View, Text, SafeAreaView, Dimensions, ImageBackground, Image, TouchableOpacity, Alert, ActivityIndicator, ToastAndroid, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
import { StackActions, NavigationActions } from 'react-navigation';
import { LoginManager, AccessToken } from "react-native-fbsdk";
import firebase from 'react-native-firebase';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import config from '../config';
import appleAuth, {
    AppleButton,
    AppleAuthRequestOperation,
    AppleAuthRequestScope
}   from '@invertase/react-native-apple-authentication'
import Wrestlefeed from '../common/Wrestlefeed';


let { width, height } = Dimensions.get('screen');
let bg_height = config.ios ? height : height
let systemVersion = DeviceInfo.getSystemVersion();
systemVersion = typeof(systemVersion) == 'string' ? Number(systemVersion) : systemVersion;

class Welcome extends Component {
    state = {
        loading: false,
        loading_apple: false,
        loading_google: false,
        user_id: ''
    }

    componentDidMount() {
        this.initialOpenManage();
        GoogleSignin.configure({
            scopes: [], // what API you want to access on behalf of the user, default is email and profile
            webClientId: config.android.client_id, // client ID of type WEB for your server (needed to verify user ID and offline access)
            offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
            hostedDomain: '', // specifies a hosted domain restriction
            loginHint: '', // [iOS] The user's ID, or email address, to be prefilled in the authentication UI if possible. [See docs here](https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd)
            forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
            accountName: '', // [Android] specifies an account name on the device that should be used
            iosClientId: '126096465796-j8u2rln4bg120cssev13v90etn6d5e7r.apps.googleusercontent.com', // [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
            googleServicePlistPath: '', // [iOS] optional, if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
        });
    }

    initialOpenManage(){
        AsyncStorage.getItem('uid').then((value) => {
            if(value){
                this.setState({ user_id: value });
                firebase.notifications().getInitialNotification().then((notificationOpen) => {
                    if (notificationOpen) {
                        const notif = notificationOpen.notification;
                        if(notif._data && notif._data.pid){
                            this.pushNonLiveApp(notif._data.pid, value, false);
                        }else{
                            this.sendToDashboard(value);
                        }
                    }else{
                        this.sendToDashboard(value);
                    }     
                }).catch((err) => {
                    Wrestlefeed.hideSplash();
                })
            }else{
                Wrestlefeed.hideSplash();
            }
        }).catch((err) => {
            Wrestlefeed.hideSplash();
        })
    }

    sendHome() {
        AsyncStorage.getItem('uid').then((value) => {
            if(value){
                this.sendToDashboard(value);
                this.setState({ user_id: value });
            }else{
                this.sendToDashboard(value);
            }
        }).catch((err) => {
            this.sendToDashboard(value);
        })
    }

    pushNonLiveApp(pid, userId, splash_show){
        axios.post(`${config.base_api}/push_notify.php`, { "last_id": pid, "user_id": userId }).then((resPostData) => {
            let { all_post, user } = resPostData.data;
            if(all_post){
                this.sendToDashboardPush(userId, all_post, user)
            }else{
                this.sendToDashboard(userId);
            }
        }).catch((err) => {
            Wrestlefeed.hideSplash();
        })
    }

    sendToDashboard(uid) {
        axios.post(config.base_api+"/feed_initial.php", { tab_name: "all", last_id: 0, user_id: uid }).then((resAllPost) => {
            let { all_post, user } = resAllPost.data
            this.setState({ loading: false, loading_apple: false, loading_google: false })
            let resetAction = StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'Dashboard', params:{ userId: uid, post: all_post, user, push: false } }),
                ],
            });
            this.props.navigation.dispatch(resetAction);
        }).catch((err) => {
            Alert.alert("The server is taking too long to respond OR something is wrong with your internet connection. Please try again later.")
        })
    }

    sendToDashboardPush(uid, all_post, user) {
        let resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Dashboard', params:{ userId: uid, post: all_post, user, push: true } }),
            ],
        });
        this.props.navigation.dispatch(resetAction);
    }

    checkLogin(user) {
        const loginUrl = `${config.base_api}/auth.php?cmd=fblogin&email=${user.email}&name=${user.name}&fbid=${user.id}&local=''&timezone=''&age=''`;
        axios.get(loginUrl).then(response => {
            const { fblogin } = response.data;
            let { uid } = fblogin
            if(uid){
                AsyncStorage.setItem('uid', uid.toString());
                this.sendToDashboard(uid);
            }else{
                ToastAndroid.show("Please login using email", 2000);
                this.setState({ loading: false });
            }
        }).catch((err) => {
            this.setState({ loading: false });
        })
    }

    onFbLogin = () => {
        LoginManager.logInWithPermissions(["public_profile", 'email']).then(
            (result) => {
                if (result.isCancelled) {
                    Alert.alert("Login cancelled");
                } else {
                    this.setState({ loading: true });
                    AccessToken.getCurrentAccessToken().then((data) => {
                        const { accessToken } = data;
                        axios.get('https://graph.facebook.com/v3.1/me?fields=email,name,picture&access_token=' + accessToken).then((resFB) => {
                            this.checkLogin(resFB.data);
                        }).catch((err) => {
                            this.setState({ loading: false })
                        })
                    })
                }
            },
            (error) => {
                //   console.log("Login fail with error: " + error);
                this.setState({ loading: false })
            }
        );
    }

    async onAppleLogin() {
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: AppleAuthRequestOperation.LOGIN,
            requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
        });
        if(appleAuthRequestResponse){
            let { authorizationCode, email, fullName, identityToken, nonce, user } = appleAuthRequestResponse;
            let apple_data = {
                authorizationCode,
                email,
                display_name: fullName.givenName,
                identityToken,
                nonce,
                user
            }
            this.setState({ loading_apple: true });
            axios.post(config.base_api + 'apple_auth.php', apple_data).then((resApple) => {
                let { data } = resApple;
                if(data.status){
                    AsyncStorage.setItem('uid', data.uid.toString());
                    this.sendToDashboard(data.uid);
                }else{
                    Alert.alert(data.msg);
                    this.setState({ loading_apple: false });
                }
            }).catch((err) => {
                Alert.alert("Failed to login")
                this.setState({ loading_apple: false });
            })
        }
          // get current authentication state for user
          // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
        const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
        
          // use credentialState response to ensure the user is authenticated
        // if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
        //     // user is authenticated
        // }
    }

    GoogleSignIn = async () => {
        try {
            this.setState({ loading_google: true })
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const { user } = userInfo;
            const loginUrl = `${config.base_api}auth.php?cmd=google&email=${user.email}&name=${user.name}&fbid=${user.id}&picture=${user.photo.slice(8)}`;
            axios.get(loginUrl).then(response => {
                const { uid } = response.data;
                if(uid){
                    AsyncStorage.setItem('uid', uid.toString());
                    this.sendToDashboard(uid);
                }else{
                    ToastAndroid.show("Please login using email", 2000);
                    this.setState({ loading: false });
                }
            }).catch(err => {
                this.setState({ loading_google: false })
            })
        } catch (error) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
          } else if (error.code === statusCodes.IN_PROGRESS) {
            // operation (e.g. sign in) is in progress already
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
          } else {
            // some other error happened
          }
          this.setState({ loading_google: false })
        }
    };

    render() {
        let { navigation } = this.props
        let { loading, loading_apple, loading_google } = this.state
        return(
            <View>
                <StatusBar hidden />
                <ImageBackground resizeMode="cover" source={{ uri: 'bg_welcome' }} style={{ width, height: bg_height }} >
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={{ flex: config.ios ? 4 : 1 }}></View>
                        <View style={{ flex: config.ios ? 6 : 1, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}></View>
                            <View style={{ flex: 8 }}>
                                {
                                    config.ios && systemVersion > 13 ?
                                    <View style={{ paddingTop: 16 }}>
                                        {
                                            !loading_apple ?
                                            <AppleButton
                                                buttonStyle={AppleButton.Style.WHITE}
                                                buttonType={AppleButton.Type.SIGN_IN}
                                                style={{ width: width-140, height: 50, borderRadius: 2 }}
                                                onPress={() => this.onAppleLogin()}
                                            />
                                            : <ActivityIndicator size="large" color="#b21a1a" />
                                        }
                                        
                                    </View>
                                    : null
                                }
                                <View style={{ paddingTop: 16 }} >
                                    {
                                        ! loading_google ? 
                                            <TouchableOpacity 
                                                onPress={this.GoogleSignIn}
                                                style={{ flexDirection: 'row', backgroundColor: 'white', alignItems: 'center', paddingBottom: 12, paddingTop: 12, borderRadius: 4 }}
                                            >
                                                <View style={{ flex: 3, alignItems: 'center' }} >
                                                    <Image source={{ uri: 'google_logo' }} style={{ width: 24, height: 24 }} />
                                                </View>
                                                <View style={{ flex: 8 }} >
                                                    <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 18 }} >Sign In with Google</Text>
                                                </View>
                                            </TouchableOpacity>
                                        : <ActivityIndicator size="large" color="#b21a1a" />
                                    }
                                 </View>
                                 <View style={{ paddingTop: 16 }}>
                                    {
                                        !loading ?
                                        <TouchableOpacity 
                                            onPress={this.onFbLogin}
                                            style={{ flexDirection: 'row', backgroundColor: '#1778f2', alignItems: 'center', paddingBottom: 12, paddingTop: 12, borderRadius: 4 }}
                                        >
                                            <View style={{ flex: 3, alignItems: 'center' }} >
                                                <Image source={{ uri: 'fb_logo' }} style={{ width: 24, height: 24, borderRadius: 12 }} />
                                            </View>
                                            <View style={{ flex: 8 }} >
                                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }} >Login with Facebook</Text>
                                            </View>
                                        </TouchableOpacity>
                                        : 
                                        <ActivityIndicator size="large" color="#b21a1a" />
                                    }
                                </View>
                                <View style={{ paddingTop: 16 }} >
                                    <TouchableOpacity 
                                        onPress={() => navigation.navigate('Login')}
                                        style={{ flexDirection: 'row', backgroundColor: '#DC483B', alignItems: 'center', paddingBottom: 12, paddingTop: 12, borderRadius: 4 }}
                                    >
                                        <View style={{ flex: 3, alignItems: 'center' }} >
                                            <Image source={{ uri: 'email_logo' }} style={{ width: 28, height: 24, borderRadius: 12 }} />
                                        </View>
                                        <View style={{ flex: 8 }} >
                                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }} >Login with Email</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ paddingTop: 16 }}></View>
                            </View>
                            <View style={{ flex: 2 }}></View>
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            </View>
        )
    }
}

export default Welcome;