import React from 'react'
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, Image } from 'react-native'
import { addZero } from '../../functions'
import { wf } from '.'
import Axios from 'axios'
import config from '../../config'


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

const MAX = 4

const TeamBuilder = (props) => {
  const { user, wrestlers, team, setTeam, close } = props
  const [chosen, setChosen] = React.useState([])
  const [search, setSearch] = React.useState('')
  const toggleWrestler = (id) => {
    if(chosen.includes(id)) setChosen(chosen.filter(i => id !== i))
    else if(chosen.length < MAX) {
      setChosen([ ...chosen, id ])
    }
  }
  const save = async () => {
    if(chosen.length === MAX){
      const team = await Axios.post(`${wf.baseUrl}/api/team`, {
        wrestlers: chosen,
        user_id: user.ID,
        name: user.display_name || ''
      })
      setTeam(team)
      close()
    }
  }
  return (
    <SafeAreaView style={styles.TeamBuilder}>
      <View style={styles.counterParent}>
        <Text style={styles.counterCount}>{addZero(chosen.length)} / 05</Text>
        <Text style={styles.counterText}>Selected</Text>
      </View>
      <FlatList
        style={styles.wFList}
        data={wrestlers.map(wrestler => {
          return { ...wrestler, toggler: toggleWrestler, chosen }
        })}
        keyExtractor={(_, i) => i}
        renderItem={Wrestler}
      />
      {
        <View style={styles.submitParent}>
          <View onPress={save} style={[styles.submitButton, { flex: 1, overflow: 'hidden', marginRight: 20, flexDirection: 'row'}]}>
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
          <TouchableOpacity activeOpacity={chosen.length < MAX ? 1 : .5} onPress={save} style={[styles.submitButton, {backgroundColor: chosen.length < MAX ? "gray" : '#eee'}]}>
            <Text  style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  submitParent: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  submitButton: {
    backgroundColor: '#eee',
    borderRadius: 5,
    width: '40%',
    padding: 10
  },
  submitText: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  TeamBuilder: {
    backgroundColor: '#212121',
    ...StyleSheet.absoluteFill,
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
    width: '90%',
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
