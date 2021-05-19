import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import config from '../config';

let notch = DeviceInfo.hasNotch();
let tab_change = false;

const TabItem = (props) => {
    let { name, status, onTabPress } = props;
    let { tabBG, activeTab, inActiveTab } = styles
    return(
        <TouchableOpacity onPress={onTabPress} style={{ paddingLeft: 8, paddingRight: 8, }}>
            <View style={[styles.tabBG, status ? { backgroundColor: 'white' }: { backgroundColor: '#b21a1a' }]}>
                <Text style={status ? activeTab: inActiveTab}>{name}</Text>
            </View>
        </TouchableOpacity>
    )
}

class AllTab extends Component{
    state = {
        tabList: [
            { name: "NEWS", status: true },
            { name: "MEMES", status: false },
            { name: "DIVAS", status: false },
            { name: "VIDEOS", status: false },
            { name: "OLD SCHOOL", status: false },
            // { name: "RAW", status: false },
            // { name: "SMACKDOWN", status: false },
            // { name: "NXT", status: false },
            { name: "AEW", status: false },
        ],
        hideMenu: false
    }

    onTabPress(tab, index){
        if(!tab_change){
            tab_change = true;
            let { tabList } = this.state;
            tabList.map((t, i) => {
                tabList[i].status = false
            })
            tabList[index].status = true
            this.setState({ tabList }, () => {
                setTimeout(() => {
                    tab_change = false
                }, 100)
            });
            this.props.onTabPress(tab)
        }
    }

    onScrollTab(contentOffset) {
        let { hideMenu } = this.state;
        if(contentOffset.x > 1){
            if(!hideMenu){
                this.setState({ hideMenu: true })
            }
        }
        if(contentOffset.x < 1){
            if(hideMenu){
                this.setState({ hideMenu: false })
            }
        }
    }

    render(){
        let { tabList, hideMenu } = this.state;
        let { onMenuPress } = this.props
        return(
            <View style={{ paddingLeft: 8, paddingTop: config.ios ? notch ? 24 : 0 : 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    {
                        hideMenu ?
                        <TouchableOpacity onPress={onMenuPress} style={{ justifyContent: 'center', paddingBottom: 16, paddingRight: 8 }}>
                            <Image source={{ uri: 'menu_square_logo' }} style={{ width: 30, height: 30 }} />
                        </TouchableOpacity>
                        : null
                    }
                    <ScrollView 
                        horizontal 
                        style={{ paddingBottom: 16 }} 
                        showsHorizontalScrollIndicator={false} 
                        onScroll={(e) => this.onScrollTab(e.nativeEvent.contentOffset)}
                    >
                        {
                            !hideMenu ?
                            <TouchableOpacity onPress={onMenuPress} style={{ justifyContent: 'center' }}>
                                <Image source={{ uri: 'logo_menu_shadow' }} style={{ width: 145, height: 30 }}  />
                            </TouchableOpacity>
                            : null
                        }
                        {
                            tabList.map((tab, key) => {
                                return(
                                    <TabItem 
                                        name={tab.name} 
                                        key={key} 
                                        status={tab.status} 
                                        onTabPress={() => this.onTabPress(tab, key)} 
                                    />
                                )
                            })
                        }
                        <View style={{ paddingLeft: 32 }}></View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const styles = {
    activeTab: {
        color: '#b21a1a', 
        fontSize: 18, 
        fontWeight: '600',
        fontFamily: 'Exo-SemiBold'
    },
    inActiveTab: {
        color: 'white', 
        fontSize: 18, 
        fontWeight: '600',
        fontFamily: 'Exo-SemiBold'
    },
    tabBG: { 
        paddingBottom: 4, 
        paddingTop: 4, 
        paddingLeft: 12, 
        paddingRight: 12, 
        borderRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 1,
    }
}

export default AllTab;