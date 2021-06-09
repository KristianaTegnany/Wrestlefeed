import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'

const NotSubscribed = (props) => {
  const { close, cancelable } = props
  
  return (
    <View
      style={[styles.Error, cancelable ? {} : {backgroundColor: '#212121'}]}
      onTouchStart={close}
    >
      <View style={[styles.body]}>
        <View style={styles.content}>
          <Image
            source={{ uri: 'menu_square_logo' }}
            style={{ width: 50, height: 50, alignSelf: 'center', marginBottom: 20 }} />
          <Text style={styles.contentText}>
            {'Only Pro users can access this section'}
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
          {
            cancelable && <TouchableOpacity onPressIn={close} activeOpacity={.5} style={styles.ko}>
              <Text style={styles.okText}>Cancel</Text>
            </TouchableOpacity>
          }
          <TouchableOpacity onPress={() => {}} activeOpacity={.5} style={styles.ok}>
            <Text style={styles.okText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  Error: {
    backgroundColor: 'rgba(0, 0, 0, .5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    ...StyleSheet.absoluteFill,
  },
  body: {
    backgroundColor: '#eee',
    maxWidth: '90%',
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
  ko: {
    alignSelf: 'flex-end',
    marginTop: 20,
    backgroundColor: '#555',
    paddingVertical: 7,
    paddingHorizontal: 25,
    borderRadius: 4,
    marginRight: 20
  },
  okText: {
    color: 'white',
    fontSize: 15
  },
})


export default NotSubscribed
