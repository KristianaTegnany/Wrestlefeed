import React, { Component } from 'react'
import { View, StatusBar, Dimensions, BackHandler, AppState, Platform } from 'react-native'
import { TapGestureHandler, State } from 'react-native-gesture-handler'
import AsyncStorage from "@react-native-community/async-storage";
import Animated, {  } from 'react-native-reanimated';
import { AppEventsLogger } from 'react-native-fbsdk';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import axios from 'axios'
import firebase from 'react-native-firebase';

import Wrestlefeed from '../common/Wrestlefeed'
import { PagerListWrapper, MenuIcon, PleaseWait, RefreshIcon, MoneyIcon } from '../common/Component'
import StoryView from '../timeline/StoryView';
import Comment from '../timeline/Comment';
import Menu from '../menu/Menu';
import config from '../config';
import { pushTabData, updateDarkMode } from '../action'
import { BottomAction } from '../common/Component'
import { updateWM } from '../menu/WrestleMoney';
import { tracker } from '../tracker';
import { withNavigationFocus } from 'react-navigation'

let sheetOpen = false
let loading_more = false
let { width, height } = Dimensions.get('screen');

class News extends Component {
    constructor() {
        super()
        this.viewPager = React.createRef();
    }
    state = {
        post_list: [],
        loading: true,
        last_id: 0,
        post_position: 0,
        user_data: '',
        hideMenu: false,
        showGreen: false,
        refresh_load: false
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if(nextProps.isFocused){
            tracker.trackEvent("Click", "NEWS")
            tracker.trackScreenView("NEWS")
        }
    }
      
    async componentDidMount() {
        this.pushManage()
        this.props.updateDarkMode(false, true);
        let params = this.props.navigation.state.params;
        let { post, user } = params;
        
        if(params.push){
            this.showPushData(post, user);
            this.setState({ user_data: user })
        }else{
            if(post){
                let redux_tab_data = []
                post.map((post_data) => {
                    let { name, data } = post_data;
                    let first_id = data[0].id;
                    redux_tab_data.push({ name, first_id, new_data: [] })
                    if(name == "NEWS"){
                        let last_id = data[data.length-1].id;
                        this.setState({ post_list: data, loading: false, last_id, user_data: user}, () => {
                            setTimeout(() => {
                                Wrestlefeed.hideSplash()
                                Wrestlefeed.updateToken();
                            }, 100)
                        });
                    }
                })
                this.props.pushTabData('ALL', redux_tab_data)
            }
        }
        user.ID && updateWM(user.ID)
        this.props.navigation.addListener('didBlur', (route) => { 
            if(sheetOpen){
                this.refs.comment.closeStory();
                this.refs.storyview.closeStory();
            }
            if(this.refs.menu)
                this.refs.menu.closeStory();
        });
        this.props.navigation.addListener('didFocus', (route) => {
            this.setToLatest(0, false, 0)
            AppEventsLogger.logEvent(`NEWS_click`)
        });
        if(!config.ios){
            this.handleBackPress()
        }
        AppState.addEventListener("change", this.handleAppStateChange);

        
    }

