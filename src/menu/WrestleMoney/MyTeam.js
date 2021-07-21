import React from 'react'
import {
  View, Text, StyleSheet, Platform
} from 'react-native'

const MyTeam = (props) => {
  const { team: { wrestlers }, backHandler, close, navbar } = props
  const total = wrestlers.reduce((tot, { point }) => tot + point, 0)
  React.useEffect(() => {
    backHandler.current = close
  }, [])
  return (
    <View style={{ flex: 1}}>
      {navbar}
      <View style={styles.TeamBuilder}>
        <Text style={styles.title}>Your team for the ongoing season:</Text>
        <View style={styles.table}>
          <View style={[styles.wLine, styles.wRed]}>
            <Text style={styles.wNameText}>My Wrestlers</Text>
            <Text style={styles.wPointText}>Points</Text>
          </View>
          {
            wrestlers
              //.filter(({ point }) => point > 0)
              .sort(({ point: a, name: na }, { point: b, name: nb }) => {
                if (a !== b) return a > b ? -1 : 1
                else return na.toLowerCase() > nb.toLowerCase() ? 1 : -1
              })
              .map(({ name, point }, i) => {
                return <View key={i} style={[styles.wLine]}>
                  <Text style={styles.wNameText}>{name}</Text>
                  <Text style={styles.wPointText}>{parseInt(point) === 0? '' : point > 9 ? point : `0${point}`}</Text>
                </View>
              })
          }
          <View style={[styles.wLine, styles.wRed]}>
            <Text style={styles.wNameText}>My Total Score</Text>
            <Text style={styles.wPointText}>{total > 9 ? total : `0${total}`}</Text>
          </View>
        </View>

        <Text style={styles.detail}>
          {`Wrestlers' points are regularly updated by\nthe admins after every event. Your score\nwill be refreshed whenever you come\nback here next time. Good luck!`}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  TeamBuilder: {
    backgroundColor: '#212121',
    justifyContent: 'space-evenly',
    flex: 1,
  },
  table: {
    width: '80%',
    alignSelf: 'center',
    borderColor: "#fff",
    borderWidth: 1
  },
  title: {
    color: "#fff",
    textAlign: 'center',
    fontSize: 20,
    fontFamily: Platform.OS == 'ios' ? 'Eurostile' : 'Eurostile-Bold'
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


export default MyTeam
