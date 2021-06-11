import React from 'react'
import { View, Text, StyleSheet,} from 'react-native'
import { WebView } from 'react-native-webview';

const RenderLoading = () => {
  return (
    <View
      style={{
        flex: 1,  
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <ActivityIndicator animating size="large" color='#b21a1a' />
      <Text style={{ fontSize: 18 }}>Please Wait...</Text>
    </View>
  );
}

const Rules = (props) => {
  const {close, backHandler} = props
  React.useEffect(() => {
    backHandler.current = close
  }, [])
  return (
    <View style={styles.Rules}>
      <WebView
        style={{ flex: 1}}
        source={{ uri: 'https://wrestlefeed.wwfoldschool.com/rules/' }}
        javaScriptEnabled
        domStorageEnabled
        renderLoading={RenderLoading}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  Rules: {
    backgroundColor: '#212121',
    justifyContent: 'space-evenly',
    ...StyleSheet.absoluteFill
  },
  table: {
    width: '80%',
    alignSelf: 'center',
    borderColor: "#fff",
    borderWidth: 1
  },
  title:{
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


export default Rules
