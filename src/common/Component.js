import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Dimensions, ImageBackground, Platform, PixelRatio } from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';
import LinearGradient from 'react-native-linear-gradient';
import ViewPager from '@react-native-community/viewpager';
import Animated, {  } from 'react-native-reanimated';
import DeviceInfo from 'react-native-device-info';

import config from '../config';
import { allStyle } from '../allStyles';
import Wrestlefeed from './Wrestlefeed';
import { TouchableComponent } from './Press';
import PinchImage from '../timeline/PinchImage';

let { width, height } = Dimensions.get('screen');
let minScreenSize = 390
let notch = DeviceInfo.hasNotch();
let reactionImgStyle = { width: width < minScreenSize ? 32 : 40, height: width < minScreenSize ? 32 : 40 }
let playBtnStyle = { width: width < minScreenSize ? 18 : 24, height: width < minScreenSize ? 18 : 24 }

const commStyle = {
    menuIconStyle: {
        justifyContent: 'center', paddingBottom: 16, paddingRight: 8, paddingTop: config.ios ? notch ? 24 : 0 : 0,
    },
    menuIconView: {
        position: 'absolute', 
        right: 0, 
        top: config.ios ? notch ? 24+30 : 36+16 : 36+16,
        zIndex: 1
    },
    playBtnStyleView: {
        flexDirection: 'row', 
        backgroundColor: '#b21a1a', 
        alignItems: 'center',
        padding: 8, 
        paddingLeft: width < minScreenSize ? 12 : 16, 
        paddingRight: width < minScreenSize ? 12 : 16,
        borderRadius: 2
    }
}

export const TabLabel = (props) => {
    let { status, name, onPress, newPost } = props
    let { tabBG, activeTab, inActiveTab } = allStyle
    name = name != "OldSchool" ? name : "Old School"
    return(
        <View style={{ flex: 1 }}>
            {
                newPost ?
                <View style={{ alignItems: 'flex-end', marginBottom: -8, zIndex: 100, elevation: 100 }}>
                    <View style={{ backgroundColor: '#16ef2a', width: 10, height: 10, borderRadius: 5 }}></View>
                </View>
                : null
            }
            <TouchableOpacity onPress={onPress} style={[tabBG, {  }, status ? { backgroundColor: 'white' }: { backgroundColor: '#b21a1a' }]}>
                <Text style={status ? activeTab: inActiveTab}>{name.toUpperCase()}</Text>
            </TouchableOpacity>
        </View>
    )
}

export const MenuIcon = (props) => {
    let { onMenuPress, smallMenu } = props
    return(
        <TouchableOpacity onPress={onMenuPress} style={{ justifyContent: 'center', paddingBottom: 16, paddingRight: 8, paddingTop: config.ios ? notch ? 24 : 0 : 0, }}>
            <Image source={{ uri: 'menu_square_logo' }} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
    )
}

export const RefreshIcon = (props) => {
    let { onRefreshPress, status, hideMenu } = props
    if(hideMenu){
        return null
    }else{
        return(
            <View style={commStyle.menuIconView} >
                {
                    status ?
                    <View style={commStyle.menuIconStyle}>
                        <ActivityIndicator size="small" color="#b21a1a" />
                    </View>
                    :
                    <TouchableOpacity onPress={onRefreshPress} style={commStyle.menuIconStyle}>
                        <Image source={{ uri: 'refresh_btn' }} style={{ width: 28, height: 28 }} />
                    </TouchableOpacity>
                }
            </View>
        )
    }
}

export const PleaseWait = () => {
    return(
        <Animated.View key="10000" style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontSize: 20, fontFamily: config.ios ? 'Eurostile' : 'Eurostile-Bold' }}>Please wait...</Text>
            </View>
        </Animated.View>
    )
}

