import React, { Component } from 'react';
import { View, Text, Dimensions, Image, TouchableOpacity, StatusBar, Platform} from 'react-native';
import BottomSheet from 'reanimated-bottom-sheet'
import { ScrollView } from 'react-native-gesture-handler';
import { AppEventsLogger } from 'react-native-fbsdk';
import Share from "react-native-share";
import * as entities from 'entities'
import DeviceInfo from 'react-native-device-info';

import Wrestlefeed from '../common/Wrestlefeed';
import config from '../config';
import { BridPlayer, Instagram, StoryAdvanceText, StoryEM, StoryImage, StoryNavbarLogo, StoryText, Twitter, YouTubeVideo } from '../common/StoryComponent';
import { allStyle } from '../allStyles';
import { tracker } from '../tracker';
import AsyncStorage from '@react-native-community/async-storage';

let { height } = Dimensions.get('window');
let fullHeight = height;
let notch = DeviceInfo.hasNotch();

class StoryView extends Component{
    state = {
        post_url: '',
        post_content: '',
        post_title: '',
        webheight: 4000,
        expand: false,
        load_progress: 0.1,
        hide_progress: false,
        dark_mode: true,
        isNextStory: true,
        isPrevStory: true,
        user_id: null
    }
    storyScroll = React.createRef()
    bottomSheetRef = React.createRef()
    
    componentDidMount() {
        AsyncStorage.getItem('uid').then((value) => {
            if (value) {
                this.setState({user_id: value})
                tracker.trackEvent('Views', 'Story')
            }
        })
    }

    renderContent = (props) => {
        let { post_content, dark_mode, isNextStory, isPrevStory, post_title } = this.state;
        let post_data = [];
        if(post_content){
            post_data = Wrestlefeed.parseContent(post_content);
        }
        return(
            <View style={{ height: fullHeight, backgroundColor: dark_mode ? '#141414' : 'white', paddingBottom: 80 }}>
                    
                <ScrollView ref={this.storyScroll} style={{ flex: 1, padding: 16, paddingTop: 0 }}>
                    <View style={{ paddingBottom: 8, paddingTop: 12 }}>
                        <Text style={{ fontSize: 24, fontFamily: 'RussoOne-Regular', color: dark_mode ? 'white' : 'black' }} >{entities.decodeHTML(post_title)}</Text>
                    </View>
                    <View>
                    {
                        post_data.map((p_data, p_index) => {
                            return(
                                <View key={p_index} style={{ paddingTop: 6, paddingBottom: 8 }}>
                                    {
                                        p_data.type == "text" ?
                                            <StoryText text={p_data.content} dark_mode={dark_mode} />
                                        : p_data.type == "brid" ?
                                            <BridPlayer player_id={p_data.player_id} video_id={p_data.video_id} />
                                        : p_data.type == "twitter" ?
                                            <Twitter tweet_id={p_data.tweet_id} />
                                        : p_data.type == "youtube" ?
                                            <YouTubeVideo youtube_id={p_data.youtube_id} />
                                        : p_data.type == "instagram" ?
                                            <Instagram content={p_data.content} />
                                        : p_data.type == "image" ?
                                            <StoryImage img_url={p_data.img_url} img_height={Number(p_data.height)} img_width={Number(p_data.width)} />
                                        : p_data.type == "em" ?
                                            <StoryEM text={p_data.text} dark_mode={dark_mode} />
                                        : p_data.type == "advanced_text" ?
                                            <StoryAdvanceText final_text={p_data.final_text} dark_mode={dark_mode} is_em={p_data.is_em} />
                                        : null
                                    }
                                </View>
                            )
                        })
                    }
                    </View>
                    <View style={{ paddingTop: 32, paddingBottom: 100 }}>
                        <View style={{ flexDirection: 'row' }}>
                            {
                                isPrevStory ?
                                <TouchableOpacity 
                                    style={[allStyle.NextPrevBtn, {backgroundColor: dark_mode ? 'white' : '#b21a1a'}]} 
                                    onPress={() => this.onPrevNext("prev")} 
                                >
                                    <Text style={{ color: dark_mode ? 'black' : 'white', fontSize: 18, fontWeight: 'bold' }}>Prev</Text>
                                </TouchableOpacity>
                                : <View style={{ flex: 2 }} ></View>
                            }
                            <View style={{ flex: 1 }}></View>
                            {
                                isNextStory ?
                                <TouchableOpacity 
                                    style={[allStyle.NextPrevBtn, {backgroundColor: dark_mode ? 'white' : '#b21a1a'}]} 
                                    onPress={() => this.onPrevNext("next")}
                                >
                                    <Text style={{ color: dark_mode ? 'black' : 'white', fontSize: 18, fontWeight: 'bold' }}>Next</Text>
                                </TouchableOpacity>
                                : <View style={{ flex: 2 }} ></View>
                            }
                        </View>
                    </View>
                    { config.ios ? <Text style={{ color: dark_mode ? 'black' : 'white', paddingTop: 16 }}>.</Text> : null }
                </ScrollView>
            </View>
        )
    }

