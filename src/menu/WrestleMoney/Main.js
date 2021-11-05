import React from 'react'
import {
  View, Text, StyleSheet,
  TouchableOpacity, Platform, ImageBackground
} from 'react-native'
import firebase from 'react-native-firebase'

const { Banner, AdRequest } = firebase.admob
const request = new AdRequest()

import Error from './Error'
import { RenderLoading } from '../../common/Component';
import bg from '../../assets/images/bg.png'

const Main = (props) => {
  const { navbar, funcs, backHandler, setActive, team } = props
  const [errorText, setErrorText] = React.useState('')

  console.log(team)

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
      </ImageBackground>
      <View style={{height: 70, backgroundColor: 'black'}}>
        <Banner
          style={{backgroundColor: 'black'}}
          unitId={Platform.OS === 'ios'? 'ca-app-pub-5290391503017361/1996651647' : 'ca-app-pub-5290391503017361/1801210520'} // 'ca-app-pub-5290391503017361/1801210520'}
          size={"SMART_BANNER"}
          request={request.build()}
        />
      </View>
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
