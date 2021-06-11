import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Navbar } from './Component';
import { SafeAreaView } from 'react-navigation';
import { RenderLoading } from './Component';

class FullWebview extends Component {
  
  render() {
    const NewUrl = this.props.navigation.state.params;
    const { height } = Dimensions.get('screen');
    const heightView = height - 56;
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
            <Navbar leftPress={() => this.props.navigation.goBack()} title="WrestleFeed" />
            <WebView
            ref='WweNews'
            style={{ flex: 1, height: heightView, }}
            source={{ uri: NewUrl }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => <RenderLoading/>}
            />
        </SafeAreaView>
      </View>
    );
  }
}

export default FullWebview;
