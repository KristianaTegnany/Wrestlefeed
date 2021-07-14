import React, { Component, useEffect, useState } from 'react';
import { View, Text, Dimensions, Image, Keyboard, Platform, ActivityIndicator } from 'react-native';
import BottomSheet from 'reanimated-bottom-sheet'
import { TouchableOpacity, TextInput, FlatList } from 'react-native-gesture-handler';
import axios from 'axios';
import config from '../config';
import Wrestlefeed from '../common/Wrestlefeed';
import { AppEventsLogger } from 'react-native-fbsdk';
import legend_icon from '../assets/images/legend.png';
import * as Service from '../services/subscription'
import {  withNavigationFocus } from 'react-navigation'
import { tracker } from '../tracker'

let { height } = Dimensions.get('screen');
let storyHeight = height-100
let changePer = 28 + ((height-600)/38);
let key_height = changePer*(height/100);
let heightForKeyboard = height + key_height - height/10
isKeyboardActive = false;
let commenting = false

const Legend = (props) => {
    return (
      <View style={{marginLeft: 10, flexDirection:'row', alignSelf:'center', alignItems: 'flex-end'}}> 
        <Image
          source={legend_icon}
          style={{ width: 25, height: 25}}
        />
        <Text style={{color: '#c9952c', fontFamily: Platform.OS === 'ios'? 'Eurostile' : 'Eurostile-Bold', marginHorizontal: 5}}>LEGEND</Text>
        <Image
          source={legend_icon}
          style={{ width: 25, height: 25}}
        />
      </View>
    )
}

