import React from 'react';
import { View, Text, Dimensions, Platform, Image } from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';
import YouTube from 'react-native-youtube';
import YoutubePlayer from "react-native-youtube-iframe";
import config from '../config';

let { height, width } = Dimensions.get('window');

export const StoryNavbarLogo = (props) => {
    let { dark_mode } = props
    return(
        <View style={{ flex: 4, flexDirection: 'row' }}>
            <Text style={{ fontSize: 20, fontFamily: config.ios ? 'Eurostile' : 'Eurostile-Bold', color: '#b21a1a' }}>Wrestle</Text>
            <Text style={{ fontSize: 20, fontFamily: config.ios ? 'Eurostile' : 'Eurostile-Bold', color: dark_mode ? 'white' : 'black' }}>Feed</Text>
        </View>
    )
}

export const StoryText = (props) => {
    let { text, dark_mode } = props
    return(
        <View style={{ paddingBottom: 4, paddingTop: 4 }}>
            <Text style={{ fontSize: 18, color: dark_mode ? 'white' :'#333' }}>{text}</Text>
        </View>
    )
}

export const StoryAdvanceText = (props) => {
    let { final_text, dark_mode, is_em } = props
    return(
        <View style={{ paddingBottom: 4, paddingTop: 4, }}>
            <Text style={{ fontSize: 18, color: dark_mode ? 'white' :'#333' }}>
            {
                final_text.map((d, i) => {
                    return(
                        d.text_type == "strong" ?
                        <Text key={i} style={{ fontSize: 16, color: dark_mode ? 'white' :'#333', fontFamily: is_em ? 'LibreFranklin-BoldItalic' : 'LibreFranklin-Bold' }}>{d.text}</Text>
                        : <Text key={i} style={{ fontSize: 16, color: dark_mode ? 'white' :'#333', fontFamily: is_em ? 'LibreFranklin-Italic' : 'LibreFranklin-Regular' }}>{d.text}</Text>
                    )
                })
            }
            </Text>
        </View>
    )
}

export const BridPlayer = (props) => {
    let { player_id, video_id } = props;        
    return(
        <View style={{ flex: 1, paddingBottom: 16 }}>
            <AutoHeightWebView
                androidHardwareAccelerationDisabled={false}
                allowsFullscreenVideo={true}
                mediaPlaybackRequiresUserAction={true}
                onSizeUpdated={(size => { })}
                scrollEnabled={false}
                allowsInlineMediaPlayback={true}
                hasIframe={true}
                domStorageEnabled={true}
                scalesPageToFit={Platform.OS === 'Android' ? true : false}
                heightOffset={5}
                style={{ flex: 1, width: width-32, opacity: 0.99 }}
                source={{ uri: config.base_api+ `/brid_player.php?p_id=${player_id}&v_id=${video_id}&full=true` }}
            />
        </View>
    )
}

export const Twitter = (props) => {
    const script = `
        <div id="tweet_div" class="tweet_body" >
            <div id="tweet" tweetID="${props.tweet_id}"></div>
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
                theme        : 'dark'    // or dark
                })
                .then (function (el) {
                //el.contentDocument.querySelector(".footer").style.display = "none";
                var tweet = document.getElementById("tweet");
                document.tilte = tweet.offsetHeight;
                document.clientHeight = tweet.clientHeight;
                var tweet_div = document.getElementById("tweet_div");
                tweet_div.style.height = document.clientHeight+30
                tweet_div.userSelect = 'none';
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
        <View style={{ flex: 1 }} >
            <AutoHeightWebView
                androidHardwareAccelerationDisabled={false}
                onSizeUpdated={(size => { })}
                scrollEnabled={false}
                domStorageEnabled={true}
                hasIframe={true}
                scalesPageToFit={Platform.OS === 'Android' ? true : false}
                heightOffset={5}
                style={{ width: Dimensions.get('window').width-32, opacity: 0.99 }}
                source={{ html: script }}
                customStyle={`
                    * { -webkit-user-select: none; }
                    .tweet_body {
                        -webkit-touch-callout: none;
                        -webkit-user-select: none;
                        -khtml-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                        outline: 0;
                    }
                `}
            />
        </View>
    )
}

export const YouTubeVideo = (props) => {
    return(
        <View style={{ flex: 1 }}>
            <AutoHeightWebView
                androidHardwareAccelerationDisabled={false}
                allowsFullscreenVideo={true}
                mediaPlaybackRequiresUserAction={true}
                onSizeUpdated={(size => { })}
                scrollEnabled={false}
                domStorageEnabled={true}
                javaScriptEnabled={true}
                hasIframe={true}
                scalesPageToFit={Platform.OS === 'Android' ? true : false}
                heightOffset={5}
                style={{ alignSelf: 'stretch', width: width-32, opacity: 0.99, height: 300 }}
                source={{ html: `<iframe id="ytplayer" type="text/html" width="${width-32}" height="300" allowfullscreen="allowfullscreen" 
                src="https://www.youtube.com/embed/${props.youtube_id}?autoplay=0&fullscreen=1&showinfo=0"
                frameborder="0"></iframe>` }}
            />
        </View>
    )
}

export const Instagram = (props) => {
    return(
        <View style={{ flex: 1 }}>
            <AutoHeightWebView
                androidHardwareAccelerationDisabled={false}
                allowsFullscreenVideo={true}
                mediaPlaybackRequiresUserAction={true}
                onSizeUpdated={(size => { })}
                scrollEnabled={false}
                domStorageEnabled={true}
                javaScriptEnabled={true}
                hasIframe={true}
                scalesPageToFit={Platform.OS === 'Android' ? true : false}
                heightOffset={5}
                style={{ alignSelf: 'stretch', width: width-32, opacity: 0.99 }}
                source={{ html: `${props.content}` }}
            />
        </View>
    )
}

export const StoryImage = (props) => {
    let { img_height, img_width, img_url } = props;
    let aspect_ration = img_width/img_height
    let new_height = (width-32)/aspect_ration;
    return(
        <View style={{ flex: 1 }}>
            <Image resizeMode="contain" source={{ uri: img_url }} style={{ width: width-32, height: new_height }} />
        </View>
    )
}

export const StoryEM = (props) => {
    let { dark_mode, text } = props
    return(
        <View style={{ paddingBottom: 4, paddingTop: 4 }}>
            <Text style={{ fontSize: 18, color: dark_mode ? 'white' : '#333', fontStyle: 'italic' }}>“{text}”</Text>
        </View>
    )
}