export const UserButton = (props) => {
    let { loading, textColor } = props
    return(
        <>
            {
                !loading ?
                <TouchableOpacity 
                    onPress={props.onPress}
                    style={{ backgroundColor: props.btnColor, alignItems: 'center', paddingBottom: 12, paddingTop: 12, borderRadius: 4 }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{props.name}</Text>
                </TouchableOpacity>
            :
                <View>
                    <ActivityIndicator size="large" color="#b21a1a" />
                </View>
            }
        </>
    )
}

export const BackWithText = (props) => {
    return(
        <TouchableOpacity
            onPress={props.onPress}
            style={{ flexDirection: 'row', paddingLeft: 16, alignItems: 'center', paddingTop: config.ios ? 0 : 16 }}
        >
            <Image source={{ uri: 'ic_arrow_back_white' }} style={{ width: 16, height: 16 }} />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '800', paddingLeft: 8 }}>{props.text}</Text>
        </TouchableOpacity>
    )
}

export const Twitter = (props) => {
    let { onReactionPress } = props
    let { post_image_url, post_title, no_title, reaction, react_user  } = props.data
    const sourceTweetId = post_image_url;
    const screen_bar_height = (height-30-32)/20;
    const height_tweet = screen_bar_height*16;
    let flex_tweet = 20;
    let flex_title = 5;
    if(post_title.length > 70){
        flex_title = 7
        flex_tweet = 18
    }
    const script = `
    <div id="tweet_div" style="display: flex; height: ${height_tweet}; justify-content: flex-end; flex-direction: column;"  >
        <div style="">
            <div style="padding-bottom: 50px; background-color: #15202b;" >
                <div id="tweet" tweetID="${sourceTweetId}"></div>
            </div>
        </div>
    </div>
		  <script sync src="https://platform.twitter.com/widgets.js"></script>
		  <script>
		    function mainLoadTweet(){
		      var tweet = document.getElementById("tweet");
		      var id = tweet.getAttribute("tweetID");
		      twttr.widgets.createTweet(
		        id, tweet,
		        {
		          conversation : 'none',    // or all
		          cards        : 'visible',  // or visible
		          linkColor    : '#cc0000', // default is blue
		          theme        : 'light'    // or dark
		        })
		        .then (function (el) {
		        //el.contentDocument.querySelector(".footer").style.display = "none";
		        var tweet = document.getElementById("tweet");
		        document.tilte = tweet.offsetHeight;
                document.clientHeight = tweet.clientHeight;
                var tweet_div = document.getElementById("tweet_div");
                tweet_div.style.height = document.clientHeight+60
                setTimeout(() => {
                    tweet_div.style.height = document.clientHeight+60
                }, 1000)
		      });
		    }
		    if (window.loaded) {
		      mainLoadTweet()
		    } else {
		      window.onload = mainLoadTweet
		    }
		  </script>
	`;
    return(
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ position: 'absolute', bottom: 8, left: 16, right: 16, zIndex: 1 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 4 }}>
                            <ReactionBtns reaction={reaction} react_user={react_user} onReactionPress={(type) => onReactionPress(type)} btn_opacity={0.5} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Sidebar onCommentPress={props.onCommentPress}/>
                        </View>
                        <View style={{ flex: 2 }}></View>
                    </View>
                </View>
                <View style={{ flex: 1 }}></View>
                <View style={{ flex: flex_title, justifyContent: 'flex-end', paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 16 }}>
                    {
                        no_title == "No" || no_title == '' ? 
                        <Text style={{ color: 'white', fontFamily: 'Merriweather-Black', fontSize:  Wrestlefeed.normalizeText(22), fontWeight: '600' }} >
                            {post_title}
                        </Text>
                        : null
                    }
                </View>
                <View style={{ flex: flex_tweet, justifyContent: 'flex-end',}} pointerEvents="none">
                <AutoHeightWebView
                    androidHardwareAccelerationDisabled={true}
                    style={{  }}
                    onSizeUpdated={(size => { })}
                    scrollEnabled={false}
                    hasIframe={true}
                    scalesPageToFit={Platform.OS === 'Android' ? true : false}
                    heightOffset={5}
                    style={{ width: Dimensions.get('window').width-32, height: height_tweet, }}
                    source={{ html: script }}
                    onError={(err) => {  }}
                    onLoad={() => {}}
                    onLoadStart={() => {}}
                    onLoadEnd={() => {}}
                    onNavigationStateChange={() => {}}
                    onShouldStartLoadWithRequest={result => {
                        return true;
                    }}
                    customStyle={`p { font-size: 1.14em;}`}
                />
            </View>
                
        </View>
    )
}

