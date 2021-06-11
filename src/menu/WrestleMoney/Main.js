import React from 'react'
import {
  View, Text, StyleSheet,
  TouchableOpacity, Platform, ImageBackground
} from 'react-native'
import { RenderLoading } from '../../common/Component';
import config from '../../config';

const Main = (props) => {
  const { navbar, funcs, backHandler, setActive } = props
  const [errorText, setErrorText] = React.useState('')
  return (
    <View style={{ flex: 1 }}>
      {navbar}
      <ImageBackground source={require('../../assets/images/bg.png')} style={styles.WrestleMoney}>
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

export default Main
