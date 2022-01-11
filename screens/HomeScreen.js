import React, { Component } from 'react';
import ButtonMenu from '../components/Button_menu'
import {View, Dimensions} from 'react-native';
// import CustomHeader from '../components/CustomHeader';

import BluetoothManager from '../components/Ble_manager'
import { Text, ThemeProvider} from 'react-native-elements';


export default class HomeScreen extends Component {
  static navigationOptions = {
    title: 'Home', // Possibly have it dynamic to name
  };
 state = {
  gunData: null,
  gunConnected: false,
  menuOptions: ["Manage Gun"," Join Game", " Create Game"],
  menuTranslater: [{text:"Connect To Blaster",value: "Gun"}, {text:'Join Game', value: "Join"},{text:'Create Game', value: "Host"}],
  userData: this.props.navigation.getParam("userData", null)
}
componentDidMount() {
  console.log("Home user data", this.state.userData);

  //save the session token information in storage
  this.saveSessionToken();
  
  //load global gun data
  this.loadStorage();
}

saveSessionToken = () => {
  global.storage.load ({
    key: 'gunData',
    autoSync: true,
    syncInBackground: true,
    syncParams: {
      extraFetchOptions: {
        // blahblah
      },
      someFlag: true
    }
  })
  .then(ret => {
    // this.setState({connectedGun: ret.conGun})
    if (ret.conGun){
      if (ret.sessionHistoryId == null){ //first time log in
        
        console.log("First time log in", this.state.userData.user_info.session_token);
        global.storage.save({
          key: 'gunData',
          data: {
            conGun: false,
            sessionCurrentId: this.state.userData.user_info.session_token,
            sessionHistoryId: this.state.userData.user_info.session_token
        }});
      }
      else if (ret.sessionHistoryId != this.state.userData.user_info.session_token){ //tokens are not the same
        this.setState({gunConnected: false});
        global.storage.save({
          key: 'gunData',
          data: {
            conGun: false,
            sessionHistoryId: this.state.userData.user_info.session_token
        }});

        console.log("using Session ID", this.state.userData.user_info.session_token);
      }
    } else{
      console.log("Home Gun disconneced")
    }
  })
}

loadStorage = () => {
  global.storage.load ({
  key: 'gunData',
  autoSync: true,
  syncInBackground: true,
  syncParams: {
    extraFetchOptions: {
      // blahblah
    },
    someFlag: true
  }
})
.then(ret => {
  if (ret.conGun){
    console.log("Home Gun Data is loaded in Home Page");
  } else{
    console.log("Home Gun disconneced")
  }
})
.catch(err => {
  console.log("Home: Gun connect error xxxxx ", err.message);
  switch (err.name) {
    case 'NotFoundError':
      return false;
    case 'ExpiredError': // Gun only lasts for so long
      return false;
  }
});
}

getGunData = (gunData) =>{
  this.setState({gunData});
} 
componentWillUnmount() { // cancel all async tasks herere?
  console.log("Unmounting HomeScreen")
}
 onMenuPress = (menuVal) => {
  console.log("TEST")
  const menuTranslater = this.state.menuTranslater
  let optDic = menuTranslater[menuVal]
  let optText = optDic.text
  let optVal =  optDic.value
  console.log("GUN DATA - ", this.state.gunData);  //initilize gundata, null
  this.props.navigation.navigate(optVal,{userData: this.state.userData, gunData: this.state.gunData});
}

  render() {
    const {menuOptions} = this.state
    const dimensions = Dimensions.get('window');
    //const imageHeight = Math.round(dimensions.width * 0.20);
    const imageWidth = dimensions.width;
    return (
      // <View>
        <ButtonMenu 
              menuOptions = {menuOptions}
              onPressItem = {this.onMenuPress}
        />
      /* </View>  */
      )
  }
}