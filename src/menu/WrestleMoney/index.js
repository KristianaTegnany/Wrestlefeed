import React from 'react'
import {
  View, Text, StyleSheet, BackHandler,
  TouchableOpacity, SafeAreaView
} from 'react-native'
import { Navbar } from '../../common/Component';
import Error from './Error';
import PointsTable from './PointsTable';
import TeamBuilder from './TeamBuilder';
import TextComponent from './TextComponent';

const _defTitle = "Wrestle Money"

const WrestleMoney = (props) => {
  const {
    navigation
  } = props
  // States
  const [active, setActive] = React.useState({title: _defTitle})
  const [errorText, setErrorText] = React.useState('')
  const goBackHome = () => {
    if(active.title === _defTitle) navigation.goBack()
    else setActive({title: _defTitle})
    return false
  }
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", goBackHome);
    return () => backHandler.remove();
  }, []);
  const Component = active.component
  return (
    <SafeAreaView style={{flex: 1}}>
      <Navbar leftPress={goBackHome} title={active.title} />
      <View style={styles.WrestleMoney}>
        <View style={styles.buttons}>
          {
            funcs(props).map((func, i) => {
              const {title, condition, errorText} = func
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.button}
                  onPress={_ => {
                    if(condition && !condition()) setErrorText(errorText)
                    else setActive({...func})
                  }}
                >
                  <Text style={styles.btnText}>{title}</Text>
                </TouchableOpacity>
              )
            })
          }
        </View>
        { Component && <Component/> }
        { !!errorText && <Error text={errorText} close={ _ => setErrorText('')}/> }
      </View>
    </SafeAreaView>
  )
}

const funcs = (props) => [
  {
    title: 'My Team',
    component: TeamBuilder
  },
  {
    title: 'Points table',
    component: PointsTable,
    condition: _ => false,
    errorText: 'You need to make a team first!'
  },
  {
    title: 'Rules',
    component: TextComponent
  },
  {
    title: 'Updates',
    component: TextComponent
  }
]

export default WrestleMoney

const styles = StyleSheet.create({
  WrestleMoney:{
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
    paddingHorizontal: 30,
    paddingVertical: 10,
    justifyContent: 'center'
  },
  btnText: {
    color: 'rgba(255,255,255,.7)',
    textAlign: 'center'
  },
})