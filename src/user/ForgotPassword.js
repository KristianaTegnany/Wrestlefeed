import React, { useState, useEffect, Component } from 'react';
import { View, Text, SafeAreaView, Image, TextInput, Dimensions, ImageBackground, KeyboardAvoidingView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { UserButton, BackWithText } from '../common/Component';
import axios from 'axios';
import config from '../config';
import { allStyle } from '../allStyles';

let { width, height } = Dimensions.get('screen');
let { inputView, inputViewError, input } = allStyle
let bg_height = config.ios ? height : height

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

class ForgotPassword extends Component {
    state = {
        step: 1,
        email: '',
        opt: '',
        password: '',
        confirm_password: '',
        loading: false,
        emailError: false,
        otpError: false,
        passwordError: false,
        forgotError: ''
    }

    renderSendEmail() {
        let { emailError } = this.state;
        return(
            <View style={emailError ? inputViewError: inputView} >
                <TextInput 
                    placeholder="email@example.com"
                    style={input}
                    placeholderTextColor={emailError ? 'red' : 'white'}
                    onChangeText={(text) => { this.setState({ email: text, emailError: false, forgotError: '' }) }}
                />
            </View>
        )
    }

    renderVerifyOTP() {
        let { otpError } = this.state;
        return(
            <View>
                <View style={otpError ? inputViewError: inputView} >
                    <TextInput 
                        placeholder="OTP"
                        style={input}
                        placeholderTextColor={otpError ? 'red' : 'white'}
                        onChangeText={(text) => { this.setState({ opt: text, otpError: false }) }}
                    />
                </View>
                <Text style={{ color: 'white', fontStyle: 'italic', paddingTop: 4 }}>Please check you spam folder also</Text>
            </View>
            
        )
    }

    renderChangePassword() {
        let { passwordError, password, confirm_password } = this.state
        return(
            <View>
                <View style={passwordError ? inputViewError: inputView} >
                    <TextInput 
                        placeholder="Password"
                        style={input}
                        secureTextEntry
                        value={password}
                        placeholderTextColor={passwordError ? 'red' : 'white'}
                        onChangeText={(text) => { this.setState({ password: text, passwordError: false, forgotError: '' }) }}
                    />
                </View>
                <View style={{ paddingTop: 8 }}></View>
                <View style={passwordError ? inputViewError: inputView} >
                    <TextInput 
                        placeholder="Password again"
                        style={input}
                        secureTextEntry
                        value={confirm_password}
                        placeholderTextColor={passwordError ? 'red' : 'white'}
                        onChangeText={(text) => { this.setState({ confirm_password: text, passwordError: false, forgotError: '' }) }}
                    />
                </View>
            </View>
        )
    }

    onSubmit() {
        let { step, email, opt, password, confirm_password } = this.state;
        const email_check = validateEmail(email);
        let { navigation } = this.props
        let url = ''
        if(step == 1){
            if(!email_check){
                this.setState({ emailError: true })
            }else{
                url = `/auth.php?cmd=forgot&email=${email}`;
            }
        } else if( step == 2){
            if(!opt){
                this.setState({ otpError: true })
            }else{
                url = `/auth.php?cmd=forgotCode&code=${opt}&email=${email}`;
            }
        }else if( step == 3 ){
            if(!password){
                this.setState({ passwordError: true });
            }else if(password != confirm_password){
                this.setState({ passwordError: true, forgotError: 'Both password does not match' });
            }else{
                url = `/auth.php?cmd=passChange&code=${opt}&email=${email}&pass=${confirm_password}`;
            }
        }
        if(url){
            this.setState({ loading: true })
            axios.get(config.base_api+url).then((resForgot) => {
                let { Forgot, forgotCode } = resForgot.data;
                if(Forgot.status == "false"){
                    this.setState({ forgotError: Forgot.msg, loading: false });
                } else{
                    if(step == 3){
                        this.setState({ loading: false });
                        navigation.goBack()
                    }else{
                        this.setState({ step: step+1, loading: false });
                    }
                }
            }).catch((err) => {
                this.setState({ loading: false })
            })
        }
    }

    render() {
        let { step, loading, forgotError } = this.state;
        return(
            <View style={{ flex: 1 }}>
                <KeyboardAwareScrollView style={{ flex: 1 }}>
                <ImageBackground resizeMode="cover" source={{ uri: 'bg_welcome' }} style={{ width, height: bg_height }} >
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={{ flex: 3 }}>
                            <BackWithText text="Login" onPress={() => this.props.navigation.goBack()} />
                        </View>
                        <View style={{ flex: 2, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}></View>
                            <View style={{ flex: 8 }}>
                                <View style={{ paddingBottom: 16 }}>
                                    {
                                        step == 1?
                                        this.renderSendEmail()
                                        : step == 2 ?
                                        this.renderVerifyOTP()
                                        : this.renderChangePassword()
                                    }
                                </View>
                                <View>
                                    {
                                        forgotError ? 
                                        <View style={{ paddingBottom: 8 }}>
                                            <Text style={{ color: 'red', fontSize: 16, fontWeight: '800' }}>{forgotError}</Text>
                                        </View>
                                        : null
                                    }
                                </View>
                                <UserButton 
                                    name="Reset Password" 
                                    onPress={() => this.onSubmit()}
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

export default ForgotPassword;