import React, { Component } from 'react';
import { View, Modal, Dimensions, Image, TouchableOpacity, Platform } from 'react-native'
import Youtube, { YouTubeStandaloneAndroid, YouTubeStandaloneIOS } from 'react-native-youtube';
import AutoHeightWebView from 'react-native-autoheight-webview';
import config from '../config';
let { height, width } = Dimensions.get('window');
class PlayVideoModal extends Component {
    state = {
        status: false,
        type: '',
        player_id: '',
        video_id: '',
        youtube_id: ''
    }

    handleStatus = (data) => {
        if(data.type == "brid"){
            let { type, player_id, video_id } = data
            this.setState({ type, player_id, video_id, status: true });
        }else{
            let { type, youtube_id } = data
            this.setState({ type, youtube_id, status: Platform.OS == 'ios' })
            if(Platform.OS === 'ios')
                YouTubeStandaloneIOS.playVideo(youtube_id)
                .then(message => console.log(message))
                .catch(errorMessage => {
                    console.error(errorMessage)
                });
            else
                YouTubeStandaloneAndroid.playVideo({
                    apiKey: 'AIzaSyA4CG8_qmW6LQ4KMAuUv-LKzbfKD-4O7J4', // Your YouTube Developer API Key
                    videoId: youtube_id, // YouTube video ID
                    autoplay: true, // Autoplay the video
                    lightboxMode: false
                  })
                .then(() => console.log('Standalone Player Exited'))
                .catch(errorMessage => console.error(errorMessage));
        }
        
    }

    render() {
        let { status, type, player_id, video_id, youtube_id } = this.state;
        return(
            <View style={{  }}>
                <Modal 
                    visible={status}
                    onRequestClose={() => this.setState({ status: false })}
                    // transparent
                >
                    <View style={{ flex: 1, backgroundColor: '#141414', paddingLeft: 8 }}>
                        {
                            type == "brid" ?
                                <View style={{flex: 1 }}>
                                    <View style={{ paddingTop: 16, paddingLeft: 16 }}>
                                        <TouchableOpacity onPress={() => this.setState({ status: false })}>
                                            <Image source={{ uri: 'ic_close_story_white' }} style={{ width: 24, height: 24 }} />
                                        </TouchableOpacity>
                                    </View>
                                        <View style={{ flex: 1, paddingTop: (height/2)-150 }}>
                                            <AutoHeightWebView
                                                androidHardwareAccelerationDisabled={false}
                                                allowsFullscreenVideo={false}
                                                mediaPlaybackRequiresUserAction={true}
                                                style={{  }}
                                                onSizeUpdated={(size => { })}
                                                scrollEnabled={false}
                                                hasIframe={true}
                                                scalesPageToFit={Platform.OS === 'Android' ? true : false}
                                                heightOffset={5}
                                                style={{ width, opacity: 0.99 }}
                                                source={{ uri: config.base_api+ `/brid_player.php?p_id=${player_id}&v_id=${video_id}&full=false` }}
                                                onError={(err) => {  }}
                                                onLoad={() => {}}
                                                onLoadStart={() => {}}
                                                onLoadEnd={() => {}}
                                                onNavigationStateChange={() => {}}
                                                onShouldStartLoadWithRequest={result => {
                                                    return true;
                                                }}
                                            />  
                                        </View>
                                </View>
                            : 
                            null
                        }
                    </View>
                </Modal>
            </View>
        )
    }
}

export default PlayVideoModal;