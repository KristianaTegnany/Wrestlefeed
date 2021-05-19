import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity } from 'react-native'


const Error = (props) => {
  const {close, text} = props
  
  return (
    <View style={styles.Error}>
      <View style={styles.body}>
        <View style={styles.content}>
          <Text style={styles.contentText}>
            {text}
          </Text>
        </View>
        <TouchableOpacity onPressIn={close} activeOpacity={.5} style={styles.ok}>
          <Text style={styles.okText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  Error: {
    backgroundColor: 'rgba(0, 0, 0, .5)',
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFill,
  },
  body: {
    backgroundColor: '#eee',
    maxWidth: '70%',
    padding: 20,
    borderRadius: 10
  },
  contentText: {
    fontSize: 20
  },
  ok: {
    alignSelf: 'flex-end',
    marginTop: 20,
    backgroundColor: '#b21a1a',
    paddingVertical: 7,
    paddingHorizontal: 25,
    borderRadius: 4
  },
  okText: {
    color: 'white',
    fontSize: 15
  },
})


export default Error