    renderStoryLoading = () => {
        return(
            <View style={{ paddingTop: height/2-70 }}>
                <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '700' }}>Loading..</Text>
            </View>
        )
    }

    renderHeader = () => {
        let { dark_mode, post_url } = this.state
        return(
            <View style={{ backgroundColor: dark_mode ? 'black' : post_url ? 'white' : 'black', borderTopLeftRadius: 4, borderTopRightRadius: 4, 
            padding: 16, paddingTop: config.ios ? notch ? 48 : 16 : 16, top: 1 }}>
                <View style={{ flexDirection: 'row' }}>
                    <StoryNavbarLogo dark_mode={dark_mode} />
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <TouchableOpacity onPress={() => this.onSharePost()}>
                            <Image source={{ uri: dark_mode ? 'share_night_mode' : 'share_day_mode' }} style={{ width: 28, height: 28 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <TouchableOpacity onPress={() => this.onDarkToggle()}>
                            <Image source={{ uri: dark_mode ? 'day_mode' : 'night_mode' }} style={{ width: 28, height: 28 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <TouchableOpacity onPress={() => this.closeStory()}>
                            <Image source={{ uri: dark_mode ? 'ic_close_story_white' : 'ic_close_story' }} style={{ width: 24, height: 24 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    onPrevNext(type) {
        this.setState({ post_content: '' })
        this.props.onPrevNext(type);
    }

    handlePrevNext = (post_content, post_title, isNextStory, isPrevStory) => {
        this.setState({ post_content, post_title, isNextStory, isPrevStory });
        this.storyScroll.current.scrollTo({ y: 0, animated: false })
    }

    onSharePost = () => {
        if(this.state.user_id){
            tracker.trackEvent('Click', 'ShareArticle')
        }
        AppEventsLogger.logEvent('shareArticle');
        let { post_title, post_url } = this.state
        let shareOptions = {
          title: "WrestleFeed",
          message: post_title + "\r\n",
          url: post_url,
          subject: "Share Link | Wrestlefeed"
        };
        Share.open(shareOptions);
    }

    onDarkToggle() {
        let { dark_mode } = this.state
        this.setState({ dark_mode: !dark_mode });
        this.props.onDarkToggle()
        if(dark_mode){
            tracker.trackEvent('Click', 'DayMode')
            AppEventsLogger.logEvent("DayMode_Click")
        }else{
            AppEventsLogger.logEvent("NightMode_Click")
            tracker.trackEvent('Click', 'NightMode')
        }
    }

    storyLoadProgress(progress) {
        this.setState({ load_progress: progress })
        if(progress== 1){
            setTimeout(() => {
                this.setState({ hide_progress: true, load_progress: 0.1 })
            }, 400)
        }
    }

    openStory = (post_url, post_content, post_title, dark_mode, isNextStory, isPrevStory) => {
        this.setState({ post_url, post_content, post_title, isNextStory, isPrevStory, dark_mode, hide_progress: false });
        this.bottomSheetRef.current.snapTo(0)
    }

    closeStory = () => {
        this.bottomSheetRef.current.snapTo(1)
        this.props.onCloseStory();
        this.setState({ post_url: '', post_content: '' })
    }

    onCloseMenu = () => {
        this.props.onCloseStory();
        this.setState({ post_url: '', post_content: '' })
    }

    render() {
        return(
            <View style={{ flex: 1 }}>
                <BottomSheet
                    ref={this.bottomSheetRef}
                    snapPoints = {[fullHeight - (Platform.OS === 'ios'? 60 : 70), 0]}
                    initialSnap={1}
                    renderContent={this.renderContent}
                    renderHeader={this.renderHeader}
                    enabledGestureInteraction={false}
                    enabledContentGestureInteraction={false}
                    enabledContentTapInteraction={false}
                    enabledInnerScrolling={false}
                    onCloseEnd={this.onCloseMenu}
                />
            </View>
        )
    }
}

export default StoryView