import React from 'react'
import {
  Alert,
  BackHandler,
  Linking,
  Platform
} from 'react-native'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import AppBase from './src/AppBase'
import reducers from './src/reducers'
import RNIap, {
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';  

import VersionCheck from 'react-native-version-check';
import { Component } from 'react'

const store = createStore(reducers, {}, applyMiddleware(ReduxThunk))
class App extends Component {

  constructor(props) {
    super(props)
    this.purchaseUpdateSubscription = null
    this.purchaseErrorSubscription = null
  }
  
  async componentDidMount() {
    this.checkForUpdates()
    RNIap.initConnection().then(() => {
      RNIap.flushFailedPurchasesCachedAsPendingAndroid().catch(() => {
      }).then(() => {
        this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
          const receipt = purchase.transactionReceipt
          if (receipt) {
            if (Platform.OS === 'ios') {
              await RNIap.finishTransactionIOS(purchase.transactionId)
            } else if (Platform.OS === 'android') {
              await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken)
            }
            await RNIap.finishTransaction(purchase, false)
            // Eto no antsoina ilay API manao update Purchase
            if (Platform.OS === 'ios') {
              await RNIap.finishTransactionIOS(purchase.transactionId)
            } else if (Platform.OS === 'android') {
              await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken)
            }
            await RNIap.finishTransaction(purchase, false)
          }
        })

        this.purchaseErrorSubscription = purchaseErrorListener((error) => {
          console.warn('purchaseErrorListener', error)
        })
      })
    }).catch(e => console.log('initConnection' + e))
  }

  componentWillUnmount() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove()
      this.purchaseUpdateSubscription = null
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove()
      this.purchaseErrorSubscription = null
    }
  }
  
  checkForUpdates = async () => {
    try {
      let updateNeeded = await VersionCheck.needUpdate();
      if (updateNeeded && updateNeeded.isNeeded) {
        Alert.alert(
          'Please Update', 
          'You will have to update your app to the latest version to continue using.',
          [
            {
              text: 'Update',
              onPress: () => {
                BackHandler.exitApp();
                Linking.openURL(updateNeeded.storeUrl)
              }
            }
          ],
          { cancelable: false }
        )
      }
    } catch(error) {
      console.log(error)
    }
  }

  render () {
    return (
      <Provider store={store}>
        <AppBase />
      </Provider>
    )
  }
}

export default App