import React, { Component } from 'react';
import { View, Text, Alert, Image, Linking, BackHandler, StyleSheet } from 'react-native';
import BottomSheet from 'reanimated-bottom-sheet'
import AsyncStorage from '@react-native-community/async-storage';
import { StackActions, NavigationActions } from 'react-navigation';
import AndroidOpenSettings from 'react-native-android-open-settings'
import { AppEventsLogger } from "react-native-fbsdk";

import config from '../config';
import { TouchableComponent } from '../common/Press';
let isOpen = false;

const MenuItem = (props) => {
  let { name, itemPress } = props
  return (
    <TouchableComponent onPress={itemPress} style={{ paddingTop: 10 }}>
      <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', fontFamily: 'Exo-SemiBold' }}>{name}</Text>
    </TouchableComponent>
  )
}

const Profile = (props) => {
  let { display_name, fb_id } = props.user
  let profile_image = fb_id.length < 35 ? `https://graph.facebook.com/${fb_id}/picture?type=large` : 'default_profile_icon';
  let first_name = display_name ? display_name.split(' ') : '';
  return (
    <View style={{ paddingBottom: 16, alignItems: 'center' }}>
      <Image
        source={{ uri: fb_id ? profile_image : 'default_profile_icon' }}
        style={{ width: 120, height: 120, borderRadius: 60 }}
      />
      <View style={{ paddingTop: 8 }}>
        <Text style={{ alignSelf: 'center', fontSize: 18, color: 'white', fontWeight: '600', fontFamily: 'Exo-SemiBold' }}>
          Welcome, {first_name[0]}!
                </Text>
      </View>
    </View>
  )
}

class Menu extends Component {
  state = {
    user_data: '',
    isPro: false,
    showGoPro: true
  }

  onRateUs = () => {
    AppEventsLogger.logEvent("RateUs_click");
    if (config.ios) {
      Linking.openURL('https://apps.apple.com/us/app/wrestlefeed/id1398253505')
    } else {
      Linking.openURL('https://play.google.com/store/apps/details?id=com.wrestlefeed')
    }
  }

  onLogout = () => {
    Alert.alert(
      'Logout',
      'Do you really want to logout? ',
      [
        { text: 'No!', onPress: () => { } },
        { text: 'Yes, I do.', onPress: () => this.removeAndSend() },
      ]
    );
  }

  removeAndSend() {
    this.bottomSheetRef.current.snapTo(1);
    AsyncStorage.removeItem('uid').then((uid) => {
      let resetAction = StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({ routeName: 'Welcome' })
        ],
      });
      this.props.navigation.dispatch(resetAction);
    });
  }

  onNotification() {
    AppEventsLogger.logEvent("Notifications_click");
    if (config.ios) {
      Linking.openURL('app-settings:')
    } else {
      AndroidOpenSettings.appNotificationSettings();
    }
  }

  onWrestleMoney(user_data, navigation) {
    if (this.state.isPro) {
      navigation.navigate("WrestleMoney", user_data)
      this.closeStory()
    }
    else {
      this.setState({ showGoPro: true })
    }
  }

  onExitApp() {
    BackHandler.exitApp()
  }

  goToContactUs(user_data, navigation) {
    if (user_data) {
      navigation.navigate("ContactUs", user_data)
      this.closeStory()
    }
  }

  renderContent = () => {
    let { user_data } = this.state
    let navigation = this.props.navigation;
    return (
      <React.Fragment>
        <View style={{ height: 550, backgroundColor: '#212121' }}>
          <View style={{ height: 440 }}>
            <View style={{ alignItems: 'center' }}>
              {
                user_data ?
                  <Profile user={user_data} />
                  // : <ActivityIndicator size="large" />
                  : null
              }
            </View>
            <View style={{ alignItems: 'center' }}>
              <MenuItem
                name="WrestleMoney"
                itemPress={() => this.onWrestleMoney(user_data, navigation)}
              />

              <MenuItem
                name="Privacy Policy" // / GDPR
                itemPress={() => navigation.navigate("FullWebview", 'https://app.wwfoldschool.com/privacy-policy/')}
              />
              {/* <MenuItem
              name="WWF Old School"
              itemPress={() => Linking.openURL('https://wwfoldschool.com/')}
            /> */}
              <MenuItem
                name="Notifications"
                itemPress={() => this.onNotification()}
              />
              <MenuItem name="Contact Us" itemPress={() => this.goToContactUs(user_data, navigation)} />
              <MenuItem name="Rate Us" itemPress={this.onRateUs} />
              <MenuItem name="Logout" itemPress={this.onLogout} />
              {
                !config.ios ?
                  <MenuItem name="Exit" itemPress={() => this.onExitApp()} />
                  : null
              }
            </View>
          </View>
          <View style={{ paddingLeft: 60, paddingRight: 60, height: 110, paddingTop: 16, }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Text style={{ fontSize: 30, fontFamily: config.ios ? 'Eurostile' : 'Eurostile-Bold', color: '#b21a1a' }}>Wrestle</Text>
              <Text style={{ fontSize: 30, fontFamily: config.ios ? 'Eurostile' : 'Eurostile-Bold', color: 'white' }}>Feed</Text>
            </View>
          </View>
        </View>

        {
          this.state.showGoPro && <View style={{ ...StyleSheet.absoluteFill, backgroundColor: 'white' }}>

          </View>
        }
      </React.Fragment>
    )
  }

  renderHeader = () => {
    return (
      <View style={{
        backgroundColor: isOpen ? '#212121' : 'black', borderTopLeftRadius: 16, borderTopRightRadius: 16,
        paddingLeft: 16, paddingRight: 16, paddingTop: 8
      }}>
        <View style={{ alignItems: 'center', paddingBottom: 16 }}>
          <View style={{ width: 64, height: 6, backgroundColor: 'white', borderRadius: 8 }}></View>
        </View>
      </View>
    )
  }

  openStory = (user_data) => {
    if (isOpen) {
      this.bottomSheetRef.current.snapTo(1);
      isOpen = false
    } else {
      this.bottomSheetRef.current.snapTo(0);
      isOpen = true;
    }
    this.setState({ user_data })
  }

  closeStory = () => {
    this.bottomSheetRef.current.snapTo(1)
    this.props.onCloseStory();
    isOpen = false
  }

  onCloseMenu = () => {
    this.props.onCloseStory();
    isOpen = false
  }

  // componentDidUpdate = () => {
  //   let { user_data } = this.state
  //   let navigation = this.props.navigation;
  //   this.onWrestleMoney(user_data, navigation)
  // }

  render() {
    this.bottomSheetRef = React.createRef();
    return (
      <View style={{ flex: 1 }}>
        <BottomSheet
          ref={this.bottomSheetRef}
          snapPoints={[550, 0]}
          initialSnap={1}
          renderContent={this.renderContent}
          renderHeader={this.renderHeader}
          enabledGestureInteraction={true}
          enabledContentTapInteraction={true}
          // enabledContentGestureInteraction={false}
          // enabledInnerScrolling={false}
          onCloseEnd={this.onCloseMenu}
        />
      </View>
    )
  }
}

export default Menu;