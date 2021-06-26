import React, { useEffect } from 'react'
import {
  View, Text, StyleSheet,
  TouchableOpacity, Platform, ImageBackground
} from 'react-native'
import Error from './Error'
import { RenderLoading } from '../../common/Component';
import config from '../../config';
import bg from '../../assets/images/bg.png'
import connect from '../../connector';
import RNIap from 'react-native-iap'

const itemSkus = Platform.select({
  android: [
    'wf_20_pro_user'
  ]
})

const Main = (props) => {
  const { navbar, funcs, backHandler, updateData, setActive } = props
  const [errorText, setErrorText] = React.useState('')

  useEffect(() => {
    (async () => {
      try {
        await RNIap.initConnection()
        const products = await RNIap.getSubscriptions(itemSkus)
        const subs = await RNIap.getAvailablePurchases()
      } catch (err) {
        console.warn(err)
      }
    })()
    updateData()
  }, [])
  
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
                    <Text style={[styles.btnText, { fontFamily: config.ios ? 'Eurostile' : 'Eurostile-Bold' }]}>{title}</Text>
                  </TouchableOpacity>
                )
              })
          }
          {
            props.subs && props.subs.isPro &&
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.btnText, { fontFamily: config.ios ? 'Eurostile' : 'Eurostile-Bold' }]}>Cancel my subscription</Text>
            </TouchableOpacity>
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