export const PostTitle = (props) => {
    let { no_title, post_title } = props;
    return(
        <>
            {
                no_title == "No" || no_title == '' ? 
                <Text style={{ 
                    fontFamily: 'Merriweather-Black',
                    textShadowColor: '#212121', 
                    textShadowOffset: { width: -1, height: 1 }, 
                    textShadowRadius: 10,
                    color: 'white', 
                    fontSize: Wrestlefeed.normalizeText(22),
                    fontWeight: '600'
                }}>
                    {post_title}
                </Text>
                : null
            }
        </>
    )
}

export const PostTime = (props) => {
    let { post_date, post_title } = props;
    let time_posted = Wrestlefeed.getFormatDate(post_date)
    if(post_title && post_title.length > 110){
        return null
    }
    return(
        <View style={{ backgroundColor: 'rgba(178,26,26,0.5)', paddingBottom: 2, paddingTop: 0, paddingLeft: 8, paddingRight: 8, borderRadius: 2 }}>
            <Text style={{ fontSize: Wrestlefeed.normalizeText(14), color: 'white', fontWeight: 'bold' }}>
                {time_posted}
            </Text>
        </View>
    )
}

export const ReactionImage = (props) => {
    let { img_name, status, onPress, num, showText, btn_opacity } = props
    return(
        <View style={{ flex: 2, opacity: status ? 1 : btn_opacity }}>
            <TouchableOpacity onPress={onPress}>
                <Image source={{ uri: img_name }} style={reactionImgStyle} />
                {showText ? <Text style={{ color: 'white', paddingLeft: 14, fontSize: 16 }}>{num}</Text> : null}
            </TouchableOpacity>
        </View>
    )
}

export const ReactionBtns = (props) => {
    let { onReactionPress, reaction, react_user, btn_opacity } = props;
    let react_type = ""
    if(react_user){
        react_type = react_user.reaction_type
    }
    const showText = react_type ? true : false
    return(
        <View>
            <View style={{ flexDirection: 'row' }}>
                <ReactionImage 
                    img_name="love" num={reaction.love} showText={showText}
                    status={react_type == "love" ? true : false} 
                    onPress={() => onReactionPress('love')} 
                    btn_opacity={btn_opacity}
                />
                <ReactionImage 
                    img_name="hmm" num={reaction.angry} showText={showText}
                    status={react_type == "angry" ? true : false} 
                    onPress={() => onReactionPress('angry')} 
                    btn_opacity={btn_opacity}
                />
                <ReactionImage 
                    img_name="haha" num={reaction.haha} showText={showText}
                    status={react_type == "haha" ? true : false} 
                    onPress={() => onReactionPress('haha')} 
                    btn_opacity={btn_opacity}
                />
                <ReactionImage 
                    img_name="sad" num={reaction.sad} showText={showText}
                    status={react_type == "sad" ? true : false} 
                    onPress={() => onReactionPress('sad')} 
                    btn_opacity={btn_opacity}
                />
            </View>
        </View>
    )
}

export const PlayButton = (props) => {
    return(
        <TouchableComponent onPress={props.onReadMorePress} style={[commStyle.playBtnStyleView]}>
            <View style={{  paddingRight: 8 }}>
                <Image source={{ uri: 'btn_play' }} style={playBtnStyle} />
            </View>
            <Text style={{ fontSize: width < minScreenSize ? 12 : 16, color: 'white', fontWeight: 'bold' }}>Play</Text>
        </TouchableComponent>
    )
}

export const ReadMoreButton = (props) => {
    return(
        <TouchableComponent onPress={props.onReadMorePress} style={{ backgroundColor: '#b21a1a', padding: 8, borderRadius: 2 }}>
            <Text style={{ fontSize: width < minScreenSize ? 12 : 16, color: 'white', fontWeight: 'bold' }}>Read More</Text>
        </TouchableComponent>
    )
}

