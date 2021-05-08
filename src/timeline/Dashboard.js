import React, { Component } from 'react';
import { View, Image, Dimensions, BackHandler, StatusBar, Text, Alert } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import { State, TapGestureHandler } from 'react-native-gesture-handler'
import AsyncStorage from '@react-native-community/async-storage';
import { StackActions, NavigationActions } from 'react-navigation';
import SplashScreen from 'react-native-splash-screen';
import axios from 'axios';
import firebase from 'react-native-firebase';
import { AppEventsLogger } from "react-native-fbsdk";

import AllTab from './AllTab';
import { PagerListWrapper, PagerListWrapper1, PagerListWrapper2, PagerListWrapper3, PagerListWrapper4, PagerListWrapper5, PagerListWrapper6, PagerListWrapper7, PagerListWrapper8 } from '../common/Component';
import StoryView from './StoryView';
import Comment from './Comment';
import config from '../config';
import Wrestlefeed from '../common/Wrestlefeed';
import Menu from '../menu/Menu';

let sheetOpen = false
let { width, height } = Dimensions.get('screen');
const { Value, event, block, cond, eq, set, Clock, clockRunning, startClock, timing, stopClock, debug } = Animated;
let loading_more = false;
let ads_load = false;
let tab_cahnge = false;
let loader_post =  { uri: 'splash_loading' }

function runTiming(clock, value, dest) {
    const state = {
      finished: new Value(0),
      position: new Value(0),
      time: new Value(0),
      frameTime: new Value(0)
    };
  
    const config = {
      duration: 500,
      toValue: new Value(0),
      easing: Easing.inOut(Easing.ease)
    };
  
    return block([
      cond(clockRunning(clock), 0, [
        set(state.finished, 0),
        set(state.time, 0),
        set(state.position, value),
        set(state.frameTime, 0),
        set(config.toValue, dest),
        startClock(clock)
      ]),
      timing(clock, state, config),
      cond(state.finished, debug('stop clock', stopClock(clock))),
      state.position
    ]);
}

function toggleSidebar(start, end) {
    const start_p = new Value(start);
    const end_p = new Value(end);
    const position = new Value(start)
    return block([
        set(position, runTiming(new Clock(), start_p, end_p)),
        position
    ])
}

class Dashboard extends Component {
    constructor() {
        super();
        this.state = {
            post_list: [],
            all_post: [],
            post_pos: 0,
            loading: false,
            tab_data: { name: "NEWS", last_id: 0 },
            user_data: '',
            test_gif_enable: false,
            post_news: [],
            post_divas: [],
            post_raw: [],
            post_ads_data: { post_swiped: 0, post_swiped_index: 0, tab_name: 'NEWS' }, 
            count_swipe_down: 0,
            count_swipe_up: 0  
        }
        this.cartTopOpacity = new Value(1);
        this.tapState = new Value(0);
        this.X = new Value(0)
        this.Y = new Value(0)
        this.sidebarLeft = new Value(0)
        this.sidebarStatus = new Value(0)
        this.topTabStatus = new Value(0)
        this.topTab = new Value(0)
        this.scale = new Animated.Value(1)
        this.onMoveUp = event([
            {
                nativeEvent: {state: this.tapState }
            }
        ], { useNativeDriver: true });
    
        this.runAnimate = set(this.cartTopOpacity, runTiming(new Clock(), 0, 1))
        this.translateY = this.Y

        let { sidebarStatus, topTabStatus } = this

        this.sidebarLeft = cond(eq(sidebarStatus, 0),[
            set(this.sidebarLeft, toggleSidebar(32, 0))
        ],[
            set(this.sidebarLeft, toggleSidebar(0, 32))
        ])

        this.topTab = cond(eq(topTabStatus, 0),[
            set(this.topTab, toggleSidebar(-100, 0))
        ],[
            set(this.topTab, toggleSidebar(0, -100))
        ])
    }

