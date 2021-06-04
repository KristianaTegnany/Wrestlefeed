import React from 'react'
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native'
import { addZero } from '../../functions'
import { wf } from '.'
import Axios from 'axios'

const Wrestler = ({item}) => {
  let {
    id,
    name = "Marson Jr.",
    image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/John_Cena_2010.jpg/170px-John_Cena_2010.jpg',
    toggler,
    chosen
  } = item
  if(!image) image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/John_Cena_2010.jpg/170px-John_Cena_2010.jpg'
  else if(!image.startsWith('http')) image = `${wf.baseUrl}${image}`

  return (
    <View key={id} activeOpacity={.9} style={styles.Wrestler}>
      <Image style={styles.wImage} source={{uri: image}} />
      <View style={chosen.includes(id) ? styles.wChosen : {}}/>
      <Text style={styles.wText}>{name}</Text>
      <TouchableOpacity onPress = {_ => toggler(id)} style={StyleSheet.absoluteFill}/>
    </View>
  )
}

const list = Array.from(new Array(4).keys())

const TeamBuilder = (props) => {
  const { user, wrestlers, team } = props
  const [chosen, setChosen] = React.useState([2])
  const toggleWrestler = (id) => {
    if(chosen.includes(id)) setChosen(chosen.filter(i => id !== i))
    else if(chosen.length < 5) {
      setChosen([ ...chosen, id ])
    }
  }
  const save = () => {
    Axios.post(`${wf.baseUrl}api/team`).then(console.log)
    navigation.back()
  }
  return (
    <View style={styles.TeamBuilder}>
      <View style={styles.counterParent}>
        <Text style={styles.counterCount}>{addZero(chosen.length)} / 05</Text>
        <Text style={styles.counterText}>Selected</Text>
      </View>
      <FlatList
        style={styles.wFList}
        data={wrestlers.map(wrestler => {
          return { ...wrestler, toggler: toggleWrestler, chosen }
        })}
        // keyExtractor={(_, i) => i}
        renderItem={Wrestler}
        numColumns={2}
      />
      {
        chosen.length === 5 && <View style={styles.submitParent}>
          <TouchableOpacity onPress={save} style={styles.submitButton}>
            <Text  style={styles.submitText}>Save my team</Text>
          </TouchableOpacity>
        </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  submitParent: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  submitButton: {
    backgroundColor: '#b21a1a',
    borderRadius: 30,
    width: '60%',
    padding: 10
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  TeamBuilder: {
    backgroundColor: 'rgba(240, 240, 240, .8)',
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
    overflow: 'hidden'
  },
  wText: {
    textAlign: 'center',
    color: "white",
    fontWeight: 'bold',
    backgroundColor: '#b21a1a',
    minHeight: 30,
    paddingHorizontal: 5,
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
