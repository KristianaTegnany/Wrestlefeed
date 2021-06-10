import React from 'react'
import {
  View, Text, StyleSheet, BackHandler,
  TouchableOpacity, SafeAreaView, Image, KeyboardAvoidingView, TextInput
} from 'react-native'
import { Navbar } from '../../common/Component';
import Error from './Error';
import PointsTable from './PointsTable';
import TeamBuilder from './TeamBuilder';
import TextComponent from './TextComponent';
import Axios from 'axios'
import config from '../../config';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MyTeam from './MyTeam';
import Updates from './Updates';


export const wf = {
  wrestlers: [],
  baseUrl: 'https://devapp.wwfoldschool.com/wrestler'
}

const getWrestlers = async () => {
  const {data} = await Axios.get(`${wf.baseUrl}/api/wrestler`)
  wf.wrestlers = data.data
  return wf.wrestlers
}

const getTeam = async (user_id) => {
  const {data} = await Axios.request({
    method: "GET",
    url: `${wf.baseUrl}/api/getmyteam`,
    params: { user_id }
  })
  return data
}

const _defTitle = "WrestleMoney"

const WrestleMoney = (props) => {
  const {
    navigation,
    navigation: {state: {params: user}}
  } = props

  // States
  const [active, setActive] = React.useState({title: _defTitle})
  const [wrestlers, setWrestlers] = React.useState(wf.wrestlers)
  const [team, setTeam] = React.useState([])
  const [errorText, setErrorText] = React.useState('')

  const goBackHome = () => {
    if(active.title === _defTitle) navigation.goBack()
    else setActive({title: _defTitle})
    return false
  }
  
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", goBackHome)
    getWrestlers().then(wlrs => setWrestlers(wlrs))
    getTeam(user.ID).then(team => {
      setTeam(team || {})
    })
    return () => backHandler.remove()
  }, []);
  const Component = active.component
  return (
    <View
      style={{flex: 1}}>
      <Navbar leftPress={goBackHome} title={active.title} />
      <View style={styles.WrestleMoney}>
        <Image  />
        <View style={styles.buttons}>
          {
            funcs(props, {team}).map((func, i) => {
              const {title, condition, errorText} = func
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.button}
                  onPress={_ => {
                    if(condition && !condition()) {
                      setErrorText(errorText)
                      console.log(errorText)
                    }
                    else setActive({...func})
                  }}
                >
                  <Text style={[styles.btnText, {fontFamily: config.ios ? 'Eurostile' : 'Eurostile-Bold'}]}>{title}</Text>
                </TouchableOpacity>
              )
            })
          }
        </View>
        { Component && <Component close={_ => setActive({title: _defTitle})} {...{user, navigation, wrestlers, team, setTeam}}/> }
        { !!errorText && <Error text={errorText} close={ _ => setErrorText('')}/> }
      </View>
    </View>
  )
}

const funcs = (props, {team}) => [
  {
    title: 'My Team',
    component: team && team.wrestlers ? MyTeam : TeamBuilder,
    // condition: _ => team && team.wrestlers && team.wrestlers.length === 0,
    // errorText: team ? "You've already built your team for the season!" : "Please wait..."
  },
  {
    title: 'Points table',
    component: PointsTable,
    condition: _ => team && team.wrestlers && team.wrestlers.length,
    errorText: team ? 'You need to make a team first!' : "Please wait..."
  },
  {
    title: 'Rules',
    component: TextComponent
  },
  {
    title: 'Updates',
    component: Updates
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
    paddingHorizontal: 40,
    paddingVertical: 15,
    justifyContent: 'center'
  },
  btnText: {
    color: 'rgba(255,255,255,.7)',
    textAlign: 'center',
    fontSize: 20
  },
})