import React from 'react'
import {
  View, BackHandler, SafeAreaView
} from 'react-native'
import { Navbar } from '../../common/Component';
import PointsTable from './PointsTable';
import TeamBuilder from './TeamBuilder';
import Axios from 'axios'
import MyTeam from './MyTeam';
import Updates from './Updates';
import Rules from './Rules';
import Main from './Main';

export const wf = {
  wrestlers: [],
  team: null,
  baseUrl: 'https://devapp.wwfoldschool.com/wrestler'
}

export const updateWM = async (user_id) => {
  return await Promise.all([getTeam(user_id), getWrestlers()])
}

const getWrestlers = async () => {
  const {data} = await Axios.get(`${wf.baseUrl}/api/wrestler`)
  wf.wrestlers = data.data
  return wf.wrestlers
}

const getTeam = async (user_id) => {
  const {data} = await Axios.get(`${wf.baseUrl}/api/getmyteam?user_id=${user_id}`)
  wf.team = data
  return data
}

const _defTitle = "WrestleMoney"

const WrestleMoney = (props) => {
  const {
    navigation,
    navigation: {state: {params: user}}
  } = props

  // States
  const [team, setTeam] = React.useState(wf.team)
  const [wrestlers, setWrestlers] = React.useState(wf.wrestlers)
  const backHandler = React.useRef(null)
  const fct = funcs(props, {team})
  const [active, setActive] = React.useState(fct[0])

  const goBackHome = () => {
    if(backHandler.current) backHandler.current()
    else if(_defTitle !== active.title) setActive(fct[0])
    else navigation.goBack()
  }

  React.useEffect(() => {
    if(active.title === _defTitle) backHandler.current = null
  }, [active])
  
  const updateData = () => {
    getWrestlers().then(wlrs => setWrestlers(wlrs))
    getTeam(user.ID).then(team => {
      setTeam(team || {})
    })
  }

  React.useEffect(() => {
    updateData()
    const backHandler = BackHandler.addEventListener("hardwareBackPress", _ => {
      goBackHome()
      return true
    })
    return () => backHandler.remove()
  }, [])

  const Component = active.component
  return (
    <View
      style={{flex: 1}}>
      <SafeAreaView style={{ flex: 1}}>
      {
        Component && <Component
          close={_ => setActive(fct[0])}
          {...{user, funcs: fct, setActive, updateData, navigation, wrestlers, backHandler, team, setTeam}}
          navbar = {<Navbar leftPress={goBackHome} title={active.title} />}
        />
      }
      </SafeAreaView>
    </View>
  )
}

const funcs = (props, {team}) => [
  {
    title: _defTitle,
    component: Main,
    nobutton: true
  },
  {
    title: 'My Team',
    component: team && team.wrestlers ? MyTeam : TeamBuilder
  },
  {
    title: 'Points Table',
    component: PointsTable,
    condition: _ => team && team.wrestlers && team.wrestlers.length,
    errorText: 'You need to make a team first!'
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