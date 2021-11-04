import React, { Component } from 'react'
import { View, Text, StatusBar, Dimensions, BackHandler, Modal } from 'react-native'
import { TapGestureHandler, State } from 'react-native-gesture-handler'
import Animated, {  } from 'react-native-reanimated';
import { AppEventsLogger } from 'react-native-fbsdk';
import axios from 'axios';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import Wrestlefeed from '../common/Wrestlefeed'
import { PagerListWrapper, MenuIcon, PleaseWait, RefreshIcon } from '../common/Component'
import StoryView from '../timeline/StoryView';
import Comment from '../timeline/Comment';
import Menu from '../menu/Menu';
import config from '../config';
import { updateDarkMode, pushTabData, refreshAds } from '../action';
import PlayVideoModal from '../common/PlayVideoModal';
import { BottomAction } from '../common/Component'
import { tracker } from '../tracker';
import { withNavigationFocus } from 'react-navigation'
import firebase from 'react-native-firebase';
const AdRequest = firebase.admob.AdRequest;
const request = new AdRequest();

let sheetOpen = false
let loading_more = false
let { width, height } = Dimensions.get('screen');

class Videos extends Component {
    constructor() {
        super()
        this.playRef = React.createRef();
        this.viewPager = React.createRef();
    }
    state = {
        post_list: [],
        loading: true,
        last_id: 0,
        post_position: 0,
        user_data: '',
        hideMenu: false,
        refresh_load: false,
        isOpenVideo: false,
        nb_swipe: 0,
        advert: firebase.admob().interstitial(config.advert)
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if(nextProps.isFocused){
            tracker.trackEvent("Click", "VIDEOS")
            tracker.trackScreenView("VIDEOS")
        }
    }

    componentDidMount() {
        let { post, user, push } = this.props.navigation.state.params;

        if(post && !push){
            post.map((post_data) => {
                let { name, data } = post_data;
                if(name == "VIDEOS"){
                    let last_id = data[data.length-1].id;
                    this.setState({ post_list: data, loading: false, last_id, user_data: user });
                }
            })
        }else{
            setTimeout(() => {
                this.onPostChange(0)
            }, 1000)
            this.setState({ user_data: user })
        }
        this.props.navigation.addListener('didBlur', (route) => { 
            if(sheetOpen){
                this.refs.comment.closeStory();
                this.refs.storyview.closeStory();
            }
            if(this.refs.menu)
                this.refs.menu.closeStory();
        });
        this.props.navigation.addListener('didFocus', (route) => { 
            this.setToLatest(6, false, 0)
            AppEventsLogger.logEvent(`VIDEOS_click`)
        });
        if(!config.ios){
            this.handleBackPress()
        }
    }

    showAdvert() {
        //request.addKeyword('foo').addKeyword('bar');
        const { advert } = this.state
        if (!advert.isLoaded())
            setTimeout(() => {
                advert.show()
            }, 1000);
        else advert.show()
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
                self.showAdvert()
                self.refs.comment.closeStory();
                self.refs.storyview.closeStory();
                self.refs.menu.closeStory();
                return true;
            }else{
                return false;
            }
        })
    }

    fetchUserDetails(user_id) {
        axios.get(config.base_api+ '/user.php?uid='+user_id).then((resUser) => {
            this.setState({ user_data: resUser.data })
            config.no_story_ads = resUser.data.ads_num
        }).catch(() => {

        })
    }

    onPostChange = (position) => {
        if(this.state.nb_swipe === 4) {
            this.setState({nb_swipe: 0 })
            this.props.refreshAds(true);
          }
        else this.setState({nb_swipe: this.state.nb_swipe + 1 })
        let { post_list, last_id, post_position, user_data } = this.state;
        if(post_list.length-position < 5 && loading_more == false){
            loading_more = true
            Wrestlefeed.fetchPostData("VIDEOS", last_id, user_data.ID).then((post) => {
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
        this.setState({advert: firebase.admob().interstitial(config.advert)}, () => {
            this.state.advert.loadAd(request.build())
        })
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

    onPlayVideo = () => {
        let { post_list, post_position } = this.state;
        let post_data = post_list[post_position];
        let { post_url, isStory, content, post_title } = post_data;
        if(isStory){
            let video_details = Wrestlefeed.getVideoDetails(content);
            if(video_details){
                this.playRef.current.handleStatus(video_details);
            }else{
                this.onReadMorePress()
            }
        }
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
        let params = this.props.navigation.state.params;
        let { post_list, post_position, user_data } = this.state;
        let post_data = post_list[post_position];
        user_data = user_data ? user_data : { ID: params.userId }
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

    onRefreshPost = () => {
        let { user_data, post_list } = this.state;
        if(post_list.length != 0){
            this.setState({ refresh_load: true })
            Wrestlefeed.fetchNewPost("VIDEOS", post_list, user_data).then((resRefreshPostList) => {
                if(resRefreshPostList.length != 0){
                    this.setState({ post_list: resRefreshPostList, refresh_load: false }, () => {
                        this.setToLatest(6, true, resRefreshPostList[0].id)
                        setTimeout(() => {
                            this.viewPager.current.setPage(0);
                        }, 300)
                    })
                }else{
                    this.setState({ refresh_load: false })
                    this.viewPager.current.setPage(0);
                }
            }).catch((err) => {
                this.setState({ refresh_load: false })
            })
        }
    }

    onMenuClose = () => { sheetOpen = false }
    onCloseStory = () => { 
        this.showAdvert();
        this.toggleTab(false)
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
        let { post_list, post_position, hideMenu, refresh_load } = this.state
        return(
            <View style={{ backgroundColor: '#15202b', flex: 1 }}>
                <StatusBar hidden />
                <View style={{ position: 'absolute', left: 16, top: 12, zIndex: 1 }}>
                    { !hideMenu ? <MenuIcon onMenuPress={this.openMenu} /> : null }
                </View>
                <RefreshIcon onRefreshPress={this.onRefreshPost} status={refresh_load} hideMenu={hideMenu} />
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
                        <Animated.View style={{ flex: 1, marginBottom: -1 }}>
                            {
                                post_list.length != 0 ?
                                    <>
                                        <PagerListWrapper 
                                            pageRef={this.viewPager}
                                            index={0}
                                            post_list={post_list}
                                            onPostChange={(position) => this.onPostChange(position)}
                                        />
                                        <BottomAction
                                            category="videos"
                                            post={post_list[post_position]}
                                            onReadMorePress={this.onPlayVideo}
                                            onCommentPress={this.onCommentOpen}
                                            onReactionPress={(type) => this.onReactionPress(type)}
                                        />
                                    </>
                                : <PleaseWait />
                            }
                        </Animated.View>
                    </TapGestureHandler>
                    </TapGestureHandler>
                    <PlayVideoModal ref={this.playRef} />
                </View>
                <View style={{ flex: 2 }}>
                    <StoryView ref="storyview" onCloseStory={this.onCloseStory} onDarkToggle={() => this.onDarkToggle()} onPrevNext={(type) => this.onPrevNext(type)} />
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
  
export default connect(mapStateToProps, { updateDarkMode, pushTabData, refreshAds })(withNavigationFocus(Videos));
