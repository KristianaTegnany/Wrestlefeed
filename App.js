import React from 'react'
import SpInAppUpdates, {
  IAUUpdateKind
} from 'sp-react-native-in-app-updates'
import RNIap, {
  purchaseErrorListener,
  purchaseUpdatedListener
} from 'react-native-iap'

import {
  Alert,
  Platform
} from 'react-native'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import AppBase from './src/AppBase'
import reducers from './src/reducers'
import { Component } from 'react'

const productIds = Platform.select({
  ios: [
    'com.wrestlefeed.news'
  ],
  android: [
    'com.wrestlefeed'
  ]
})

const store = createStore(reducers, {}, applyMiddleware(ReduxThunk))
class App extends Component {

  constructor(props) {
    super(props)
    state = {
      needsUpdate: null,
      otherData: null,
      error: null,
      products: []
    }
    this.inAppUpdates = new SpInAppUpdates(
      true
    )
    this.purchaseUpdateSubscription = null
    this.purchaseErrorSubscription = null
  }
  
  async componentDidMount() {
    this.checkForUpdates()
    try {
      const products = await RNIap.getProducts(productIds)
      Alert.alert(products)
      this.setState({ products })
    } catch(err) {
      console.warn(err)
    }

    RNIap.initConnection().then(() => {
      RNIap.flushFailedPurchasesCachedAsPendingAndroid().catch(() => {
      }).then(() => {
        this.purchaseUpdateSubscription = purchaseUpdatedListener((purchase) => {
          console.log('purchaseUpdatedListener', purchase)
          const receipt = purchase.transactionReceipt
          if (receipt) {
            // Eto no antsoina ilay API manao update Purchase
            /*yourAPI.deliverOrDownloadFancyInAppPurchase(purchase.transactionReceipt)
            .then( async (deliveryResult) => {
              if (isSuccess(deliveryResult)) {
                if (Platform.OS === 'ios') {
                  await RNIap.finishTransactionIOS(purchase.transactionId)
                } else if (Platform.OS === 'android') {
                  await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken)
                }
                await RNIap.finishTransaction(purchase, false)
              } else {
                
              }
            })*/
          }
        })

        this.purchaseErrorSubscription = purchaseErrorListener((error) => {
          console.warn('purchaseErrorListener', error)
        })
      })
    })
  }

  // CODE ao @ ilay page misy bouton Puchase
  /*
    requestPurchase = async (sku: string) => {
    try {
      await RNIap.requestPurchase(sku, false);
    } catch (err) {
      console.warn(err.code, err.message);
    }
  }

  requestSubscription = async (sku: string) => {
    try {
      await RNIap.requestSubscription(sku);
    } catch (err) {
      console.warn(err.code, err.message);
    }
  }

  render() {
    ...
      onPress={() => this.requestPurchase(product.productId)}
    ...
  }
  */

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
  
  requestPurchase = async (sku) => {
    try {
      await RNIap.requestPurchase(sku, false)
    } catch (err) {
      console.warn(err.code, err.message)
    }
  }

  requestSubscription = async (sku) => {
    try {
      await RNIap.requestSubscription(sku)
    } catch (err) {
      console.warn(err.code, err.message)
    }
  }

  checkForUpdates = () => {
    this.inAppUpdates
      .checkNeedsUpdate({
        //curVersion: '0.0.8'
      })
      .then((result) => {
        this.setState({
          needsUpdate: result.shouldUpdate,
          otherData: result,
        })
        if (result && result.shouldUpdate) {
          let updateOptions = {}
          if (Platform.OS === 'android') {
            updateOptions = {
              updateType: IAUUpdateKind.IMMEDIATE,
            }
          }
          this.inAppUpdates.startUpdate(updateOptions)
        }
      })
      .catch((error) => {
        
      })
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