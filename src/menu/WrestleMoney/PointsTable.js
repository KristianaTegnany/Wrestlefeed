import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { toDate } from '../../functions'
import _ from 'lodash'

const PointsTable = (props) => {
  const { wrestlers, close, backHandler, updateData, navbar } = props
  

  React.useEffect(() => {
    backHandler.current = close
    updateData()
  }, [])

  const lastUpdate = wrestlers.reduce((last, { updated_at: ua }) => {
    return last < ua ? ua : last
  }, "0000")

  return (
    <View style={{ flex: 1 }}>
      {navbar}
      <View style={styles.TeamBuilder}>
        {
          lastUpdate &&
          <Text style={styles.title}>Points last updated at: <Text style={{ color: '#b21a1a' }}>{toDate(lastUpdate)}</Text></Text>
        }
        <View style={styles.table}>
          <View style={[styles.wLine, styles.wRed]}>
            <Text style={styles.wNameText}>Wrestlers</Text>
            <Text style={styles.wPointText}>Points</Text>
          </View>
          <ScrollView>
            {
                wrestlers.sort(({point: a, name: na}, {point: b, name: nb}) => {
                  if(a !== b) return parseFloat(a) > parseFloat(b) ? -1 : 1
                  else return na.toLowerCase() > nb.toLowerCase() ? 1 : -1   
                })      
                .map(({ name, point }, i) => {
                  return <View key={i} style={[styles.wLine]}>
                    <Text style={styles.wNameText}>{name}</Text>
                    <Text style={styles.wPointText}>{point > 9 ? point : `0${point}`}</Text>
                  </View>
                })
            }
          </ScrollView>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  TeamBuilder: {
    backgroundColor: '#212121',
    justifyContent: 'space-evenly',
    flex: 1
  },
  title: {
    color: "#fff",
    textAlign: 'center',
    fontSize: 16,
  },
  table: {
    width: '80%',
    alignSelf: 'center',
    borderColor: "#fff",
    borderWidth: 1,
    height: '75%'
  },
  wLine: {
    flexDirection: 'row',
  },
  wRed: {
    backgroundColor: '#b21a1a'
  },
  wNameText: {
    paddingVertical: 10,
    fontSize: 17,
    color: '#fff',
    borderColor: "#fff",
    borderWidth: 1,
    flex: 1,
    textAlign: 'center'
  },
  wPointText: {
    paddingVertical: 10,
    fontSize: 17,
    color: '#fff',
    borderColor: "#fff",
    borderWidth: 1,
    width: '30%',
    textAlign: 'center'
  },
  detail: {
    width: '80%',
    alignSelf: 'center',
    fontStyle: 'italic',
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 23
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
