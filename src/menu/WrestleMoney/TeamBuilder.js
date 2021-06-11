import React from 'react'
import {
  FlatList, Keyboard, View, Text, ActivityIndicator, StyleSheet,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Image
} from 'react-native'
import { addZero } from '../../functions'
import { wf } from '.'
import Axios from 'axios'
import config from '../../config'
import Fuzzy from 'fuzzy'
import { RenderLoading } from '../../common/Component'

const Wrestler = ({item}) => {
  let {
    id,
    name = "Marson Jr.",
    image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/John_Cena_2010.jpg/170px-John_Cena_2010.jpg',
    toggler,
    chosen
  } = item

  if(!image) image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/John_Cena_2010.jpg/170px-John_Cena_2010.jpg'
  else if(!image.startsWith('http')) image = `${wf.baseUrl}/${image}`

  return (
    <View key={id} activeOpacity={.9} style={[styles.Wrestler, {backgroundColor: chosen.includes(id) ? '#b21a1a' : "#eee"}]}>
      <Text style={[styles.wText, {fontFamily: config.ios ? 'Eurostile' : 'Eurostile-Bold', color: chosen.includes(id) ? '#fff' : "#333"}]}>{name}</Text>
      <TouchableOpacity onPress = {_ => toggler(id)} style={StyleSheet.absoluteFill}/>
    </View>
  )
}

const MAX = 5

