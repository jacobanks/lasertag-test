import React, { Component } from 'react';
import { NativeModules, NativeEventEmitter, StyleSheet,Text,View } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { LaserTheme } from './Custom_theme';
import {Button, ThemeProvider, Input, Divider} from 'react-native-elements';
import { stringToBytes, bytesToString } from "convert-string";
import { Dimensions} from 'react-native';


const window = Dimensions.get('window');
const dimensions = Dimensions.get('window');
const Container_Width = Math.round(dimensions.width *1/3);
const Container_Height = Math.round(dimensions.height * 1/20);
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

async function connectAndPrepare(id) {
  const peripheral = "24ED02DD-52D3-F5D8-6150-49A9B90B7F08";
  const service = "209D2B52-DBE1-4647-964F-3901BF515F7A";
  const characteristic = "B4B7C5CF-660D-40B8-A099-F794B813229D";
  
  // Connect to device
  await BleManager.connect(peripheral);
  // Before startNotification you need to call retrieveServices
  await BleManager.retrieveServices(peripheral);
  // To enable BleManagerDidUpdateValueForCharacteristic listener
  await BleManager.startNotification(peripheral, service, characteristic);
  // Add event listener
  bleManagerEmitter.addListener(
    "BleManagerDidUpdateValueForCharacteristic",
    ({ value, peripheral, characteristic, service }) => {
      // Convert bytes array to string
      const data = bytesToString(value);
      console.log(`Recieved ${data} for characteristic ${characteristic}`);
    }
  );
  // Actions triggereng BleManagerDidUpdateValueForCharacteristic event
}

export default class BluetoothManager extends Component {
  constructor(){
    super()
    this.state = {
      id_input: '',
      peripherals: new Map(),
      connectedGun: null,
      connectionError: '',
      searchLoad: false,
      gunConnected: null,
      userData: {},
      p_id: null,
      service: null,
      char: null
    }
  }

  componentDidMount() {
    console.log("Bluetooth running")
    BleManager.start({ showAlert: false })

    this.handlerDiscover = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral
    );

    this.handlerStop = bleManagerEmitter.addListener(
      'BleManagerStopScan',
      this.handleStopScan
    );

    this.handleUpdate = bleManagerEmitter.addListener("BleManagerDidUpdateState", (args) => {
      console.log("UPDATE: ", args);
    });

    //this.scanForDevices(); // start scanning for devices

    const userData = this.props.navigation.getParam("userData", null);

    this.loadStorage();

    this.interval = setInterval(() => this.updateGame(), 5000);
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
      console.log("something is loaded, a set of gundata is loaded")
      this.setState({gunConnected: true});
    } else{
    }
  })
  .catch(err => {
    console.log("Gun connect error xxxxx ", err.message);
    switch (err.name) {
      case 'NotFoundError':
        return false;
      case 'ExpiredError': // Gun only lasts for so long
        return false;
    }
  });
  }

updateGame(){
  // console.log("Interval working")
  if ((this.state.gunConnected === true)&(this.state.p_id != null)){
    
    console.log("Updating Game")
    this.read(this.state.p_id, this.state.service, this.state.char);
  }
}

scanForDevices() {
  BleManager.scan([], 1);
}

write(id, service, char, data, size){
  BleManager.write(id, service, char, size).then(() => {
    console.log("Write: " + data);
  })
  .catch((error) => {
    console.log("Writing error: ", error);
  });
}

read(id, service, char){
  BleManager.read(id, service, char).then((readData) => {
    console.log("Read: " + readData);
    //var response = readData.split(',');
    var output = '';
    for (var i = 0; i < readData.length; i++) { 
      output = output.concat(String.fromCharCode(readData[i]));
    }
    console.log(output)
  })
  .catch((error) => {
    console.log("Reading error: ", error);
  });
}

notification (id, service, char) {
  BleManager.startNotification(id, service, char)
    .then(() => {
      // Success code
      console.log("Notification started");
    })
    .catch((error) => {
      // Failure code
      console.log(error);
    });
}
   
retrieveservices(id) {
  BleManager.retrieveServices("24ED02DD-52D3-F5D8-6150-49A9B90B7F08").then(
    (peripheralInfo) => {
      console.log("Retrive info on", id, " :", peripheralInfo);

      const data = stringToBytes("dataSend");
      const p_id = peripheralInfo.id;
      const service_id = "209D2B52-DBE1-4647-964F-3901BF515F7A";
      const char_id = "B4B7C5CF-660D-40B8-A099-F794B813229D";
      this.setState({p_id, service: service_id, char: char_id})
      //this.notification(p_id, service_id,char_id);
      this.read(p_id, service_id,char_id)
      //this.write(p_id, service_id,char_id, "1")
    }
  )
  .catch((error) => {
    console.log("Retrieving Error on id: ", id, " with error: ", error);
  });
}


