import React, { Component } from 'react';
import { Text, View, Dimensions, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { Navbar } from './Component';
import { SafeAreaView } from 'react-navigation';

class FullWebview extends Component {
  renderLoading() {
    return (
      <View
        style={{ flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator animating size="large" color='#b21a1a' />
        <Text style={{ fontSize: 18 }}>Please Wait...</Text>
      </View>
    );
  }
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
            // startInLoadingState
            renderLoading={this.renderLoading}
            />
        </SafeAreaView>
      </View>
    );
  }
}

export default FullWebview;
