import React, { useEffect, useState } from 'react'
import {
  View, Text, Platform, StyleSheet, TouchableOpacity, Image, ActivityIndicator
} from 'react-native'
import RNIap from 'react-native-iap'
import connect from '../connector';

const itemSkus = Platform.select({
  android: [
    'wf_20_pro_user'
  ],
  ios: [
    'com.wrestlefeed.news'
  ]
})

const NotSubscribed = (props) => {
  const { close, cancelable, user } = props
  const [loading, setLoading] = useState(false)

  const requestSubscription = async (sku) => {
    if(!loading) {
      setLoading(true)
      try {
        await RNIap.requestSubscription(sku);
        props.subscribe(user.ID, user.display_name)
        close()
      } catch (err) {
        setLoading(false)
        console.warn(err.code, err.message)
      }
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await RNIap.initConnection()
        await RNIap.getSubscriptions(itemSkus)
      } catch (err) {
        console.warn(err)
      }
    })()
  }, [])

  return (
    <View
      style={[styles.Error, cancelable ? {} : { zIndex: 1, backgroundColor: '#212121' }]}
    >
      <View style={[styles.body]}>
        <View style={styles.center}>
          <View style={styles.titleParent}>
            <Image
              source={{ uri: 'menu_square_logo' }}
              style={{ width: 50, height: 50 }}
            />
            <Text style={styles.titleText}>Legend Pack</Text>
          </View>
          <Text style={styles.contentText}>
            Dear loyal user, subscribe today to {'\n'} begin your
            <Text style={{ fontWeight: 'bold' }}> 30 days free trial </Text>
            and get:{'\n'}
          </Text>
          <View>
            <Text style={styles.listItem}>- Access to the funniest Memes ever</Text>
            <Text style={styles.listItem}>- Access to a breathtaking Divas section</Text>
            <Text style={styles.listItem}>- Access to all new WrestleMoney League</Text>
            <Text style={styles.listItem}>- A classy Legend Badge on your comments</Text>
          </View>
          <Text style={[styles.contentText, styles.marginedText]}>
            <Text>You will be only charged only</Text>
            <Text style={{ fontWeight: 'bold' }}> $0.99 </Text>
            <Text>a month, should you wish to continue supporting us.</Text>
          </Text>
          <Text style={styles.contentText}>
            <Text>You can unsubscribe any time you like.</Text>
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {
            cancelable && <TouchableOpacity onPressIn={close} activeOpacity={.5} style={styles.ko}>
              <Text style={styles.okText}>Cancel</Text>
            </TouchableOpacity>
          }
          <TouchableOpacity onPress={() => requestSubscription(itemSkus[0])} style={styles.ok}>
            {
              loading &&
              <ActivityIndicator/>
            }
            { 
              !loading &&
              <Text style={styles.okText}>Subscribe</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
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
    fontSize: 16,
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
    textAlign: 'center',
    fontSize: 16,
    color: '#504f4f'
  },
  ok: {
    width: 150,
    height: 35,
    alignSelf: 'flex-end',
    marginTop: 20,
    backgroundColor: '#b21a1a',
    paddingVertical: 7,
    paddingHorizontal: 25,
    borderRadius: 4
  },
  ko: {
    width: 150,
    height: 35,
    alignSelf: 'flex-end',
    marginTop: 20,
    backgroundColor: '#555',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginRight: 20
  },
  okText: {
    textAlign:'center',
    color: 'white',
    fontSize: 18,
    fontFamily: Platform.OS == 'ios' ? 'Eurostile' : 'Eurostile-Bold'
  },
})


export default connect(NotSubscribed)