    pushManage() {
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            const notif = notificationOpen.notification;
            // console.log('notif', notif);
            if(notif._data) {
                if(notif._data.pid){
                    if(!config.ios){
                        this.getPushPostData(notif._data.pid)
                    }
                }else if(notif._data.data && notif._data.data.pid) {
                    this.getPushPostData(notif._data.data.pid)
                }else{
                    // this.sendHome();
                }
            }else{
                // this.sendHome();
            }
        });
    }

    getPushPostData(post_id){
        let { user_data } = this.state
        Wrestlefeed.showSplash()
        this.refs.storyview.closeStory();
        this.refs.comment.closeStory();
        this.refs.menu.closeStory();
        if(this.props.navigation.isFocused() == false){
            this.props.navigation.navigate("News")
        }
        axios.post(`${config.base_api}/push_notify.php`, { "last_id": post_id, "user_id": user_data.ID }).then((resPostData) => {
            let { all_post, user } = resPostData.data;
            let { data } = all_post[0];
            const read_more_data = Wrestlefeed.readMoreProcess(data, 0, false);
            if(read_more_data){
                this.toggleTab(true)
                let { post_url, content, post_title, isNextStory, isPrevStory } = read_more_data;
                let { setting } = this.props;
                this.refs.storyview.openStory(post_url, content, post_title, setting.dark_mode, isNextStory, isPrevStory);
                setTimeout(() => {
                    Wrestlefeed.hideSplash();
                }, 200)
            }else{
                Wrestlefeed.hideSplash();
                this.toggleTab(false)
            }
        }).catch((err) => {
            Wrestlefeed.hideSplash();
            this.toggleTab(false)
        })
    }

    handleAppStateChange = (currentState) => {
        if(currentState == 'active'){
            let { tab } = this.props;
            let { user_data } = this.state
            if(tab){
                axios.post(config.base_api+'/new_post_check.php', { tab: tab.data, user_id: user_data.ID }).then((resTab) => {
                    if(resTab.data){
                        this.props.pushTabData('ALL', resTab.data)
                    }
                }).catch((err) => {
                    
                })
            }
        }
    }

    setToLatest(cat_id, isrefresh, top_id) {
        let { post_list } = this.state;
        let { data } = this.props.tab;
        let latest_data = data[cat_id];
        if(!isrefresh){
            if(latest_data && latest_data.new_data.length != 0 ){
                const merged_post = [...latest_data.new_data, ...post_list];
                this.setState({ post_list: merged_post }, () => {
                    if(this.viewPager && this.viewPager.current){
                        this.viewPager.current.setPage(0);
                        data[cat_id].first_id = latest_data.new_data[0].id
                        data[cat_id].new_data = [];
                        this.props.pushTabData('ALL', data)
                    }
                })
            }
        }else{
            data[cat_id].first_id = top_id
            data[cat_id].new_data = [];
            this.props.pushTabData('ALL', data)
        }
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
                self.props.navigation.navigate("News");
                return false;
            }
        })
    }

    showPushData(post, user){
        if(post){
            let { data } = post[0];
            const read_more_data = Wrestlefeed.readMoreProcess(data, 0, sheetOpen);
            if(read_more_data){
                let { post_url, content, post_title, isNextStory, isPrevStory } = read_more_data;
                AsyncStorage.getItem('dark_mode').then((resDark) => {
                    let dark_mode = resDark ? true : false;
                    this.refs.storyview.openStory(post_url, content, post_title, dark_mode, isNextStory, isPrevStory);
                    setTimeout(() => {
                        this.toggleTab(true)
                        this.onPostChange(0)
                        Wrestlefeed.hideSplash();
                        setTimeout(() => {
                            axios.post(config.base_api+"/feed_initial.php", { tab_name: "all", last_id: 0, user_id: user.ID }).then((resAllPost) => {
                                let { all_post } = resAllPost.data;
                                all_post = all_post.map(post => {
                                    if(post.name === "NEWS")
                                      return {name: post.name, data: post.data}
                                    else return post
                                })
                                let redux_tab_data = [];
                                all_post.map((p_d, i) => {
                                    let { name, data } = p_d;
                                    let first_id = data[0].id;
                                    redux_tab_data.push({ name, first_id, new_data: [] })
                                })
                                this.props.pushTabData('ALL', redux_tab_data)
                            }).catch((err) => {
                                
                            })
                        }, 5000)
                    }, 500)
                })
            }
        }
    }

    onPostChange = (position) => {
        let { post_list, last_id, post_position, user_data } = this.state;
        if(post_list.length-position < 7 && loading_more == false){
            loading_more = true
            Wrestlefeed.fetchPostData("NEWS", last_id, user_data.ID).then((post) => {
                let last_id = post[post.length-1].id;
                let merge_post = [...post_list, ...post];
                this.setState({ post_list: merge_post, last_id, post_position: position });
                loading_more = false
            }).catch(() => {
                loading_more = false
            })
        }else{
            this.setState({ post_position: position });
        }
        if(position > post_position){
            AppEventsLogger.logEvent("Story_views")
        }
        
    }  

    onReadMorePress = () => {
        const setParamsAction = NavigationActions.setParams({
            params: { hideTabBar: true },
            key: this.props.navigation.state.key,
        });
        this.props.navigation.dispatch(setParamsAction);
        let { post_list, post_position } = this.state;
        const read_more_data = Wrestlefeed.readMoreProcess(post_list, post_position, sheetOpen)
        if(read_more_data){
            let { post_url, content, post_title, isNextStory, isPrevStory } = read_more_data;
            let { setting } = this.props;
            this.refs.storyview.openStory(post_url, content, post_title, setting.dark_mode, isNextStory, isPrevStory);
            this.toggleTab(true)
        }
        AppEventsLogger.logEvent("ReadMore_click");
    }
    
    toggleTab(status) {
        const setParamsAction = NavigationActions.setParams({
            params: { hideTabBar: status },
            key: this.props.navigation.state.key,
          });
        this.props.navigation.dispatch(setParamsAction);
        this.setState({ hideMenu: status });
        sheetOpen = status
    }

    onCommentOpen = () => {
        let { post_list, post_position, user_data } = this.state;
        let post_data = post_list[post_position];
        this.refs.comment.openStory(post_data, user_data);
        this.toggleTab(true)
        AppEventsLogger.logEvent("Comment_click");
    }
    
    openMenu = () => {
        let { user_data } = this.state;
        this.refs.menu.openStory(user_data);
        sheetOpen = true;
        AppEventsLogger.logEvent("WWFOldSchool_menu_click");
    }

    onReactionPress = (type) => {
        let { post_position, post_list, user_data } = this.state
        const post_list_updated = Wrestlefeed.handleReaction(post_list, post_position, user_data, type);
        this.setState({ post_list: post_list_updated })
    }

    onDarkToggle = () => {
        let { setting } = this.props
        this.props.updateDarkMode(true, setting.dark_mode)
    }

    onPrevNext(type){
        let { post_position, post_list, user_data } = this.state;
        let process_data = Wrestlefeed.prevNextProcess(type, post_list, post_position);
        if(process_data){
            let { content, post_title, isNextStory, isPrevStory, prev_next_position } = process_data
            this.viewPager.current.setPage(prev_next_position);
            this.refs.storyview.handlePrevNext(content, post_title, isNextStory, isPrevStory);
        }
    }

    onPollPress(poll_index) {
        let { user_data, post_list, post_position } = this.state;
        const post_data = post_list[post_position];
        const temp_obj = { user_id: user_data.ID, post_id: post_data.id, poll_txt: `option_${poll_index+1}`, };
        post_list[post_position].poll.poll_user = temp_obj;
        let option_count = post_data.poll.poll_data[poll_index].count;
        post_list[post_position].poll.poll_data[poll_index].count = option_count+1;
        this.setState({ post_list });
        Wrestlefeed.submitPoll(`option_${poll_index+1}`, post_data.id, user_data.ID).then((resPoll) => {

        })
    }

    onRefreshPost = () => {
        let { user_data, post_list } = this.state;
        if(post_list.length != 0){
            this.setState({ refresh_load: true })
            Wrestlefeed.fetchNewPost("NEWS", post_list, user_data).then((resRefreshPostList) => {
                if(resRefreshPostList.length != 0){
                    this.setState({ post_list: resRefreshPostList, refresh_load: false }, () => {
                        this.setToLatest(0, true, resRefreshPostList[0].id)
                        setTimeout(() => {
                            this.viewPager.current.setPage(0);
                        }, 300)
                    })
                }else{
                    this.setState({ refresh_load: false })
                    this.viewPager.current.setPage(0);
                    this.setToLatest(0, true, post_list[0].id)
                }
            }).catch((err) => {
                this.setState({ refresh_load: false })
            })
        }
    }

    onMenuClose = () => { sheetOpen = false }
    onCloseStory = () => { 
        this.toggleTab(false);
        // this.showAds()
    }
    onCommentClose = () => { this.toggleTab(false) }
    doubleTap = (event) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            // this.onReadMorePress()
        }
    }
    singleTap = () => {}
    doubleTapRef = React.createRef();

    render() {
        let { post_list, hideMenu, post_position, refresh_load } = this.state;
        return(
            <View style={{ backgroundColor: '#15202b', flex: 1 }}>
                <StatusBar hidden />
                <View style={{ position: 'absolute', left: 16, top: 12, zIndex: 1 }}>
                    { !hideMenu ? <MenuIcon onMenuPress={this.openMenu} /> : null }
                </View>
                <RefreshIcon onRefreshPress={this.onRefreshPost} status={refresh_load} hideMenu={hideMenu} />
                <MoneyIcon onPress={() => this.props.navigation.navigate("WrestleMoney", this.state.user_data)} hidden={hideMenu}/>
                <View style={{ flex: 850 }}>
                    <TapGestureHandler
                        onHandlerStateChange={this.singleTap}
                        waitFor={this.doubleTapRef}
                    >
                    <TapGestureHandler 
                        numberOfTaps={2} 
                        onHandlerStateChange={this.doubleTap} 
                        ref={this.doubleTapRef}
                        style={{ width, height }}
                    > 
                        <Animated.View style={{ flex: 1, marginBottom: -1}}>
                            {
                                post_list.length != 0 ?
                                    <>
                                        <PagerListWrapper 
                                            pageRef={this.viewPager}
                                            index={post_position}
                                            post_list={post_list}
                                            onPostChange={(position) => this.onPostChange(position)}
                                            onPollPress={(poll_index) => this.onPollPress(poll_index)}
                                        />
                                        <BottomAction
                                            post={post_list[post_position]}
                                            onReadMorePress={this.onReadMorePress}
                                            onCommentPress={this.onCommentOpen}
                                            onReactionPress={(type) => this.onReactionPress(type)}
                                        />
                                    </>
                                : <PleaseWait />
                            }
                        </Animated.View>
                    </TapGestureHandler>
                    </TapGestureHandler>
                </View>
                <View style={{ flex: 2 }}>
                    <StoryView 
                        ref="storyview"
                        onCloseStory={this.onCloseStory} 
                        onDarkToggle={() => this.onDarkToggle()} 
                        onPrevNext={(type) => this.onPrevNext(type)}
                    />
                    <Comment ref="comment" onCloseStory={this.onCommentClose} />
                    <Menu ref="menu" onCloseStory={this.onMenuClose} navigation={this.props.navigation} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        tab: state.tab,
        setting: state.setting,
        swipe: state.swipe
    };
};
  
export default connect(mapStateToProps, { pushTabData, updateDarkMode })(withNavigationFocus(News));
