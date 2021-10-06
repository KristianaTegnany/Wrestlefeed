import React, { Component } from 'react';
import { View, Text, SafeAreaView, TextInput, Dimensions, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios'
import { StackActions, NavigationActions } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import config from '../config';
import { allStyle } from '../allStyles';

import { UserButton, BackWithText } from '../common/Component';
import { tracker } from '../tracker';


let { width, height } = Dimensions.get('screen');
let bg_height = config.ios ? height : height
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

class Login extends Component {
    state = {
        email: '',
        password: '',
        emailError: false,
        passwordError: false,
        loginError: '',
        loading: false
    }

    storeAndSend(uid) {
        AsyncStorage.setItem('uid', uid.toString());
        axios.post(config.base_api + 'feed_initial.php', { tab_name: "all", last_id: 0, user_id: uid }).then((resAllPost) => {
            this.setState({ loading: false })
            let { all_post, user } = resAllPost.data
            all_post = all_post.map(post => {
                if(post.name === "NEWS")
                  return {name: post.name, data: post.data}
                else return post
            })
            let resetAction = StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'Dashboard', params:{ userId: uid, post: all_post, user } }),
                ],
            });
            this.props.navigation.dispatch(resetAction);
        }).catch((err) => {
            Alert.alert("The server is taking too long to respond OR something is wrong with your internet connection. Please try again later.")
        })
    }

    onLogin() {
        let { email, password } = this.state;
        const trimmed_email = email.trim();
        const email_check = validateEmail(trimmed_email);
        if(!email_check){
            this.setState({ emailError: true })
        }else if(!password){
            this.setState({ passwordError: true })
        }else{
            this.setState({ loading: true });
            const url = `${config.base_api}/auth.php?cmd=login&email=${trimmed_email}&pass=${password}`;
            axios.get(url).then((resLogin) => {
                let { Login } = resLogin.data;
                if(Login.msg == "Success"){
                    this.storeAndSend(Login.uid);
                    tracker.setUser(Login.uid.toString());
                }else{
                    this.setState({ loginError: 'Email and password mismatch', loading: false })
                }
            }).catch((err) => {
                this.setState({ loading: false });
            })
        }
    }

    render() {
        let { navigation } = this.props
        let { emailError, passwordError, loginError, loading } = this.state;
        let { inputView, inputViewError, input } = allStyle
        return(
            <View style={{ flex: 1, flexDirection: 'column' }}>
                <KeyboardAwareScrollView style={{ flex: 1 }}>
                    <ImageBackground resizeMode="cover" source={{ uri: 'bg_welcome' }} style={{ width, height: bg_height }} >
                        <SafeAreaView style={{ flex: 1 }}>
                            <View style={{ flex: config.ios ? 7 : 5 }}>
                                <BackWithText text="Home" onPress={() => this.props.navigation.goBack()} />
                            </View>
                            <View style={{ flex: 6, flexDirection: 'row' }}>
                                <View style={{ flex: 2 }}></View>
                                <View style={{ flex: 8 }}>
                                    <View style={{ paddingBottom: 16 }}>
                                        <View style={emailError ? inputViewError : inputView} >
                                            <TextInput 
                                                placeholder="Email"
                                                style={input}
                                                placeholderTextColor={emailError ? 'red' : 'white'}
                                                onChangeText={(text) => { this.setState({ email: text, emailError: false, loginError: '' }) }}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ paddingBottom: 16 }}>
                                        <View style={passwordError ? inputViewError : inputView}>
                                            <TextInput 
                                                placeholder="Password"
                                                style={input}
                                                secureTextEntry
                                                textContentType="password"
                                                placeholderTextColor={passwordError ? 'red' : 'white'}
                                                onChangeText={(text) => { this.setState({ password: text, passwordError: false, loginError: '' }) }}
                                            />
                                        </View>
                                    </View>
                                    <View>
                                        {
                                            loginError ? 
                                            <View style={{ paddingBottom: 8 }}>
                                                <Text style={{ color: 'red', fontSize: 16, fontWeight: '800' }}>{loginError}</Text>
                                            </View>
                                            : null
                                        }
                                    </View>
                                    <UserButton 
                                        name="Log me in" 
                                        onPress={() => this.onLogin()}
                                        btnColor="#7B0D05"
                                        loading={loading}
                                    />
                                    <View style={{ paddingTop: 16, flexDirection: 'row' }}>
                                        <View style={{ flex: 4 }} >
                                            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                                                <Text style={{ color:'white', fontWeight: 'bold', fontSize: 16 }}> New User?</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flex: 6, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                                                <Text style={{ color:'white', fontWeight: 'bold', fontSize: 16 }}> Forgot Password?</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ flex: 2 }}></View>
                            </View>
                        </SafeAreaView>
                    </ImageBackground>
                </KeyboardAwareScrollView>
            </View>
        )
    }
}

export default Login;