import React from 'react'
import {
  View, Text, StyleSheet, } from 'react-native'


const TextComponent = () => {
  const [chosen, setChosen] = React.useState([])
  const showWrestler = (id) => {
    if(chosen.includes(id)) setChosen(chosen.filter(i => id !== i))
    else if(chosen.length < 5) setChosen([ ...chosen, id ])
  }
  return (
    <View style={styles.TeamBuilder}>
      <Text style={styles.text}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem blanditiis accusamus velit perferendis numquam est, consequatur error eligendi tenetur excepturi, veritatis ab nulla expedita eveniet beatae cumque iste. Sequi, quos.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  TeamBuilder: {
    backgroundColor: '#eee',
    padding: 10,
    ...StyleSheet.absoluteFill,
  },
  text: {
    fontSize: 18,
    textAlign: 'justify'
  },

})


export default TextComponent