    componentDidMount(){
        this.handleBackPress()
        let params = this.props.navigation.state.params;
        if(params.post_data){
            let post_data = params.post_data;
            let last_id = post_data[0].id;
            let tab_data = { name: "NEWS", last_id }
            // let post_metadata = { name: "NEWS", status: true, data: post_data, index: 0, last_id };
            this.setState({ tab_data })
            // this.setState({ post_list: post_data, loading: false, tab_data, all_post: [post_metadata] });
            this.fetchPushData(last_id, post_data);
            
        }else{
            Wrestlefeed.fetchPostData("NEWS", 0).then((post) => {
                let last_id = post[post.length-1].id;
                let tab_data = { name: "NEWS", last_id }
                let post_metadata = { name: "NEWS", status: true, data: post, index: 0, last_id };
                this.setState({ post_list: post, loading: false, tab_data, all_post: [post_metadata] });
                this.fetchAllTabData([post_metadata]);
                setTimeout(() => {
                    SplashScreen.hide();
                }, 100)
            }).catch((err) => {
                Alert.alert("Something went wrong. Please try again")
                SplashScreen.hide()
                this.setState({ loading: false })
            })
        }
        this.fetchUserDetails(params.userId);  
        this.updateToken(params.userId);
    }

    updateToken(user_id){
        firebase.messaging().getToken().then(token => {
            axios.post(config.base_api + '/firebase_token.php', { user_id, token }).then((resToken) => {

            })
        });
    }

    fetchPushData(last_id, post_data){
        axios.post(`${config.base_api}/push_notify.php`, { last_id, "push_type": "all" }).then((resPostData) => {
            let { data } = resPostData;
            if(data){
                let merge_up = [...data.up, ...post_data];
                let merge_down = [...merge_up, ...data.down];
                let current_position = merge_up.length-1
                let last_id = merge_down[merge_down.length-1].id;
                let tab_data = { name: "NEWS", last_id };

                let post_metadata = { name: "NEWS", status: true, data: merge_down, index: current_position, last_id };
                this.setState({ 
                    loading: false,
                    tab_data,
                    post_list: merge_down, 
                    all_post: [post_metadata], 
                    post_pos: current_position 
                }, () => {
                    this.fetchAllTabData([post_metadata]);
                    setTimeout(() => {
                        SplashScreen.hide();
                    }, 100)
                });
            }
        })
    }

    fetchAllTabData(all_post) {
        Wrestlefeed.fetchPostData("all", 0).then((resAllPost) => {
            resAllPost.map((post_data) => {
                let { data, name } = post_data;
                let last_id = data.length != 0 ? data[data.length-1].id : 0;
                let post_metadata = { name, status: false, data, index: 0, last_id };
                all_post.push(post_metadata);
            })
            this.setState({ all_post })
        }).catch(() => {
            this.setState({ loading: false })
        })
    }

    fetchUserDetails(user_id) {
        axios.get(config.base_api+ '/user.php?uid='+user_id).then((resUser) => {
            this.setState({ user_data: resUser.data })
            config.no_story_ads = resUser.data.ads_num
        }).catch(() => {

        })
    }

    handleBackPress() {
        let self = this;
        BackHandler.addEventListener('hardwareBackPress', function() {
            if(sheetOpen){
                self.refs.comment.closeStory();
                self.refs.storyview.closeStory();
                self.refs.menu.closeStory();
                return true;
            }else{
                return false;
            }
        })
    }

