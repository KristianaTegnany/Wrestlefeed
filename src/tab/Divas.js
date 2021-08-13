import React, { Component } from 'react'
import { View, StatusBar, Dimensions, BackHandler } from 'react-native'
import { TapGestureHandler, State } from 'react-native-gesture-handler'
import Animated, { } from 'react-native-reanimated';
import { AppEventsLogger } from 'react-native-fbsdk';
import { NavigationActions } from 'react-navigation';

import Wrestlefeed from '../common/Wrestlefeed'
import { PagerListWrapper, MenuIcon, PleaseWait, RefreshIcon } from '../common/Component'
import StoryView from '../timeline/StoryView';
import Comment from '../timeline/Comment';
import Menu from '../menu/Menu';
import config from '../config';
import NotSubscribed from '../menu/NotSubscribed';
import { BottomAction } from '../common/Component'
import connect from '../connector';
import { tracker } from '../tracker';
import { withNavigationFocus } from 'react-navigation'

let sheetOpen = false
let loading_more = false
let { width, height } = Dimensions.get('screen');

class Divas extends Component {
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
    refresh_load: false,
    closed: false
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if(nextProps.isFocused){
      tracker.trackEvent("Click", "DIVAS")
      tracker.trackScreenView("DIVAS")
    }
  }

  UNSAFE_componentWillMount(){
    let { user } = this.props.navigation.state.params;
    this.props.retrieveProState(user.ID);
  }

  componentDidMount() {
    let { post, user, push } = this.props.navigation.state.params;
    
    if (post && !push) {
      post.map((post_data) => {
        let { name, data } = post_data;
        if (name == "DIVAS") {
          let last_id = data[data.length - 1].id;
          this.setState({ post_list: data, loading: false, last_id, user_data: user });
        }
      })
    } else {
      setTimeout(() => {
        this.onPostChange(0)
      }, 1000);
      this.setState({ user_data: user })
    }
    this.props.navigation.addListener('didBlur', (route) => {
      if (sheetOpen) {
        this.refs.comment.closeStory();
        this.refs.storyview.closeStory();
      }
      if (this.refs.menu)
        this.refs.menu.closeStory();
    });
    this.props.navigation.addListener('didFocus', (route) => {
      this.setToLatest(2, false, 0)
      AppEventsLogger.logEvent(`DIVAS_click`)
    });

    if (!config.ios) {
      this.handleBackPress();
    }
  }

  handleBackPress() {
    let self = this;
    BackHandler.addEventListener('hardwareBackPress', function () {
      if (sheetOpen) {
        self.refs.comment.closeStory();
        self.refs.storyview.closeStory();
        self.refs.menu.closeStory();
        return true;
      } else {
        return false;
      }
    })
  }

  setToLatest(cat_id, isrefresh, top_id) {
    let { post_list } = this.state;
    let { data } = this.props.tab;
    let latest_data = data[cat_id];
    if (!isrefresh) {
      if (latest_data && latest_data.new_data.length != 0) {
        const merged_post = [...latest_data.new_data, ...post_list];
        this.setState({ post_list: merged_post }, () => {
          if (this.viewPager && this.viewPager.current) {
            this.viewPager.current.setPage(0);
            data[cat_id].first_id = latest_data.new_data[0].id
            data[cat_id].new_data = [];
            this.props.pushTabData('ALL', data)
          }
        })
      }
    } else {
      data[cat_id].first_id = top_id
      data[cat_id].new_data = [];
      this.props.pushTabData('ALL', data)
    }
  }

  onPostChange = (position) => {
    let { post_list, last_id, post_position, user_data } = this.state;
    if (post_list.length - position < 5 && loading_more == false) {
      loading_more = true
      Wrestlefeed.fetchPostData("DIVAS", last_id, user_data.ID).then((post) => {
        let last_id = post[post.length - 1].id;
        let merge_post = [...post_list, ...post];
        this.setState({ post_list: merge_post, last_id, post_position: position });
        loading_more = false
      }).catch(() => {
        loading_more = false
      })
    } else {
      this.setState({ post_position: position });
    }
    if (position > post_position) {
      AppEventsLogger.logEvent("Story_views")
    }
  }

  onReadMorePress = () => {
    let { post_list, post_position } = this.state;
    const read_more_data = Wrestlefeed.readMoreProcess(post_list, post_position, sheetOpen)
    if (read_more_data) {
      let { post_url, content, post_title, isNextStory, isPrevStory } = read_more_data;
      let { setting } = this.props;
      this.refs.storyview.openStory(post_url, content, post_title, setting.dark_mode, isNextStory, isPrevStory);
      this.toggleTab(true)
    }
    AppEventsLogger.logEvent("ReadMore_click");
  }

  onPrevNext(type) {
    let { post_position, post_list, user_data } = this.state;
    let process_data = Wrestlefeed.prevNextProcess(type, post_list, post_position);
    if (process_data) {
      let { content, post_title, isNextStory, isPrevStory, prev_next_position } = process_data
      this.viewPager.current.setPage(prev_next_position);
      this.refs.storyview.handlePrevNext(content, post_title, isNextStory, isPrevStory);
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
    if (post_list.length != 0) {
      this.setState({ refresh_load: true })
      Wrestlefeed.fetchNewPost("DIVAS", post_list, user_data).then((resRefreshPostList) => {
        if (resRefreshPostList.length != 0) {
          this.setState({ post_list: resRefreshPostList, refresh_load: false }, () => {
            this.setToLatest(2, true, resRefreshPostList[0].id)
            setTimeout(() => {
              this.viewPager.current.setPage(0);
            }, 300)
          })
        } else {
          this.setState({ refresh_load: false })
          this.viewPager.current.setPage(0);
        }
      }).catch((err) => {
        this.setState({ refresh_load: false })
      })
    }
  }

  onMenuClose = () => { sheetOpen = false }
  onCloseStory = () => { this.toggleTab(false); }
  onCommentClose = () => { this.toggleTab(false); }
  doubleTap = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      this.onReadMorePress()
    }
  }
  singleTap = () => { }
  doubleTapRef = React.createRef();

  render() {
    let { post_list, post_position, hideMenu, refresh_load, closed, user_data } = this.state
    const {
      subs: {isPro}
    } = this.props
    return (
      <View style={{ backgroundColor: '#15202b', flex: 1 }}>
        <StatusBar hidden />
        <View style={{ position: 'absolute', left: 16, top: 12, zIndex: 1001 }}>
          {!hideMenu ? <MenuIcon onMenuPress={this.openMenu} /> : null}
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
          <StoryView ref="storyview" onCloseStory={this.onCloseStory} onDarkToggle={() => this.onDarkToggle()} onPrevNext={(type) => this.onPrevNext(type)} />
          <Comment ref="comment" onCloseStory={this.onCommentClose} />
          <Menu ref="menu" onCloseStory={this.onMenuClose} navigation={this.props.navigation} />
        </View>
        {!isPro && !closed && <NotSubscribed user={user_data} close={() => this.setState({closed: true})} />}
      </View>
    )
  }
}

export default connect(withNavigationFocus(Divas))
