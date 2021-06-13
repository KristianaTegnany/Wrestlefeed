import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import Wrestlefeed from '../../common/Wrestlefeed'

export const addZero = (nb) => nb <= 9 ? `0${nb}` : `${nb}`
export const toDate = (origDate, gmt = true) => {
  const d = new Date(origDate)
  const hour = `${addZero(d.getHours())}:${addZero(d.getMinutes())}`
  const date = `${addZero(d.getDate())}/${addZero(d.getMonth() + 1)}/${addZero(d.getFullYear())}`
  return `${hour}${gmt ? ' GMT' : ''}, ${date}`
}

const updates = []

const Updates = (props) => {
  const { user: { ID: id }, close, backHandler, navbar } = props
  React.useEffect(() => {
    backHandler.current = close
  }, [])
  const [posts, setPosts] = React.useState(updates)
  React.useEffect(() => {
    let isSubscribed = true
    const last_id = updates.length ? updates[updates.length - 1].id : 0
    Wrestlefeed.fetchUpdates(id, last_id).then(posts => {
      if(isSubscribed){
        updates.push(...posts)
        setPosts(updates.slice(0, 10))
      }
    })
    return () => isSubscribed = false
  }, [])
  return (
    <View style={{ flex: 1 }}>
      {navbar}
      <View style={styles.Updates}>
        <ScrollView
          style={styles.UpdatesScrollView}
          contentContainerStyle={styles.UpdatesContainer}
        >
          {
            posts.map(({ content, post_date }, i) => {
              return <View key={i} style={styles.update}>
                <Text style={styles.updateText}>{content}</Text>
                <Text style={styles.updateDate}>{toDate(post_date)}</Text>
              </View>
            })
          }
          {
            !posts.length &&
            <Text style={styles.none}>No updates for now</Text>
          }
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  none: {
    fontSize: 12,
    color: '#fff',
    opacity: .6,
    textAlign: 'center',
    marginVertical: 40
  },
  Updates: {
    backgroundColor: '#212121',
    justifyContent: 'space-evenly',
    flex: 1,
    padding: 10
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
