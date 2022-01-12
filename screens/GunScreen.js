import React, { Component } from 'react';
import {StyleSheet,NativeEventEmitter,NativeModules} from 'react-native';
import {Text, View, FlatList, Switch, NativeBaseProvider} from 'native-base';
import CustomHeader from '../components/CustomHeader';
import { Button, ThemeProvider, ListItem,Divider, Input, Header} from 'react-native-elements'; 
import { LaserTheme } from '../components/Custom_theme';
import BluetoothManager from '../components/Ble_manager'
import Icon from 'react-native-vector-icons/Feather';
import Title from '../components/Title'

//const BleManagerModule = NativeModules.BleManager;
//const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
//import BluetoothSerial from 'react-native-bluetooth-serial'
//import "../components/Blue_tooth"
export default class GunScreen extends Component {
  constructor (props) {
    //BM  = new BluetoothManager();
    super(props)
    this.state = {
      isEnabled: false,
      discovering: false,
      devices: [],
      unpairedDevices: [],
      connected: false,
    }
  }

  componentDidMount(){
  }

  getGunData = (gunData) =>{this.setState({gunData});} 

  goHome = () => {this.props.navigation.navigate("Home")}
  goBack = () => {this.props.navigation.goBack()}

  componentWillUnmount() { // cancel all async tasks herere?
    console.log("Unmounting gunscreen")
  }

  _renderItem(item){
    return(<View style={styles.deviceNameWrap}>
            <Text style={styles.deviceName}>{item.item.name}</Text>
          </View>)
  }
  render() {
    return (
      <NativeBaseProvider>
      <ThemeProvider theme={LaserTheme}>
        {/* <CustomHeader {...this.props} headerText = "Connect to Gun" headerType = "gun"/> */}
        <Header>
          <Icon name='chevron-left' type='feather' color='white' onPress={() => this.goBack()} />
          <Title><Text style= {{color: 'white'}}>{'Connect to Gun'}</Text></Title>
          <Icon name='home' type='feather' color='white' onPress={() => this.goHome()} />
        </Header>
        <ThemeProvider theme={LaserTheme}>
          <BluetoothManager ref={bleManager => {this.bleManager = bleManager}} {...this.props} getGunData = {this.getGunData} screen= "Gun"></BluetoothManager>
        </ThemeProvider>
        </ThemeProvider>
      </NativeBaseProvider>
    )
  }
}

const styles = StyleSheet.create({
  toolbar:{
    paddingTop:30,
    paddingBottom:30,
    flexDirection:'row'
  },
  // toolbarButton:{
  //   width: 50,
  //   marginTop: 8,
  // },
  toolbarTitle:{
    textAlign:'center',
    fontWeight:'bold',
    fontSize: 20,
    flex:1,
    marginTop:6
  },
  deviceName: {
    fontSize: 17,
    color: "black"
  },
  deviceNameWrap: {
    margin: 10,
    borderBottomWidth:1
  }
});