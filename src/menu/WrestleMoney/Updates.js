import React from 'react'
import {
  View, Text, StyleSheet, ScrollView } from 'react-native'


const Updates = (props) => {
  const {team: {wrestlers}} = props
  const total = wrestlers.reduce((tot, {point}) => tot + point, 0)
  return (
    <View style={styles.Updates}>
      <ScrollView
        style={styles.UpdatesScrollView}
        contentContainerStyle={styles.UpdatesContainer}
      >
        <View style={styles.update}>
          <Text style={styles.updateText}>
            {'lorem ipsum'}
          </Text>
          <Text style={styles.updateDate}>
            {"12:03 GMT "}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  Updates: {
    backgroundColor: '#212121',
    justifyContent: 'space-evenly',
    ...StyleSheet.absoluteFill
  },
  UpdatesScrollView: {
    flex: 1
  },
  UpdatesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  update: {
    padding: 10,
    marginVertical: 7,
    backgroundColor: '#fff',
    borderRadius: 5
  },
  updateText: {
    fontSize: 16
  },
  updateDate: {
    textAlign: 'right',
    color: '#b21a1a'
  }
})


export default Updates
