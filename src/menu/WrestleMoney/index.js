import React from 'react'
import {
  View, Text, StyleSheet, BackHandler,
  TouchableOpacity, Platform, ImageBackground
} from 'react-native'
import { Navbar } from '../../common/Component';
import Error from './Error';
import PointsTable from './PointsTable';
import TeamBuilder from './TeamBuilder';
import Axios from 'axios'
import config from '../../config';
import MyTeam from './MyTeam';
import Updates from './Updates';
import Rules from './Rules';

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
  const {data} = await Axios.get(`${wf.baseUrl}/api/getmyteam?user_id=${user_id}`)
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
  const backHandler = React.useRef(null)
  const [team, setTeam] = React.useState(null)
  const [errorText, setErrorText] = React.useState('')

  const goBackHome = () => {
    console.log(_defTitle, active.title)
    if(backHandler.current) backHandler.current()
    else if(_defTitle !== active.title) setActive({title: _defTitle})
    else navigation.goBack()
  }

  React.useEffect(() => {
    if(active.title === _defTitle) backHandler.current = null
  }, [active])
  
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", _ => {
      goBackHome()
      return true
    })
    getWrestlers().then(wlrs => setWrestlers(wlrs))
    getTeam(user.ID).then(team => {
      setTeam(team || {})
    })
    // setTeam({})
    return () => backHandler.remove()
  }, []);
  const Component = active.component
  return (
    <View
      style={{flex: 1}}>
      <Navbar leftPress={goBackHome} title={active.title} />
      <ImageBackground source={require('../../assets/images/bg.png')} style={styles.WrestleMoney}>
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
                      backHandler.current = _ => {
                        setErrorText('')
                        backHandler.current = null
                      }
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
        { Component && <Component close={_ => setActive({title: _defTitle})} {...{user, navigation, wrestlers, backHandler, team, setTeam}}/> }
        { !!errorText && <Error text={errorText} close={backHandler.current}/> }
      </ImageBackground>
    </View>
  )
}

const funcs = (props, {team}) => [
  {
    title: 'My Team',
    component: team && team.wrestlers ? MyTeam : TeamBuilder,
    condition: _ => !!team,
    errorText: "Loading your data... Please wait..."
  },
  {
    title: 'Points Table',
    component: PointsTable,
    condition: _ => team && team.wrestlers && team.wrestlers.length,
    errorText: team ? 'You need to make a team first!' : "Loading your data... Please wait..."
  },
  {
    title: 'Rules',
    component: Rules
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
    justifyContent: 'center',
    opacity: 0.8
  },
  btnText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 27,
    fontFamily: Platform.OS == 'ios'? 'Eurostile' : 'Eurostile-Bold'
  },
})