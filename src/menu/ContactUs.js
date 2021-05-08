import React, { Component } from 'react';
import { View, Text, TextInput, SafeAreaView, Switch, Alert, CheckBox, KeyboardAvoidingView, StatusBar } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import axios from 'axios';

import config from '../config';
import { UserButton, Navbar } from '../common/Component';


class ContactUs extends Component {
    state = {
        name: '',
        email: '',
        message: '',
        subject_list: [
            { name: 'General Query', status: false },
            { name: 'Advertise with us', status: false },
            { name: 'Technical Issue / Report a bug', status: false },
            { name: 'Other', status: false }
        ],
        loading_contact_us: false,
        success_msg: ''
    }

    componentDidMount() {
        let params = this.props.navigation.state.params;
        let { ID, user_email, display_name } = params;
        this.setState({ name: display_name, email: user_email });
    }

    subjectChange(l, key) {
        let { subject_list } = this.state;
        subject_list.map((d, index) => {
            subject_list[index].status = false
        })
        subject_list[key].status = true;
        this.setState({ subject_list })
    }

    onSubmit() {
        let { name, email, message, subject_list } = this.state;
        let subject_option = '';
        subject_list.map((s) => {
            if(s.status){
                subject_option = s.name;
            }
        });
        let params = this.props.navigation.state.params;
        let { ID } = params;

        if(!name) {
            Alert.alert("Please enter name");
        }else if(!email){
            Alert.alert("Please enter email");
        }else if(!subject_option){
            Alert.alert("Please choose an option");
        }else if(!message){
            Alert.alert("Please write your message");
        }else{
            this.setState({ loading_contact_us: true })
            let deviceInfo = '';
            if(config.ios){
                const brand = DeviceInfo.getBrand();
                const buildNumber = DeviceInfo.getBuildNumber();
                const carrier = DeviceInfo.getCarrier();
                const model = DeviceInfo.getModel();
                deviceInfo = `&brand=${brand}&buildNumber=${buildNumber}&carrier=${carrier}&model=${model}`;
            }else{
                const brand = DeviceInfo.getBrand();
                const buildNumber = DeviceInfo.getBuildNumber();
                const carrier = DeviceInfo.getCarrier();
                const deviceCountry = ""
                const model = DeviceInfo.getModel();
                const timezone = "";
                deviceInfo = `&brand=${brand}&buildNumber=${buildNumber}&carrier=${carrier}&country=${deviceCountry}&model=${model}&timezone=${timezone}`;
            }
            const url = `${config.base_api}/contact.php?action=insert&uid=${ID}&name=${name}&email=${email}&message=${message}&subject=${subject_option}` + deviceInfo;
            axios.get(url).then((resContact) => {
                let { data } = resContact;
                this.setState({ loading_contact_us: false, success_msg: data.msg });
            }).catch((err) => {
                this.setState({ loading_contact_us: false });
            })
        }
    }
 
    goBackHome(){
        this.props.navigation.goBack()
    }

    render() {
        let { subject_list, loading_contact_us, email, name, success_msg } = this.state
        return(
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <StatusBar barStyle="light-content" />
                <SafeAreaView style={{ flex: 1 }}>
                    <Navbar leftPress={() => this.goBackHome()} title="Contact Us" />
                    <KeyboardAwareScrollView style={{ flex: 1 }}>
                    <View style={{ paddingTop: 32, paddingLeft: 16, paddingRight: 16 }}>
                        <View style={{ flexDirection: 'row', }}>
                            <View style={{ flex: 2, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16 }}>Name</Text>
                            </View>
                            <View style={{ flex: 8, borderBottomColor: 'red', borderBottomWidth: 1, paddingBottom: 8 }}>
                                <TextInput 
                                    style={config.ios ? { color: 'black' } : { }}
                                    placeholder="Please enter your name"
                                    onChangeText={(text) => this.setState({ name: text })}
                                    value={name}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', paddingTop: 24 }}>
                            <View style={{ flex: 2, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16 }}>Email</Text>
                            </View>
                            <View style={{ flex: 8, borderBottomColor: 'red', borderBottomWidth: 1, paddingBottom: 8 }}>
                                <TextInput 
                                    style={config.ios ? { color: 'black' } : { }}
                                    placeholder="Please enter your email"
                                    onChangeText={(text) => this.setState({ email: text })}
                                    value={email}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', paddingTop: 24 }}>
                            <View style={{ flex: 2, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16 }}>Subject</Text>
                            </View>
                            <View style={{ flex: 8, paddingBottom: 8 }}>
                                {
                                    subject_list.map((l, key) => {
                                        return(
                                            <View key={key} style={{ flexDirection: 'row', paddingTop: 6 }}>
                                                <View>
                                                    {
                                                        config.ios ?
                                                        <Switch value={l.status} onValueChange={() => this.subjectChange(l, key)} />
                                                        : <CheckBox value={l.status} onValueChange={() => this.subjectChange(l, key)} />
                                                    }
                                                </View>
                                                <View style={{ justifyContent: 'center', paddingLeft: 8 }}>
                                                    <Text style={{ fontSize: 16 }}>{l.name}</Text>
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', paddingTop: 24 }}>
                            <View style={{ flex: 2, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16 }}>Message</Text>
                            </View>
                            <View style={{ flex: 8, borderBottomColor: 'red', borderBottomWidth: 1, paddingBottom: 8 }}>
                                <TextInput 
                                    placeholder="Write your message"
                                    multiline={true}
                                    numberOfLines={3}
                                    onChangeText={(text) => this.setState({ message: text })}
                                />
                            </View>
                        </View>
                        <View style={{ paddingTop: 48, justifyContent: 'center', paddingLeft: 64, paddingRight: 64 }}>
                            {
                                success_msg ?
                                <View>
                                    <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', color: '#b21a1a' }}>{success_msg}</Text>
                                </View>
                                :
                                <UserButton 
                                    name="Send" 
                                    onPress={() => this.onSubmit()}
                                    btnColor="#7B0D05"
                                    loading_contact_us={loading_contact_us}
                                />
                            }
                        </View>
                    </View>
                    </KeyboardAwareScrollView>
                </SafeAreaView>
            </View>
        )
    }
}

export default ContactUs;