const CommentItem = (props) => {
    const [isPro, setIsPro] = useState(false)
    let { user_id, comment_content, comment_author, comment_date, comment_author_url } = props.data;
    let valid_comment_date = Wrestlefeed.getFormatDate(comment_date);
    
    const getSubscription = async () => {
        const { subscribed } = await Service.retrieveProState(user_id)
        setIsPro(subscribed)
    }

    useEffect(() => {
        getSubscription()
    }, [])

    return(
        <View style={{  }}>
            <View style={{ flexDirection: 'row', flexWrap:'wrap' }}>
                <View>
                    {
                        comment_author_url ?
                        <Image source={{ uri: `https://graph.facebook.com/${comment_author_url}/picture?type=large` }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                        :
                        <Image source={{ uri: 'ic_user_profile' }} style={{ width: 32, height: 32 }} />
                    }

                </View>
                <View style={{ justifyContent: 'center', paddingLeft: 12}}>
                    <Text style={{ fontSize: 16, color: '#232632' }}>{comment_author}</Text>
                </View>
                <View style={{ justifyContent: 'center', paddingLeft: 8, paddingRight: 8 }}>
                    <View style={{  backgroundColor: '#B21A1A', width: 8, height: 8, borderRadius: 4 }}></View>
                </View>
                {
                    !isPro &&
                    <View style={{ justifyContent: 'center' }}>
                        <Text>{valid_comment_date}</Text>
                    </View>
                }
                {
                    isPro &&
                    <Legend/>
                }
            </View>
            <View style={{ paddingTop: 8, paddingBottom: 24, flexDirection: 'row', flexWrap: 'wrap'  }}>
                <View style={{ backgroundColor: 'rgba(85,87,99,0.08)', alignItems: 'center', padding: 8, borderRadius: 8, paddingLeft: 16, paddingRight: 16 }}>
                    <Text style={{ }}>{comment_content}</Text>
                </View>
            </View>
        </View>
    )
}

class Comment extends Component{
    constructor() {
        super();
        this.bottomSheetRef = React.createRef();
    }
    state = {
        comment_list: [],
        comment_content: '',
        loading: false,
        post_data: '',
        user_data: '',
        comment_placeholder: "Add Your Comment...",
        update: false,
        hide_white: true,
        isOpenComment: false
    }

    componentDidMount() {
        
        tracker.setUser(this.state.user_data.ID)
        tracker.trackEvent("Click", "Comment")
        tracker.trackScreenView("Comment")
    
        Keyboard.addListener('keyboardDidHide', (e) => {
            if(this.bottomSheetRef && this.bottomSheetRef.current){
                // if(!config.ios){
                    this.hideKeyboard()
                // }
            }
        })
    }

    renderContent = () => {
        let { comment_list, loading, comment_content, comment_placeholder } = this.state;
        return(
            <View style={{ height: storyHeight, backgroundColor: 'white', padding: 16 }} key="0">
                <View style={{ height: storyHeight-130 }}>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        {
                            !loading?
                            comment_list.length != 0 ?
                                <FlatList 
                                    style={{ }}
                                    inverted
                                    data={comment_list}
                                    extraData={this.state}
                                    renderItem={({ item, index }) => (<CommentItem data={item} />)}
                                    keyExtractor={(i, index) => index.toString()}
                                />
                            :
                            <View></View>
                            : <ActivityIndicator size="large" color="#b21a1a" />
                        }
                    </View>
                </View>
                <View style={{ paddingTop: 8, justifyContent: 'center', borderBottomColor: comment_content ? '#B21A1A' : 'rgba(178,26,26,0.4)', borderBottomWidth: 2 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 8 }}>
                            <TextInput 
                                style={{ height: 40, color: 'black' }}
                                placeholder={comment_placeholder} 
                                onChangeText={(text) => this.setState({ comment_content: text })}
                                value={comment_content}
                                onSubmitEditing={this.onKeyboardSubmit}
                                onFocus={this.onKeyboardOpen}
                            />
                        </View>
                        <View>
                            <TouchableOpacity onPress={this.onComment}>
                                {
                                comment_content ?
                                <Image source={{ uri: 'ic_send_active' }} style={{ width: 32, height: 32 }} />
                                    :
                                <Image source={{ uri: 'ic_send_inactive' }} style={{ width: 32, height: 32 }} />
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    renderHeader = () => {
        let { hide_white } = this.state
        return(
            <View style={{ backgroundColor: hide_white ? 'black' : 'white', borderTopLeftRadius: 4, borderTopRightRadius: 4, 
            paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 8 }}>
                        <Text style={{ fontSize: 20 }}>Comments</Text>
                    </View>
                    <View style={{ flex: 2, alignItems: 'flex-end' }}>
                        <TouchableOpacity onPress={() => this.closeStory()}>
                            <Image source={{ uri: 'ic_close_story' }} style={{ width: 24, height: 24 }} />
                        </TouchableOpacity>
                    </View>
                    
                </View>
            </View>
        )
    }

    onKeyboardOpen = () => {
        this.bottomSheetRef.current.snapTo(0);
        isKeyboardActive = true;
    }
    onKeyboardSubmit = () => {
        this.bottomSheetRef.current.snapTo(1);
        isKeyboardActive = false;
    }

    onComment = () => {
        let { comment_content, post_data, user_data, comment_list } = this.state;
        let { ID, display_name, fb_id } = user_data;
        
        tracker.trackEvent("Made", "Comment")

        if(!comment_content){
            this.setState({ comment_placeholder: "Please Add Your Comment..." })
        }else{
            if(!commenting){
                this.setState({ comment_content: '' });
                commenting = true;
                let req_data = {
                    "action": "insert",
                    "comment_content":  comment_content,
                    "user_id": ID,
                    "username": display_name,
                    "post_id": post_data.id,
                    "comment_author_url": fb_id
                }
                axios.post(config.base_api+"/all_comment.php", req_data).then((resComment) => {
                    this.setState({ comment_content: '', comment_list: resComment.data })
                    commenting = false
                    AppEventsLogger.logEvent("Comments_made")
                    // this.bottomSheetRef.current.snapTo(1)
                }).catch((err) => {
    
                })
            }
        }
        
    }

    openStory = (post_data, user_data) => {
        this.bottomSheetRef.current.snapTo(1);
        this.fetchComment(post_data, user_data);
    }

    closeStory = () => {
        Keyboard.dismiss()
        this.bottomSheetRef.current.snapTo(2)
        this.props.onCloseStory();
        this.setState({ comment_list: [], hide_white: true, isOpenComment: false })
    }

    onDragComment = () => {
        this.props.onCloseStory();
        this.setState({ comment_list: [], hide_white: true, isOpenComment: false })
    }

    hideKeyboard = () => {
        let { isOpenComment } = this.state;
        if(isOpenComment && isKeyboardActive){
            this.bottomSheetRef.current.snapTo(1)
        }
    }

    fetchComment(post_data, user_data) {
        let { id } = post_data;
        this.setState({ loading: true, post_data, user_data, hide_white: false, isOpenComment: true })
        if(!user_data.display_name){
            this.fetchUserDetails(user_data.ID)
        }
        axios.post(config.base_api + '/all_comment.php', { action: "fetch", post_id: id }).then((resComment) => {
            let { data } = resComment;
            if(data.length != 0){
                this.setState({ comment_list: data, loading: false });
            }else{
                this.setState({ loading: false })
            }
        }).catch((err) => {
            // console.log(err)
        })
    }

    fetchUserDetails(user_id) {
        axios.get(config.base_api+ '/user.php?uid='+user_id).then((resUser) => {
            this.setState({ user_data: resUser.data })
            config.no_story_ads = resUser.data.ads_num
        }).catch(() => {

        })
    }

    render() {

        return(
            <View style={{ flex: 1 }}>
                <BottomSheet
                    ref={this.bottomSheetRef}
                    snapPoints = {[heightForKeyboard, storyHeight, 0]}
                    initialSnap={2}
                    renderContent={this.renderContent}
                    renderHeader={this.renderHeader}
                    enabledGestureInteraction={true}
                    enabledContentTapInteraction={true}
                    enabledContentGestureInteraction={false}
                    enabledInnerScrolling={true}
                    onCloseEnd={this.onDragComment}
                />
            </View>
        )
    }
}

export default Comment