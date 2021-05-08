import React, { Component } from 'react';
import { View, Text, Dimensions, ImageBackground } from 'react-native';
import BottomSheet from 'reanimated-bottom-sheet'
import { TouchableOpacity, TextInput, ScrollView } from 'react-native-gesture-handler';
import AutoHeightWebView from 'react-native-autoheight-webview';
import SplashScreen from 'react-native-splash-screen';

import Animated, { debug } from 'react-native-reanimated';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

let { Value, event, cond, set, clockRunning, Clock, spring, startClock, stopClock, eq } = Animated

let { width, height } = Dimensions.get('window')
const bridgeJs = `
     (function ready() {
       function whenRNPostMessageReady(cb) {
         var body = document.getElementsByTagName("body")[0];
         var offsetHeight  = body.offsetHeight;
         if (offsetHeight === 0 ){
            setTimeout(function() {
               whenRNPostMessageReady(cb);
             }, 10);
          } else {
            cb();
          }
        }
       whenRNPostMessageReady(function() {
         var body = document.getElementsByTagName("body")[0];
         var offsetHeight  = body.offsetHeight;
         var clientHeight = body.clientHeight;
         postMessage(clientHeight);
       });
     })();`;



    function runSpring(clock, value, velocity, dest) {
        const state = {
            finished: new Value(0),
            velocity: new Value(0),
            position: new Value(0),
            time: new Value(0)
        };
        
        const config = {
            damping: 18,
            mass: 1,
            stiffness: 121.6,
            overshootClamping: false,
            restSpeedThreshold: 0.001,
            restDisplacementThreshold: 0.001,
            toValue: new Value(0)
        };
        
        return [
            cond(clockRunning(clock), 0, [
            set(state.finished, 0),
            set(state.velocity, velocity),
            set(state.position, value),
            set(config.toValue, dest),
            startClock(clock)
            ]),
            spring(clock, state, config),
            cond(state.finished, stopClock(clock)),
            state.position
        ];
    }



export default class BottomSheetTest extends Component{
    constructor() {
        super()
        this.scale = new Animated.Value(1)   
        this.pinchState = new Animated.Value(0);
        this.velocity = new Animated.Value(1);
        this.onZoomEvent = event([
            {
                nativeEvent: { scale: this.scale, State: this.pinchState, velocity: this.velocity }
            }],
            { useNativeDriver: true }
        )     

        // this.scale = cond(eq(this.pinchState, State.ACTIVE), [
        //     set(this.scale, runSpring(new Clock(), this.scale, this.velocity, 1)),
        //     this.scale
        // ])
    }
    
    

    onZoomStateChange = event => {
        console.log(event.nativeEvent);
        let { velocity, scale, oldState } = event.nativeEvent
        this.scale = cond(eq(oldState, State.ACTIVE), [
            // debug("ss", oldState),
            set(this.scale, runSpring(new Clock(), scale, velocity, 1)),
            this.scale
        ])
        // if (event.nativeEvent.oldState === State.ACTIVE) {
            // this.scale.setValue(1)
            
            
        //   Animated.spring(this.scale, {
        //     toValue: 1,
        //     useNativeDriver: true
        //   }).start()
        // }
    }

    componentDidMount() {
        SplashScreen.hide()
    }

    renderContent = () => {
        return(
            <View style={{ height: 600, backgroundColor: 'white' }}>
                <AutoHeightWebView
                    ref='WweNews'
                    androidHardwareAccelerationDisabled={true}
                    style={{ flex: 1, width: width-32 }}
                    source={{ uri: 'https://app.wwfoldschool.com/on-this-day-in-wwf-history-june-13-1998-wwf-shotgun-saturday-night/' }}
                    javaScriptEnabled={true}
                    injectedJavaScript={bridgeJs}
                    domStorageEnabled
                    startInLoadingState
                    onMessage={event => {
                        console.log('onMessage', event.nativeEvent);
                    }}
                    scrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    // automaticallyAdjustContentInsets={false}
                    // renderLoading={this.renderLoading}
                />
            </View>
        )
    }
    renderHeader = () => {
        return(
            <View>
                <Text>Header</Text>
            </View>
        )
    }
    render(){
        this.bottomSheetRef = React.createRef();
        return(
            <View style={{ flex: 1, backgroundColor: 'black' }}>
                {/* <TouchableOpacity onPress={() => this.bottomSheetRef.current.snapTo(0)}>
                    <Text style={{ paddingTop: 16, color: 'white', fontSize: 30 }}>sss</Text>
                </TouchableOpacity> */}
                {/* <BottomSheet
                    ref={this.bottomSheetRef}
                    snapPoints = {[600, 0]}
                    initialSnap={1}
                    renderContent={this.renderContent}
                    renderHeader={this.renderHeader}
                    enabledGestureInteraction={true}
                    enabledContentTapInteraction={true}
                    enabledContentGestureInteraction={false}
                    enabledInnerScrolling={false}
                /> */}
                
                
                {/* <PinchGestureHandler
                    onGestureEvent={this.onZoomEvent}
                    onHandlerStateChange={this.onZoomEvent}
                >
                    <Animated.ScrollView style={{ width: 600, height }} >
                    <Animated.Image
                        source={{
                            uri: 'https://miro.medium.com/max/1080/1*7SYuZvH2pZnM0H79V4ttPg.jpeg'
                        }}
                        style={{
                            width: width,
                            height: 300,
                            transform: [{ scale: this.scale }]
                        }}
                        resizeMode="contain"
                    />
                    </Animated.ScrollView>
                </PinchGestureHandler> */}
                <ImageBackground 
                    style={{ width, height }} 
                    source={{ uri: 'https://miro.medium.com/max/1080/1*7SYuZvH2pZnM0H79V4ttPg.jpeg' }}
                >

                </ImageBackground>
            </View>
        )
    }
}