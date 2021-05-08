import React, { useState, useEffect, Component } from 'react';
import { View, Text, SafeAreaView, Alert, TextInput, Dimensions, ImageBackground, KeyboardAvoidingView } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-community/async-storage'
import axios from 'axios';

import { UserButton, BackWithText } from '../common/Component';
import { allStyle } from '../allStyles';
import config from '../config';


let { width, height } = Dimensions.get('screen');
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
let bg_height = config.ios ? height : height

class SignUp extends Component {
    state = {
        fullname: '',
        email: '',
        password: '',
        emailError: false,
        fullnameError: false,
        passwordError: false,
        signupError: '',
        loading: false
    }

    storeAndSend(uid) {
        AsyncStorage.setItem('uid', uid.toString());
        axios.post(config.base_api + 'feed_initial.php', { tab_name: "all", last_id: 0, user_id: uid }).then((resAllPost) => {
            let { all_post, user } = resAllPost.data
            let resetAction = StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'Dashboard', params:{ userId: uid, post: all_post, user } }),
                ],
            });
            this.setState({ loading: false });
            this.props.navigation.dispatch(resetAction);
        }).catch((err) => {
            Alert.alert("The server is taking too long to respond OR something is wrong with your internet connection. Please try again later.")
        })
    }

    onSignUp() {
        let { fullname, email, password } = this.state;
        const trimmed_email = email.trim();
        const email_check = validateEmail(trimmed_email);
        if(!fullname){
            this.setState({ fullnameError: true });
        }else if(!email_check){
            this.setState({ emailError: true });
        }else if(!password){
            this.setState({ passwordError: true });
        }else{
            this.setState({ loading: true });
            const url = `${config.base_api}/auth.php?cmd=signup&email=${trimmed_email}&pass=${password}&name=${fullname}`;
            axios.get(url).then((resSignUp) => {
                let { SignUp } = resSignUp.data;
                if(SignUp.status == "false"){
                    this.setState({ signupError: SignUp.msg, loading: false });
                }else{
                    this.storeAndSend(SignUp.uid);
                }
            }).catch((err) => {
                this.setState({ loading: false });
            })
        }
    }

    render() {
        let { inputView, inputViewError, input } = allStyle
        let { emailError, fullnameError, passwordError, loading, signupError } = this.state;
        return(
            <View style={{ flex: 1 }}>
                <KeyboardAwareScrollView style={{ flex: 1 }}>
                <ImageBackground resizeMode="cover" source={{ uri: 'bg_welcome' }} style={{ width, height: bg_height }} >
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={{ flex: config.ios ? 8 : 4 }}>
                            <BackWithText text="Login" onPress={() => this.props.navigation.goBack()} />
                        </View>
                        <View style={{ flex: 6, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}></View>
                            <View style={{ flex: 8 }}>
                                <View style={{ paddingBottom: 16 }}>
                                    <View style={fullnameError ? inputViewError : inputView} >
                                        <TextInput 
                                            placeholder="Enter your name"
                                            style={input}
                                            placeholderTextColor={fullnameError ? 'red' : 'white'}
                                            autoCorrect={false}
                                            onChangeText={(text) => { this.setState({ fullname: text, fullnameError: false, signupError: '' }) }}
                                        />
                                    </View>
                                </View>
                                <View style={{ paddingBottom: 16 }}>
                                    <View style={emailError ? inputViewError : inputView} >
                                        <TextInput 
                                            placeholder="Enter your email"
                                            style={input}
                                            autoCorrect={false}
                                            placeholderTextColor={emailError ? 'red' : 'white'}
                                            onChangeText={(text) => { this.setState({ email: text, emailError: false, signupError: '' }) }}
                                        />
                                    </View>
                                </View>
                                <View style={{ paddingBottom: 16 }}>
                                    <View style={passwordError ? inputViewError : inputView}>
                                        <TextInput 
                                            secureTextEntry
                                            placeholder="Create a password"
                                            style={input}
                                            autoCorrect={false}
                                            textContentType="password"
                                            placeholderTextColor={passwordError ? 'red' : 'white'}
                                            onChangeText={(text) => { this.setState({ password: text, passwordError: false, signupError: '' }) }}
                                        />
                                    </View>
                                </View>
                                <View>
                                    {
                                        signupError ? 
                                        <View style={{ paddingBottom: 8 }}>
                                            <Text style={{ color: 'red', fontSize: 16, fontWeight: '800' }}>{signupError}</Text>
                                        </View>
                                        : null
                                    }
                                </View>
                                
                                <UserButton 
                                    name="Sign Up" 
                                    onPress={() => this.onSignUp()}
                                    btnColor="#7B0D05"
                                    loading={loading}
                                />
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

const styles = {
    inputView: {
        borderWidth: 1, 
        borderColor: 'white', 
        paddingTop: 12, 
        paddingBottom: 12, 
        paddingLeft: 12, 
        borderRadius: 2 
    }
}

export default SignUp;