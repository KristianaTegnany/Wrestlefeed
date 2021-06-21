import React from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import config from '../config'

const NotSubscribed = (props) => {
  const { close, cancelable } = props
  
  return (
    <View
      style={[styles.Error, cancelable ? {} : {backgroundColor: '#212121'}]}
      onTouchStart={close}
    >
      <View style={[styles.body]}>
        <View style={styles.content}>
          <View style={styles.titleParent}>
            <Image
              source={{ uri: 'menu_square_logo' }}
              style={{ width: 50, height: 50 }}
            />
            <Text style={styles.titleText}>Legend Pack</Text>
          </View>
          <Text style={styles.contentText}>
            <Text>Dear loyal user, subscribe today to{`\n`}begin your</Text>
            <Text style={{fontWeight: 'bold'}}> 30 days free trial </Text>
            <Text>and get:</Text>
          </Text>
          <View>
            <Text style={styles.listItem}>- Access to the funniest Memes ever</Text>
            <Text style={styles.listItem}>- Access to a breathtaking Divas section</Text>
            <Text style={styles.listItem}>- Access to all new WrestleMoney League</Text>
            <Text style={styles.listItem}>- A classy Legend Badge on your comments</Text>
          </View>
          <Text style={[styles.contentText, styles.marginedText]}>
            <Text>You will be charged only</Text>
            <Text style={{fontWeight: 'bold'}}> $0.99 </Text>
            <Text>a month, should you wish to continue supporting us.</Text>
          </Text>
          <Text style={styles.contentText}>
            <Text>You can unsubscribe any time you like.</Text>
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
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
  marginedText: {
    marginVertical: 20
  },
  listItem: {
    marginLeft: 10,
    fontSize: 14,
    color: '#212121'
  },
  titleParent: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20
  },
  titleText: {
    fontSize: 30,
    fontFamily: 'Exo-SemiBold',
    marginLeft: 15,
    alignItems: 'center',
    color: '#212121'
  },
  body: {
    backgroundColor: '#eee',
    maxWidth: '90%',
    padding: 20,
    borderRadius: 10
  },
  contentText: {
    fontSize: 16,
    color: '#504f4f'
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
    fontSize: 22,
    fontFamily: Platform.OS == 'ios'? 'Eurostile' : 'Eurostile-Bold'
  },
})


export default NotSubscribed