export const Stories = (props) => {
    let { data, onReadMorePress, onCommentPress, onReactionPress, category } = props;
    let { post_title, short_desc, post_image_url, isStory, post_date, no_title, image_resize, reaction, react_user } = data;
    return(
        <ImageBackground source={{ uri: post_image_url }} resizeMode={image_resize} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <LinearGradient 
                colors={['transparent', 'rgba(0,0,0,1)']} style={{ flex: 1,  }} 
                start={{x: 0, y: 0.6}} 
                end={{x: 0, y: 0.8}} 
            >
                <View style={{ flex: 5 }}></View>
                <View style={{ flex: 6, paddingLeft: 16, paddingRight: 16, justifyContent: 'flex-end' }}>
                    <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'flex-end', paddingBottom: 2 }}>
                        <PostTime post_date={post_date} post_title={post_title} />
                    </View>
                    <View>
                        <PostTitle no_title={no_title} post_title={post_title} />
                    </View>
                    {
                        short_desc ?
                        <View style={{ paddingTop: 16 }}>
                            <Text style={{ fontFamily: 'Roboto-Italic', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)',
                             fontSize: Wrestlefeed.normalizeText(14), fontWeight: '400', padding: 4 }}>
                                {short_desc}
                            </Text>
                        </View>
                        : <View style={{ paddingTop: 16 }}></View>
                    }
                    <View style={{ flexDirection: 'row', paddingTop: 16, paddingBottom: 32 }}>
                        <View style={{ flex: 4 }}>
                            <ReactionBtns reaction={reaction} react_user={react_user} onReactionPress={(type) => onReactionPress(type)} btn_opacity={0.5} />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Sidebar onCommentPress={onCommentPress} react_user={react_user} />
                        </View>
                        <View style={{ flex: 2, alignItems: 'flex-end' }}>
                            {
                                isStory ?
                                    category == "videos" ? <PlayButton onReadMorePress={onReadMorePress} /> : <ReadMoreButton onReadMorePress={onReadMorePress} />
                                : null
                            }
                        </View>
                    </View>
                </View>
                </LinearGradient>
        </ImageBackground>
    )
}

export const Sidebar = (props) => {
    let { onCommentPress, react_user } = props
    return(
        <TouchableOpacity onPress={onCommentPress} style={{ paddingBottom: react_user ? 16 : 0 }}>
            <Image 
                source={{ uri: 'ic_comment' }} 
                style={{ width: width < minScreenSize ? 36.6 : 43.5, height: width < minScreenSize ? 32 : 38 }} 
            />
        </TouchableOpacity>
    )
}

export const Navbar = (props) => {
    let { leftPress, title } = props
    return(
        <View style={allStyle.navBarStyle} >
          <View style={allStyle.menuStyle}>
              <TouchableOpacity onPress={leftPress} >
                <Image source={{ uri: 'ic_back_white' }} style={{ width: 24, height: 24 }} />
              </TouchableOpacity>
          </View>
            <View style={{ flex: 10, justifyContent: 'center' }} >
              <TouchableOpacity
                onPress={() => null}
                activeOpacity={0.7}
              >
                <Text style={{ fontFamily: config.ios ? 'Eurostile' : 'Eurostile-Bold', color: 'white', fontSize: 22, }}>
                  {title}
                </Text>
              </TouchableOpacity>
          </View>
        </View>
    )
}

export const TestGif = (props) => {
    let a = [1,2,3,4,5];
    return(
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image
                source={{ uri: config.base_api + '/gif/' + props.index +".gif" }}
                style={{ width, height: 320 }} 
            />
        </View>
    )
}

export const PollBarInput = (props) => {
    let { text, onPress, option } = props
    return(
        <TouchableOpacity 
            onPress={() => onPress(option)}
            style={{ borderColor: 'white', borderWidth: 1.5, borderRadius: 32, paddingTop: 8, paddingBottom: 8 }}
        >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>{text}</Text>
        </TouchableOpacity>
    )
}

export const PollBarResult = (props) => {
    let { text, per } = props
    return(
        <>
            <View style={{ position: 'absolute', width: '100%', height: 42, borderRadius: 32, backgroundColor: '#969696' }}></View>
            <View style={{ position: 'absolute', width: `${per*100}%`, height: 42, borderRadius: 32, backgroundColor: '#c75050' }}></View>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', top: 8 }}>{text} - {parseFloat(per*100).toFixed(1)}%</Text>
        </>
    )
}

