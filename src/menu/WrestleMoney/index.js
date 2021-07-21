import React from 'react'
import {Dimensions} from 'react-native'

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
import NotSubscribed from '../NotSubscribed'
import connect from '../../connector';
import { withNavigationFocus } from 'react-navigation'
import { tracker } from '../../tracker';
import config from '../../config';

export const wf = {
  wrestlers: [],
  team: null
}

export const updateWM = async (user_id) => {
  return await Promise.all([getTeam(user_id), getWrestlers()])
}

const getWrestlers = async () => {
  const { data } = await Axios.get(`${config.wrestler_api}/api/wrestler`)
  wf.wrestlers = data.data
  return wf.wrestlers
}

const getTeam = async (user_id) => {
  const { data } = await Axios.get(`${config.wrestler_api}/api/getmyteam?user_id=${user_id}`)
  wf.team = data
  return data
}

const _defTitle = "WrestleMoney"

const WrestleMoney = (props) => {
  const {
    navigation,
    navigation: { state: { params: user } }
  } = props

  // States
  const [team, setTeam] = React.useState(wf.team)
  const [wrestlers, setWrestlers] = React.useState(wf.wrestlers)
  const backHandler = React.useRef(null)
  const fct = funcs(props, { team })
  const [active, setActive] = React.useState(fct[0])

  const goBackHome = () => {
    if (backHandler.current) backHandler.current()
    else if (_defTitle !== active.title) setActive(fct[0])
    else navigation.goBack()
  }

  React.useEffect(() => {
    if (active.title === _defTitle) backHandler.current = null
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

  React.useEffect(() => {
    tracker.setUser(user.ID)
    tracker.trackEvent("Click", "WrestleMoney")
    tracker.trackScreenView('WrestleMoney')
  },[props.isFocused])

  const Component = active.component
  return (
    <View
      style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {
          Component && <Component
            close={_ => setActive(fct[0])}
            {...{ user, funcs: fct, setActive, updateData, navigation, wrestlers, backHandler, team, setTeam }}
            navbar={<Navbar leftPress={goBackHome} title={active.title} />}
          />
        }
      </SafeAreaView>
    </View>
  )
}

const GoPro = (props) => {
  const { close, user } = props
  return <View
    style={{
      backgroundColor: '#212121',
      position: 'absolute',
      overflow: 'hidden',
      zIndex: 9999999,
      bottom: 0,
      left: 0,
      right: 0,
      height: Dimensions.get('screen').height
    }}
  >
    <NotSubscribed user={user} cancelable close={close} />
  </View>
}

const funcs = ({ subs: { isPro } }, { team }) => [
  {
    title: _defTitle,
    component: Main,
    nobutton: true
  },
  {
    title: 'My Team',
    component: isPro ? (team && team.wrestlers ? MyTeam : TeamBuilder) : GoPro
  },
  {
    title: 'Points Table',
    component: isPro? PointsTable : GoPro,
    condition: _ => team && team.wrestlers && team.wrestlers.length,
    errorText: 'You need to make a team first!'
  },
  {
    title: 'Rules',
    component: Rules
  },
  {
    title: 'Updates',
    component: isPro? Updates : GoPro
  }
]

export default connect(withNavigationFocus(WrestleMoney))