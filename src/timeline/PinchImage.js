import React, { Component } from 'react';
import Animated, { Value, cond, eq, set, lessOrEq, greaterOrEq } from 'react-native-reanimated';
import { State, PinchGestureHandler } from 'react-native-gesture-handler';
import { vec, onGestureEvent, transformOrigin, timing } from 'react-native-redash';
import { Dimensions, View } from 'react-native';
import { PostTitle, PostTime } from '../common/Component';

let { width, height } = Dimensions.get('window')

export default class PinchImage extends Component {
    constructor(){
        super();
        this.state = new Value(State.UNDETERMINED);
        this.gestureScale = new Value(1);
        this.focal = vec.createValue(0,0)
        this.origin = vec.createValue(0,0);
        this.hideDetail = new Value(0);
        
        this.gestureHandler = onGestureEvent({
            state: this.state,
            scale: this.gestureScale,
            focalX: this.focal.x,
            focalY: this.focal.y
        });
        this.scale = cond(
            eq(this.state, State.END), [
                cond(greaterOrEq(this.gestureScale, 1), [
                    timing({ from: this.gestureScale, to: 1 }),
                ],[
                    1
                ])
            ],[
                cond(
                    lessOrEq(this.gestureScale, 1), [
                        set(this.gestureScale, 1)
                    ],[
                        this.gestureScale
                    ]
                )
            ]
        )
        
        this.adjustedFocal = vec.add({ 
            x: -width / 2,
            y: -height / 2,
        }, this.focal );

        this.hideDetail = cond(
            eq(this.state, State.ACTIVE), [
                set(this.hideDetail, width)
            ]
        )
    }

    render() {
        let { gestureHandler, scale, hideDetail, adjustedFocal } = this
        let { post_title, post_image_url, post_date, image_resize, no_title } = this.props.data;
        return(
            <>
                <PinchGestureHandler {...gestureHandler}>
                    <Animated.View style={{ width, height, }}>
                        <Animated.View style={{ position: 'absolute', bottom: 16, left: 0, right: 0, zIndex: 1, paddingBottom: 35 }}>
                            <Animated.View style={{ transform: [ { translateX: hideDetail } ] }}>
                                
                                <View style={{ flex: 2, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 16 }}>
                                    <PostTime post_date={post_date} post_title={post_title} />
                                </View>
                                {
                                    post_title ?
                                    <Animated.View style={{ padding: 16, paddingBottom: 16 }}>
                                        <PostTitle post_title={post_title} no_title={no_title} />
                                    </Animated.View>
                                    : null
                                }
                            </Animated.View>
                        </Animated.View>
                        <Animated.Image 
                            style={[
                                { width, height },
                                { transform: [...transformOrigin(adjustedFocal, { scale })] }
                            ]}
                            resizeMode={image_resize}
                            source={{ uri: post_image_url }}
                        />
                    </Animated.View>
                </PinchGestureHandler>
            </>
        )
    }
}