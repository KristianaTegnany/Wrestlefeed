import React from 'react'
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native'
import { addZero } from '../../functions'

const Wrestler = ({item}) => {
  const {
    id,
    name = "Marson Jr.",
    image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/John_Cena_2010.jpg/170px-John_Cena_2010.jpg',
    toggler, chosen
  } = item

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

const TeamBuilder = () => {
  const [chosen, setChosen] = React.useState([2])
  const toggleWrestler = (id) => {
    if(chosen.includes(id)) setChosen(chosen.filter(i => id !== i))
    else if(chosen.length < 5) {
      console.log("a", {chosen})
      setChosen([ ...chosen, id ])
      console.log("b", {chosen})
    }
  }
  return (
    <View style={styles.TeamBuilder}>
      <View style={styles.counterParent}>
        <Text style={styles.counterCount}>{addZero(chosen.length)} / 05</Text>
        <Text style={styles.counterText}>Selected</Text>
      </View>
      <FlatList
        style={styles.wFList}
        data={list.map((id) => {
          return { id, toggler: toggleWrestler, chosen}
        })}
        // keyExtractor={(_, i) => i}
        renderItem={Wrestler}
        numColumns={2}
      />
    </View>
  )
}

const styles = StyleSheet.create({
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
