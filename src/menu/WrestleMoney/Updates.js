import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { WebView } from 'react-native-webview';
import { RenderLoading } from '../../common/Component';

const Updates = (props) => {
  const { close, backHandler, navbar } = props
  const { height } = Dimensions.get('screen')
  const heightView = height - 56

  React.useEffect(() => {
    backHandler.current = close
  }, [])
  return (
    <View style={{ flex: 1 }}>
      {navbar}
      <View style={styles.Updates}>
        <WebView
          style={{ flex: 1, height: heightView }}
          source={{ uri: 'https://wrestlefeed.wwfoldschool.com/updates/' }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => <RenderLoading />}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  Updates: {
    backgroundColor: '#212121',
    justifyContent: 'space-evenly',
    flex: 1
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
    fontFamily: 'Eurostile-Bold'
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


export default Updates