handleDiscoverPeripheral = (peripheral) => {
  const { peripherals } = this.state;
  if (peripheral.name) {
    peripherals.set(peripheral.id, peripheral.name);
  }
  this.setState({ peripherals });
};

handleStopScan = () => {
  console.log('Scan is stopped. Devices: ', this.state.peripherals);
}

connect = (id) => {
  this.scanForDevices();
  if (id == 1){
    const p_id = "24ED02DD-52D3-F5D8-6150-49A9B90B7F08";
    BleManager.connect(p_id)
    .then(() => {
      console.log("Connected to id: ", p_id); 
      this.retrieveservices(p_id);
      this.setState({gunConnected: true})
      console.log("Gun Connected", this.state.gunConnected);
      //Save Gun data 
      global.storage.save({
        key: 'gunData',
        data: {
          conGun: true,
      }})})
    .catch((error) => {
      console.log("Connecting Error: ", error);
    });
  }
}


disconnect = (id) => {
  BleManager.disconnect(id)
  .then(() => {
    console.log("Disconnect with id: ", id); 
    this.setState({gunConnected: false})
  })
  .catch((error) => {
    console.log("Disconnect Error: ", error);
  });
}

renderGunStatus = () => {
  console.log("Screen Gun Status", this.state.connectedGun)
  const statusColor = this.state.gunConnected? '#7447d1' : '#d1b947';
  return(
    <View style= {{backgroundColor: '#ae936c'}}>
    <Text style={{
            fontSize: 15,
            margin: 1,
            backgroundColor: statusColor,
            textAlign: "center",
            color: "white"
      }}>
        {this.state.gunConnected ? 'Gun Connected' : 'Gun Disconnected'}
    </Text>
    </View>
);
}

renderGunStatusBottom() {
  const statusColor = this.state.gunConnected? '#7447d1' : '#d1b947'; 
  return(
      <View style= {{backgroundColor: '#ae936c'}}>
      <Text style={{
            fontSize: 15,
            margin: 1,
            backgroundColor: statusColor,
            textAlign: "center",
            color: "white"
      }}>
          {this.state.gunConnected ? 'Gun Connected' : 'Gun Disconnected'}
      </Text>
      </View>
  );
}

editInput = id_input => {this.setState({ id_input });};

render() {
  const id = "24ED02DD-52D3-F5D8-6150-49A9B90B7F08";
    if (this.props.screen == "Join"){
      return (
        <View>
        {this.renderGunStatus()}
        </View>
      )
    }
    else if (this.props.screen == "Home"){
      return (
        <View>
        {this.renderGunStatusBottom()}
        </View>
      )
    
    }
    else if (this.props.screen == "Host"){
      return (
        <View>
        {this.renderGunStatus()}
        </View>
      )
    }else if (this.props.screen == "Lobby"){
      return (
        <View>
        {this.renderGunStatus()}
        </View>
      )
    }else if (this.props.screen == "Game"){
      return (
        <View>
        {this.renderGameStatus()}
        </View>
      )
    }
    return (
     <ThemeProvider theme={LaserTheme}>
        { this.renderGunStatusBottom() }
        <Input
          placeholder='Enter Gun ID Manually'
          leftIcon={{ type: 'feather', name: 'bluetooth' }} // This should be on the QR Code button, not the input field
          textAlign='center'
          errorMessage={this.state.connectionError}
          autoCompleteType = 'off'
          returnKeyLabel = 'Connect'
          returnKeyType = 'go'
          autoCapitalize = 'characters'
          autoCorrect = {false}
          onChangeText={this.editInput}
          value={this.state.id_input}
        />
        {/* <Text style= {{fontSize: 24, textAlign: 'center'}}> OR </Text> */}
        {/* <Button title= "Scan for Devices"  onPress={() => this.scanForDevices()} load={this.state.searchLoad}>
        </Button> */}
        <Button title= "Connect to Device" style = {{marginTop: 3, marginHorizontal: 10}} onPress={() => this.connect(this.state.id_input)} load={this.state.searchLoad}>
        </Button>
        <Button title= "Disconnect from Device" style = {{marginTop: 3, marginHorizontal: 10}} onPress={() => this.disconnect(id)} load={this.state.searchLoad}>
        </Button>

        <Divider/>
          {(this.state.connectedGun == null) 
            // &&
            // <View style={{flex:1, margin: 20}}>
            //   <Text style={{textAlign: 'center'}}>{this.state.gunConnected ? 'Gun Connected' : 'Gun Disconnected'}</Text>
            // </View>
          }
      </ThemeProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: window.width,
    height: window.height
  },
  scroll: {
    flex: 1,
    margin: 10,
  },
  row: {
    margin: 10
  },
});