import React, { Component } from 'react';
import {NativeModules,View,Dimensions, NativeEventEmitter} from 'react-native';
import { ThemeProvider, Text, Button, ButtonGroup, Header} from 'react-native-elements';
import { LaserTheme } from '../components/Custom_theme';
import CustomHeader from '../components/CustomHeader'
import { Container, NativeBaseProvider } from 'native-base';
import {Web_Urls} from '../constants/webUrls';
import NumericInput from 'react-native-numeric-input'
import BluetoothManager from '../components/Ble_manager'
import Icon from 'react-native-vector-icons/Feather';
import Title from '../components/Title'

const dimensions = Dimensions.get('window');
const Container_Width = Math.round(dimensions.width *1/3);
const Container_Height = Math.round(dimensions.height * 1/20);
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class HostScreen extends Component {
  static navigationOptions = {
    title: 'Host Game', // Possibly have it dynamic to name
    gestureEnabled: false,
  };
  constructor(){
    super()
    this.state = {
      hostLoading: false,
      userData: null,
      scanning:false,
      game:null,
      gameModeIndex: 0,
      gameModeText: 'solo',
      num_teams: 2
    }
    this.updateIndex = this.updateIndex.bind(this)
  }

  componentDidMount(){
    const userData = this.props.navigation.getParam("userData", null);
    const gunData = this.props.navigation.getParam("gunData", null);
    const host = userData.username;
    this.setState({host, userData, gunData});
  }

  createGame = () =>{     
    this.setState({hostLoading: true});
    let gamemode = this.state.gameModeText;
    let numTeams = this.state.num_teams;
    if (gamemode == "solo"){
      numTeams = 0;    //set the num 0 for the game host
    }
    const GamePayload = {
      "game_mode": gamemode,
      "team_num": numTeams,
      "session_token": this.state.userData.user_info.session_token
    }
    this.sendCreateGameRequest(GamePayload);
  }
  sendCreateGameRequest(payload) {
    var getURL = Web_Urls.Host_Url + "/game"  
    var request = new XMLHttpRequest();
      request.onreadystatechange = (e) => {
        if (request.readyState !== 4) {
          return;
        }
        if (request.status === 200) {
          createResponse = JSON.parse(request.response);
          console.log("create Respone: ", createResponse);
          if (createResponse.result === 0){
            this.handleCreateGameResponse(createResponse);
          }else{
            console.log("Error Creating Game");
            this.setState({hostLoading: false});
            alert("Something went wrong while creating your game");
            this.setState({joinGameError: "Could not connect to server, Please try again later",  loading: false}); 
          }
        } else {
          console.log("Got Error",createResponse);
          this.setState({hostLoading: false});
          alert("Something went wrong while creating your game");
          this.setState({joinGameError: "Could not connect to server, Please try again later",  loading: false});     
        }
      }
      console.log("Creating Game at",getURL); 
      request.open('POST',getURL);
      request.setRequestHeader("Content-type","application/json");
      request.send(JSON.stringify(payload)); // Strigify?
  }

  // Once game is created, Join it as host
  requestJoinGame(game){
    this.state.game = game;
    const username = this.state.userData.username;
    this.setState({loadingGame: true})
    var getURL = Web_Urls.Host_Url +"/game/"+game.game.game_id;
    console.log("Sending request to ",getURL)
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        response = JSON.parse(request.response);
        console.log("Joining Game?",response)
        this.props.navigation.navigate("Lobby",{
          userData: this.state.userData,
          gameData: response,
          host: 1,
          //teamData: this.state.teamData,
          //gunData: this.state.gunData,
          });
      } else {
        console.log("Error",request)
        alert("Something went wrong while trying to connect to created game"),
        this.setState({hostLoading: false});   
      }
    }
    request.open('GET', getURL);
    request.send();
  }

  handleCreateGameResponse = (gameResponse) =>{
    console.log("Game Creation Response: " , gameResponse);
    this.requestJoinGame(gameResponse);
  }

  updateIndex = (gameModeIndex) => {
    let gameModeText = 'solo';
    if (gameModeIndex == 1){
      gameModeText = 'team';
    }
    this.setState({gameModeIndex, gameModeText});
  }

  soloButton = () => <View icon={<Icon name = 'user' size = {15}  color= "white"   type = 'feather' />} title= "Free For All" ></View>
  teamButton = () => <View icon={<Icon name = 'users' size = {15}  color= "white"   type = 'feather' />} title= "Team"></View>

  soloButton0 = () => <Text style={{ color:'white'}}>Free-For-All</Text>
  teamButton1 = () => <Text style={{ color:'white'}}>Team Death Match</Text>

  renderGameModeButtons =() => {
    const buttons = [{ element: this.soloButton0 }, { element: this.teamButton1 }]
    const gameModeIndex  = this.state.gameModeIndex
    const gameIcon = (gameModeIndex == 0) ? 'user' : 'users';
    return (
      <Container style = {{flex: 0.3, backgroundColor: '#f2f2f2', marginTop: 4, marginBottom:30}}>
        <View style={{flexDirection: 'row', marginTop: 10, justifyContent: 'center', alignContent: 'center'}}>
          {/* <Icon name = {gameIcon} size = {18}  color= "#4a4a4a"  type = 'feather' > </Icon> */}
          <Text style = {{ color: '#4a4a4a', fontSize: 40}}> Game Mode:</Text>
        </View>
        <ButtonGroup
          onPress={this.updateIndex}
          selectedIndex={gameModeIndex}
          buttons={buttons}
          buttonStyle={{backgroundColor:'#9370db'}}
          selectedButtonStyle={{backgroundColor: '#7447d1'}}
          selectedTextStyle={{color:'white', borderColor:'white'}}
          textColor='white'
          containerStyle={{height: 25}}/>
      </Container>
    )
  }

  updateNumTeams = num_teams =>{
    this.setState({num_teams});
  }

  renderGameDesc = () => {
    const prereqText = ((this.state.gameModeIndex == 0 ) ? "Players":"Teams" );
    const gameIcon = ((this.state.gameModeIndex == 0) ? 'user' : 'users');
    if (prereqText == "Players"){
      return(
        <View style={{marginTop: 10, marginHorizontal:10 , justifyContent: 'center', alignContent: 'center'}}>
          <Icon name = {gameIcon} size = {50}  color= "#4a4a4a"  type = 'feather' > </Icon>
          <Text style = {{fontSize:40, textAlign: "center", color:'#4a4a4a'}}>Free-For-All</Text>
          <Text style = {{textAlign: "center", color:'#4a4a4a'}}>Good old-fashioned every-man-for-himself madness.</Text>
        </View>
      )
    } else {
      return(
        <View style={{marginTop: 10, marginHorizontal:10 , justifyContent: 'center', alignContent: 'center'}}>
          <Icon name = {gameIcon} size = {50}  color= "#4a4a4a"  type = 'feather' > </Icon>
          <Text style = {{fontSize:40, textAlign: "center", color:'#4a4a4a'}}>Team Death Match</Text>
          <Text style = {{textAlign: "center", color:'#4a4a4a'}}>Fight together with a team of your friends.</Text>
        </View>
      )
    }
  }
  
  renderTeamNumberPicker = () => {
    const prereqText = ((this.state.gameModeIndex == 0 ) ? "Players":"Teams" );
    if (prereqText == "Players"){
      return(
        <View></View>
      )
    }
    const teamList = [];
    
    return(
      <Container style = {{flex: 0.3, flexDirection: 'row', backgroundColor: '#f2f2f2', marginTop: 10}}>
        <View style={{justifyContent: 'center', width: Container_Width, height: Container_Height /*Border? background color?*/}}>
          <Text style={{ alignSelf: 'center', margin: 3, fontSize:22, color:'#4a4a4a'}}>{prereqText}: </Text>
        </View>
        <NumericInput 
          value={this.state.num_teams} 
          onChange={this.updateNumTeams}
          onLimitReached={(isMax,msg) => console.log(isMax,msg)}
          totalWidth={Container_Width} 
          totalHeight={Container_Height} 
          iconSize={20}
          minValue={2}
          maxValue={8}
          step={1}
          valueType='integer'
          rounded 
          textColor='#4a4a4a'
          iconStyle={{ color: 'white' }} 
          rightButtonBackgroundColor='#7447d1' 
          leftButtonBackgroundColor='#7447d1'/>
        <View style={{justifyContent: 'center',width: Container_Width, height: Container_Height /*Border? background color?*/}}>
          <Text style={{ alignSelf: 'center', margin: 3, fontSize:22, color:'#4a4a4a'}}>(Up to 8)</Text>
        </View>
      </Container>
    )
  }

  goBack = () => {this.props.navigation.goBack()}

  render() {
    return (
      <NativeBaseProvider>
        <ThemeProvider {...this.props}  theme={LaserTheme}>
          
          {/* <CustomHeader {...this.props} headerText= "Create Game" headerType = "host" /> */}
          <Header>
            <Icon name='chevron-left' type='feather' color='white' onPress={() => this.goBack()} />
            <Title><Text style= {{color: 'white'}}>{'Create Game'}</Text></Title>
            {/*<Icon name='home' type='feather' color='white' onPress={() => this.goHome()} />*/}
          </Header>
          <BluetoothManager {...this.props} screen= "Home"></BluetoothManager>

          {this.renderGameModeButtons()}

          {this.renderGameDesc()}
          <View style={{flex: 2}}>

            {this.renderTeamNumberPicker()}

            <Button 
              loading = {this.state.hostLoading} 
              style={{paddingHorizontal: Container_Width/1.1, paddingVertical: 5, justifyContent: 'center', marginTop:10}} 
              title= "Begin Hosting" 
              onPress={() => this.createGame()}/>
          </View>
          
        </ThemeProvider>
      </NativeBaseProvider>
    );
  }
}