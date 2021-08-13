import React, { useEffect } from 'react'
import {
  Linking, View, Text, StyleSheet,
  TouchableOpacity, Platform, ImageBackground
} from 'react-native'
import Error from './Error'
import { RenderLoading } from '../../common/Component';
import bg from '../../assets/images/bg.png'
import connect from '../../connector';
import { tracker } from '../../tracker';

const Main = (props) => {
  const { navbar, funcs, backHandler, updateData, setActive } = props
  const [errorText, setErrorText] = React.useState('')

  const cancelSubscription = () => {
    // TO DO : how to get if the user was really unsubscribed? 
    tracker.trackEvent('Click', 'Cancel_sub')
    
    props.unsubscribe(props.user.ID)
    if(Platform.OS === 'ios')
      Linking.openURL('https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/manageSubscriptions')
    else if(Platform.OS === 'android')
      Linking.openURL('https://play.google.com/store/account/subscriptions?package=com.wrestlefeed&sku=wf_20_pro_user')
  }

  return (
    <View style={{ flex: 1 }}>
      {navbar}
      <ImageBackground source={bg} style={styles.WrestleMoney}>
        <View style={styles.buttons}>
          {
            funcs
              .filter(({ nobutton }) => !nobutton)
              .map((func, i) => {
                const { title, condition, errorText } = func
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.button}
                    onPress={_ => {
                      if (condition && !condition()) {
                        setErrorText(errorText)
                        backHandler.current = _ => {
                          setErrorText('')
                          backHandler.current = null
                        }
                      }
                      else setActive({ ...func })
                    }}
                  >
                    <Text style={styles.btnText}>{title}</Text>
                  </TouchableOpacity>
                )
              })
          }
        </View>
        {
          (!!errorText && errorText === 'Loading') &&
          <RenderLoading color='white' withoutText />
        }
        {
          (!!errorText && errorText !== 'Loading') &&
          <Error text={errorText} close={backHandler.current} />
        }
        {
          props.subs && props.subs.isPro &&
          <TouchableOpacity style={{ position: 'absolute', left: 0, right: 0, bottom: 60 }} onPress={cancelSubscription}>
            <Text style={[styles.btnText, { fontSize: 14, color: '#d7d4d4' }]}>Cancel my subscription</Text>
          </TouchableOpacity>
        }
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  WrestleMoney: {
    flex: 1,
    backgroundColor: '#212121',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttons: {
    flexDirection: 'column'
  },
  button: {
    borderRadius: 30,
    backgroundColor: '#b21a1a',
    marginVertical: 15,
    paddingHorizontal: 40,
    paddingVertical: 15,
    justifyContent: 'center',
    opacity: 0.8
  },
  btnText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 27,
    fontFamily: Platform.OS == 'ios' ? 'Eurostile' : 'Eurostile-Bold'
  },
})

export default connect(Main)
