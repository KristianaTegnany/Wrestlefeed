import React from 'react'
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native'

const Wrestler = (props) => {
  const {
    name = "John Cena",
    point = "400",
    image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/John_Cena_2010.jpg/170px-John_Cena_2010.jpg',
    onPress, chosen
  } = props
  return (
    <TouchableOpacity activeOpacity={.9} onPress = {onPress} style={styles.Wrestler}>
      <Image style={styles.wImage} source={{uri: image}}/>
      <View  style={styles.wTextParent}>
        <Text style={styles.wText}>{name}</Text>
        <Text style={styles.wPoint}>{point}</Text>
      </View>
    </TouchableOpacity>
  )
}


const PointsTable = () => {
  const [chosen, setChosen] = React.useState([])
  const showWrestler = (id) => {
    if(chosen.includes(id)) setChosen(chosen.filter(i => id !== i))
    else if(chosen.length < 5) setChosen([ ...chosen, id ])
  }
  return (
    <View style={styles.TeamBuilder}>
      <View style={styles.counterParent}>
        <Text style={styles.counterCount}>{'2 000'}</Text>
        <Text style={styles.counterText}>Total point</Text>
      </View>
      <FlatList
        style={styles.wFList}
        data={Array.from(new Array(5).keys()).map((id) => {
          return { id, onPress: _ => showWrestler(id) }
        })}
        keyExtractor={(_, i) => `${i}`}
        renderItem={Wrestler}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  TeamBuilder: {
    backgroundColor: '#eee',
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
    marginBottom: 30
  },
  wTextParent: {
    
  },
  wText: {
    textAlign: 'center',
    color: "white",
    fontSize: 16,
    paddingHorizontal: 5,
    textAlignVertical: 'center',
    color: '#b21a1a',
  },
  wPoint: {
    textAlign: 'center',
    color: "#333",
    fontWeight: "100",
    fontSize: 25,
    paddingHorizontal: 5
  },
  wImage: {
    aspectRatio: 1,
    borderRadius: 15,
    width: '50%',
    alignSelf: 'center',
    overflow: 'hidden',
    borderColor: 'rgba(0, 0, 0, .05)',
    borderWidth: 2,
    resizeMode: 'cover'
  },
  wChosen: {
    position: 'absolute',
    top: '5%',
    right: '5%',
    width: '15%',
    height: '15%',
    backgroundColor: 'green',
    borderRadius: 100
  }
})


export default PointsTable