export const Poll = (props) => {
    let { data, onCommentPress, onReactionPress, onPollPress } = props;
    let { post_title, post_date, no_title, reaction, react_user, poll } = data;
    let { poll_data, poll_user } = poll
    let total = poll_data.reduce((a, b) => +a + b.count, 0)
 
    return(
        <View style={{ flex: 1, }}>
            <LinearGradient 
                colors={['transparent', 'rgba(0,0,0,1)']} style={{ flex: 1,  }} 
                start={{x: 0, y: 0.6}} 
                end={{x: 0, y: 0.8}} 
            >
                <View style={{ flex: 1 }}></View>
                <View style={{ flex: 4, paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ flex: 2 }}>
                        <View style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                            <PostTime post_date={post_date} post_title={post_title} />
                        </View>
                        <PostTitle no_title={no_title} post_title={post_title} />
                    </View>
                    {
                        poll_data.map((d, i) => {
                            return(
                                <View key={i} style={{ flex: 1 }}>
                                    { d.name ? 
                                        poll_user ? 
                                        <PollBarResult text={d.name} per={d.count != 0 ? d.count/total : 0} /> 
                                        : <PollBarInput text={d.name} option={`option_${i+1}`} onPress={() => onPollPress(i)} />
                                    : null }
                                </View>
                            )
                        })
                    }
                </View>
                <View style={{ flex: 1, paddingLeft: 16, paddingRight: 16, justifyContent: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', paddingTop: 16, paddingBottom: 32 }}>
                        <View style={{ flex: 4 }}>
                            <ReactionBtns reaction={reaction} react_user={react_user} onReactionPress={(type) => onReactionPress(type)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Sidebar onCommentPress={onCommentPress}/>
                        </View>
                        <View style={{ flex: 1 }}></View>
                    </View>
                </View>
                </LinearGradient>
        </View>
    )
}

export const PagerList = (props) => {
    let { post_list, onReadMorePress, onCommentOpen, index, pageRef, onReactionPress, onPollPress, category } = props;
    return(
        <ViewPager style={{ flex: 1 }} 
            ref={pageRef}
            initialPage={index} 
            orientation='vertical'
            onPageSelected={(e) => props.onPostChange(e.nativeEvent.position)}
        >
            {
                post_list.length != 0 ?
                post_list.map((post, index) => {
                    return(
                        <Animated.View key={index.toString()} style={{ flex: 1 }} >
                            {
                                post.post_type == "stories" && post.short_desc ?
                                    <Stories 
                                        data={post} 
                                        onReadMorePress={onReadMorePress} 
                                        onCommentPress={onCommentOpen}
                                        onReactionPress={(type) => onReactionPress(type)}
                                        category={category}
                                    />
                                : post.post_type == "twitter" ?
                                    <Twitter 
                                        data={post} 
                                        onCommentPress={onCommentOpen}
                                        onReactionPress={(type) => onReactionPress(type)}
                                    />
                                : post.post_type == "stories" && !post.short_desc ?
                                    <PinchImage 
                                        data={post} 
                                        onCommentPress={onCommentOpen}
                                        onReactionPress={(type) => onReactionPress(type)}
                                        category={category}
                                    />
                                : post.post_type == "poll" ?
                                    <Poll 
                                        data={post} 
                                        onCommentPress={onCommentOpen}
                                        onReactionPress={(type) => onReactionPress(type)}
                                        onPollPress={(poll_index) => onPollPress(poll_index)}
                                    />
                                : null
                            }
                        </Animated.View>
                    )
                })
                : null
            }
        </ViewPager>
    )
}

export const PagerListWrapper = (props) => {
    let { post_list, onReadMorePress, onCommentOpen, index, pageRef, onReactionPress, onPollPress, category } = props;
    // Alert.alert(category)
    return(
        <PagerList 
            pageRef={pageRef}
            post_list={post_list}
            index={index}
            onPostChange={(position) => props.onPostChange(position)}
            onReadMorePress={onReadMorePress}
            onCommentOpen={onCommentOpen}
            onReactionPress={(type) => onReactionPress(type)}
            onPollPress={(poll_index) => onPollPress(poll_index)}
            category={category}
        />
    )
}