    onZoomStateChange = event => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            Animated.spring(this.scale, {
                toValue: 1,
                useNativeDriver: true
            }).start()
        }
    }

    onZoomEvent = Animated.event([
        {
            nativeEvent: { scale: this.scale }
        }
    ], { useNativeDriver: true })

    openStory = (event) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            this.onReadMorePress()
        }
    }

    onReadMorePress = () => {
        let { post_list, post_pos } = this.state;
        let post_data = post_list[post_pos];
        let { post_url, isStory } = post_data;
        if(isStory && !sheetOpen){
            this.sidebarStatus.setValue(1)
            this.topTabStatus.setValue(1)
            this.refs.storyview.openStory(post_url);
        }
        sheetOpen = true;
        AppEventsLogger.logEvent("ReadMore_click");
    }

    onCloseStory(){
        this.sidebarStatus.setValue(0)
        this.topTabStatus.setValue(0)
        sheetOpen = false
    }

    singleTap = () => {
        // console.log('singleTap', event.nativeEvent)
    }

    onCommentOpen = () => {
        let { post_list, post_pos, user_data } = this.state;
        let post_data = post_list[post_pos];
        this.sidebarStatus.setValue(1)
        this.topTabStatus.setValue(1)
        this.refs.comment.openStory(post_data, user_data);
        sheetOpen = true;
        AppEventsLogger.logEvent("Comment_click");
    } 

    onCommentClose = () => {
        this.sidebarStatus.setValue(0)
        this.topTabStatus.setValue(0)
        sheetOpen = false
    }

    onTabChange(tab_data) {
        let { name } = tab_data;
        let { all_post } = this.state;
        if(!tab_cahnge){
            if(all_post.length != 0){
                tab_cahnge = true
                all_post.map((ps) => {
                    if(name == ps.name){
                        this.setState({ 
                            post_list: ps.data, 
                            post_pos: ps.index,
                            tab_data: { name, last_id: ps.last_id },
                            loading: false
                        }, () => {
                            setTimeout(() => {
                                tab_cahnge = false
                            }, 100)
                        });
                    }
                })
            }else{
                this.setState({ loading: true })
                this.checkTabData(tab_data);
            }
        }
        AppEventsLogger.logEvent(`${name}_click`)
    }

    checkTabData(tab_data) {
        let { all_post } = this.state;
        if(all_post.length == 0){
            const checkTab = setTimeout(() => {
                this.checkTabData(tab_data)
            }, 500)
        }else{
            this.onTabChange(tab_data)
        }
    }

    onPostChange(position) {

        let current_position = position;
        let { post_list, tab_data, all_post, count_swipe_down, count_swipe_up, post_pos } = this.state;
        let { name, last_id } = tab_data;
        
        if(post_list.length-current_position < 7 && loading_more == false){
            loading_more = true
            Wrestlefeed.fetchPostData(name, last_id).then((post) => {
                let last_id = post[post.length-1].id;
                let merge_post = [...post_list, ...post];
                all_post.map((ps, key_ps) => {
                    if(ps.name == name){
                        all_post[key_ps].data = merge_post;
                        all_post[key_ps].index = current_position;
                    }
                })
                this.setState({ post_list: merge_post, tab_data: { name, last_id }, all_post });
                loading_more = false
            }).catch(() => {
                loading_more = false
            })
        }
        let count_swipe_down_t = 0
        let count_swipe_up_t = count_swipe_up;

        all_post.map((ps, key_ps) => {
            if(ps.name == name){
                all_post[key_ps].index = current_position;
            }
            count_swipe_down_t = count_swipe_down_t+all_post[key_ps].index
        })
        
        if(count_swipe_down_t < count_swipe_down){
            count_swipe_up_t = count_swipe_up+1
        }
        
        let total_swiped = count_swipe_down_t + count_swipe_up_t;
        if(total_swiped%config.no_story_ads == 0 && total_swiped != 0){
            if(!ads_load){
                ads_load = true;
            }
        }else{
            ads_load = false
        }
        this.setState({ post_pos: current_position, all_post,
            count_swipe_up: count_swipe_up_t,
            count_swipe_down: count_swipe_down_t
        });
        if(position > post_pos){
            AppEventsLogger.logEvent("Story_views")
        }
    }

    openMenu = () => {
        let { user_data } = this.state;
        this.refs.menu.openStory(user_data);
        sheetOpen = true;
        AppEventsLogger.logEvent("WWFOldSchool_menu_click");
    }

    onMenuClose = () => {
        sheetOpen = false
    }

    logout() {
        AsyncStorage.removeItem('uid');
        let resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Welcome',})
            ],
        });
        this.props.navigation.dispatch(resetAction);
    }

    doubleTapRef = React.createRef();

    render() {
        let { post_list, loading, tab_data, post_pos } = this.state;
        let { name } = tab_data
        return(
            <View style={{ backgroundColor: '#15202b', flex: 1 }}>
                <StatusBar hidden />
                
                <View style={{ flex: 850 }}>
                <View style={{ position: 'absolute', top: 16, zIndex: 1 }}>
                    <Animated.View style={{ transform: [ { translateY: this.topTab } ] }} >
                        <AllTab onMenuPress={this.openMenu} onTabPress={(tab_data) => this.onTabChange(tab_data)} />
                    </Animated.View>
                </View>
                <TapGestureHandler
                    onHandlerStateChange={this.singleTap}
                    waitFor={this.doubleTapRef}
                >
                <TapGestureHandler 
                    numberOfTaps={2} 
                    onHandlerStateChange={this.openStory} 
                    ref={this.doubleTapRef} 
                    style={{ width, height }}
                >
                    <Animated.View style={{ flex: 1 }}>
                        {
                            loading ?
                            <Animated.View key="10000" style={{ flex: 1 }}>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: 'white', fontSize: 20, fontFamily: config.ios ? 'Eurostile' : 'Eurostile-Bold' }}>Please wait...</Text>
                                </View>
                            </Animated.View> 
                            :
                            post_list.length == 0 ?
                            <Animated.View key="10000" style={{ flex: 1 }}>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: 'white', fontSize: 20, fontFamily: config.ios ? 'Eurostile' : 'Eurostile-Bold' }}>Please wait...</Text>
                                </View>
                            </Animated.View>
                            :
                            name == "NEWS" ?
                            <PagerListWrapper 
                                index={post_pos}
                                post_list={post_list}
                                onPostChange={(position) => this.onPostChange(position)}
                                onReadMorePress={this.onReadMorePress}
                                onCommentOpen={this.onCommentOpen}
                            />
                            : name == "DIVAS" ?
                            <PagerListWrapper1 
                                index={post_pos}
                                post_list={post_list}
                                onPostChange={(position) => this.onPostChange(position)}
                                onReadMorePress={this.onReadMorePress}
                                onCommentOpen={this.onCommentOpen}
                            />
                            : name == "RAW" ?
                            <PagerListWrapper2
                                index={post_pos}
                                post_list={post_list}
                                onPostChange={(position) => this.onPostChange(position)}
                                onReadMorePress={this.onReadMorePress}
                                onCommentOpen={this.onCommentOpen}
                            />
                            : name == "VIDEOS" ?
                            <PagerListWrapper3
                                index={post_pos}
                                post_list={post_list}
                                onPostChange={(position) => this.onPostChange(position)}
                                onReadMorePress={this.onReadMorePress}
                                onCommentOpen={this.onCommentOpen}
                            />
                            : name == "SMACKDOWN" ?
                            <PagerListWrapper4
                                index={post_pos}
                                post_list={post_list}
                                onPostChange={(position) => this.onPostChange(position)}
                                onReadMorePress={this.onReadMorePress}
                                onCommentOpen={this.onCommentOpen}
                            />
                            : name == "NXT" ?
                            <PagerListWrapper5
                                index={post_pos}
                                post_list={post_list}
                                onPostChange={(position) => this.onPostChange(position)}
                                onReadMorePress={this.onReadMorePress}
                                onCommentOpen={this.onCommentOpen}
                            />
                            : name == "AEW" ?
                            <PagerListWrapper6
                                index={post_pos}
                                post_list={post_list}
                                onPostChange={(position) => this.onPostChange(position)}
                                onReadMorePress={this.onReadMorePress}
                                onCommentOpen={this.onCommentOpen}
                            />
                            : name == "MEMES" ?
                            <PagerListWrapper7
                                index={post_pos}
                                post_list={post_list}
                                onPostChange={(position) => this.onPostChange(position)}
                                onReadMorePress={this.onReadMorePress}
                                onCommentOpen={this.onCommentOpen}
                            />
                            : name == "OLD SCHOOL" ?
                            <PagerListWrapper8
                                index={post_pos}
                                post_list={post_list}
                                onPostChange={(position) => this.onPostChange(position)}
                                onReadMorePress={this.onReadMorePress}
                                onCommentOpen={this.onCommentOpen}
                            />
                            : null
                        }
                    </Animated.View>
                </TapGestureHandler>
                </TapGestureHandler>
                </View>
                <View style={{ flex: 2 }}>
                    <StoryView ref="storyview" onCloseStory={() => this.onCloseStory()} />
                    <Comment ref="comment" onCloseStory={this.onCommentClose} />
                    <Menu ref="menu" onCloseStory={this.onMenuClose} navigation={this.props.navigation} />
                </View>
            </View>
        )
    }
}

export default Dashboard;