const TeamBuilder = (props) => {
  const { user, wrestlers, setTeam, close, backHandler } = props
  const [loading, setLoading] = React.useState(false)
  const [chosen, setChosen] = React.useState([])
  const [search, setSearch] = React.useState('')
  const [keyboard, setKeyboard] = React.useState(false)
  const [showConf, setShowConf] = React.useState(false)
  const toggleWrestler = (id) => {
    if(chosen.includes(id)) setChosen(chosen.filter(i => id !== i))
    else if(chosen.length < MAX) {
      setChosen([ ...chosen, id ])
    }
  }

  const save = async () => {
    if(chosen.length === MAX){
      if(showConf){
        setLoading(true)
        const {data: team} = await Axios.post(`${wf.baseUrl}/api/team`, {
          wrestlers: chosen,
          user_id: user.ID,
          name: user.display_name || ''
        })
        setTeam(team)
        setLoading(false)
        close()
      }
      else setShowConf(true)
    }
  }

  React.useEffect(() => {
    const k1 = Keyboard.addListener('keyboardDidShow', _ => setKeyboard(true))
    const k2 = Keyboard.addListener('keyboardDidHide', _ => setKeyboard(false))
    return _ => {
      k1.remove()
      k2.remove()
    }
  }, [])

  React.useEffect(() => {
    if(showConf) backHandler.current = _ => setShowConf(false)
    else backHandler.current = close
  }, [showConf])

  return (
    <KeyboardAvoidingView
      behavior="height"
      style={styles.TeamBuilder}
    >
      {
        loading &&
        <RenderLoading/>
      }
      {
        showConf && <View style={styles.conf}>
          <View style={styles.confContent}>
            <Text style={styles.confTitle}>Confirm your final team and tap freeze:</Text>
            <View style={styles.confList}>
            {
              chosen.map((id, i) => {
                const {name} = wrestlers.find(({id: Id}) => Id === id)
                return <Text key={i} style={styles.confW}>{i+1}. {name}</Text>
              })
            }
            </View>
            <Text style={styles.confDetail}>
              {`You will not be able to make any changes before the next season.`}
            </Text>
            <View style={styles.confButtons}>
              <TouchableOpacity onPressIn={_ => setShowConf(false)} style={styles.confButton}>
                <Text style={styles.confButtonText}>Edit Team</Text>
              </TouchableOpacity>
              <TouchableOpacity  onPressIn={save} style={styles.confButton}>
                <Text style={styles.confButtonText}>Freeze</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
      <View style={styles.counterParent}>
        <Text style={styles.counterCount}>{addZero(chosen.length)} / 05</Text>
        <Text style={styles.counterText}>Selected</Text>
      </View>
      <Text style={styles.title}>Choose your 5 wrestlers to compete.</Text>
      <FlatList
        style={styles.wFList}
        extraData={props}
        data={
          Fuzzy.filter(search, wrestlers, { extract: ({name}) => name }).map(one => one.original || one)
          .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
          .map(wrestler => {
            return { ...wrestler, toggler: toggleWrestler, chosen }
          })
        }
        keyExtractor={(_, i) => `${i}`}
        renderItem={Wrestler}
      />
      {
        search && <TouchableOpacity activeOpacity={.8} onPress={_ => {keyboard && Keyboard.dismiss(); setSearch('')}} style={{marginTop: 10, justifyContent: 'center', alignItems: 'center'}}>
          <Image style={{width: 50, height: 50 }} source={require('../../assets/images/cancel.png')}/>
        </TouchableOpacity>
      }
      {
        <View style={styles.submitParent}>
          <View onPress={save} style={[styles.submitButton, { alignItems: 'center', flex: 1, overflow: 'hidden', marginRight: 20, flexDirection: 'row'}]}>
            <Image style={{width: 20, height: 20, opacity: .5 }} source={require('../../assets/images/search.png')}/>
            <TextInput value={search} onChangeText={setSearch} returnKeyType="search" selectionColor={'#b21a1a'} underlineColorAndroid ='rgba(0,0,0,0)' style={
              {
                width: '100%',
                display: 'flex',
                paddingVertical: 0,
                color: '#333',
                height: 35,
                borderStyle: 'solid',
                marginLeft: 5,
                marginRight: 5,
                fontSize: 18,
                marginTop: 2,
                position: 'absolute',
                zIndex: 2,
                paddingLeft: 30
              }
            }/>
          </View>
          <TouchableOpacity activeOpacity={chosen.length < MAX ? 1 : .5} onPress={save} style={[styles.submitButton, {backgroundColor: chosen.length < MAX ? "gray" : '#b21a1a'}]}>
            <Text style={[styles.submitText, {color: chosen.length < MAX ? "#333" : '#fff'}]}>Submit</Text>
          </TouchableOpacity>
        </View>
      }
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  submitParent: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  title: {
    fontSize: 20,
    paddingVertical: 15,
    textAlign: 'center',
    color: '#fff'
  },
  conf: {
    ...StyleSheet.absoluteFill,
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,.6)'
  },
  confW: {
    fontSize: 16,
    fontWeight: 'bold',

  },
  confContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 5,
    paddingHorizontal: 30,
    paddingVertical: 15,
    shadowColor: "#555",
    shadowRadius: 5,
    elevation: 3,

  },
  confTitle: {
    fontSize: 15
  },
  confButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  confDetail: {
    fontStyle: 'italic',
    marginVertical: 15,
    lineHeight: 20
  },
  confButton: {
    backgroundColor: '#b21a1a',
    padding: 7,
    alignItems: 'center',
    borderRadius: 7,
    width: '46%'
  },
  confButtonText: {
    color: '#fff',
    fontSize: 16
  },
  confList: {
    marginVertical: 15,
    paddingLeft: 15
  },
  submitButton: {
    backgroundColor: '#eee',
    borderRadius: 5,
    width: '40%',
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  submitText: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20
  },
  TeamBuilder: {
    backgroundColor: '#212121',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1
  },
  counterParent: {
    position: 'absolute',
    top: -56,
    right: 10,
    height: 56,
    justifyContent: 'center'
  },
  counterText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'right'
  },
  counterCount: {
    textAlignVertical: 'center',
    color: '#fff',
    fontSize: 20,
    textAlign: 'right'
  },
  wFList: {
    flex: 1,
    padding: 5
  },
  Wrestlers: {
    flexDirection: 'row'
  },
  Wrestler: {
    flex: 1,
    margin: 5,
    borderRadius: 4,
    overflow: 'hidden',
    paddingVertical: 6,
    width: '80%',
    alignSelf: 'center'
  },
  wText: {
    textAlign: 'center',
    color: "white",
    fontWeight: 'bold',
    minHeight: 30,
    paddingHorizontal: 5,
    fontSize: 18,
    textAlignVertical: 'center'
  },
  wImage: {
    aspectRatio: 1
  },
  wChosen: {
    position: 'absolute',
    top: '5%',
    right: '5%',
    width: '7%',
    aspectRatio: 1,
    backgroundColor: 'green',
    borderRadius: 100,
    elevation: 100,
    shadowColor: '#fff',
    shadowRadius: 5
  }
})


export default TeamBuilder
