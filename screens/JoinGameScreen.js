import React, { Component } from 'react';
import {View,NativeEventEmitter,NativeModules,Dimensions} from 'react-native';
import { Text,Button, ThemeProvider, Input, Header} from 'react-native-elements';
import { LaserTheme } from '../components/Custom_theme';
import Icon from 'react-native-vector-icons/Feather';
import CustomHeader from '../components/CustomHeader';
import {Web_Urls} from '../constants/webUrls';
import { Container, Content, Spinner, Body,Left, Right, NativeBaseProvider } from 'native-base';
import Title from '../components/Title'

// import { getSupportedVideoFormats } from 'expo/build/AR';

const BleManagerModule = NativeModules.BleManager;
const dimensions = Dimensions.get('window');
const Container_Width = Math.round(dimensions.width *1/3);
const Container_Height = Math.round(dimensions.height * 1/20);
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
//import Title from '../components/Ghs_Comps/Title'

export default class JoinGameScreen extends Component {
  static navigationOptions = {
    title: 'Join Game',
  };
  constructor(){
    super()
    this.state = {
      userData: null,
      scanning:false,
      key: '',
      appState: '',
      keyError: '',
      discoveredP: false,
      loading: true,
      loadingGame: false,
      gameList: [],
      joinGameError: false,
      gameListHeader: '',
      seachMode: 'public',
      team_num:0
    }
    this.loadStorage()  // Checks storage and then builds upon startBLEManager
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
      console.log("wierd gun thing here");
    })
    .catch(err => {
      console.log("Load Storage error message: ", err.message);
      switch (err.name) {
        case 'NotFoundError':
          return false;
        case 'ExpiredError': // Gun only lasts for so long
          return false;
      }
    });
  }
    
  editGamekey = key => {this.setState({ key });};

  componentDidMount(){
      const userData = this.props.navigation.getParam("userData", null);
      // console.log("Join Screen userData",userData)
      this.setState({userData})
  } 

  componentWillUnmount() { // cancel all async tasks herere? Appstate change?
    console.log("unmouting JoinScreen ");
  }

  // Handlers

  joinGameHandleAppStateChange(nextAppState) {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('JoinGame Screen has come to the foreground!')
    }
    this.setState({appState: nextAppState});
  }

  joinPressed = (game) => {
    console.log("Tying to join",game);
    this.requestJoin(game);
  };
  
  requestJoin(game){
    this.setState({loadingGame: true})
    var getURL = Web_Urls.Host_Url + "/game/" + game;
    console.log("Sending request to ", getURL)
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      this.setState({appState: nextAppState});
    }

    joinPressed = (game) => {
      console.log("Tying to join",game);
      this.requestJoin(game);
    }
  }
    
  requestJoin(game){
    this.setState({loadingGame: true})
      var getURL = Web_Urls.Host_Url + "/game/" + game;
      console.log("Sending request to ", getURL)
      var request = new XMLHttpRequest();
        request.onreadystatechange = (e) => {
          if (request.readyState !== 4) {
            return;
          }
          if (request.status === 200) {
            response = JSON.parse(request.response);
            console.log("Joining Game?",response)
            this.handleJoinGame(response);
          } else {
            console.log("Error",request)
            this.setState({joinGameError: "Could not Join Game with ID: " + game, loading: false});     
          }
        }
        request.open('GET', getURL);
        request.send();
  }

  handleJoinGame(response){
    const gameData = response;
    const game_mode = gameData.game.game_mode;
    //If the team_mode is solo, jump to loading page;
    //If the team-mode is team, navigate to Lobby page;
    // console.log("CHECKING JOIN GAME", gameData.game);
    if (game_mode == "team"){ this.props.navigation.navigate('Lobby',{userData: this.state.userData,gameData:gameData,host:'0'}) }
    else if (game_mode == "solo"){
      //Put the player in the team; Each person is a team in SOLO game
      //create a team for this palyer
      getGameURL  =  Web_Urls.Host_Url + "/game/" + gameData.game.game_id+ "/teams"
      var checkTeamRequest = new XMLHttpRequest();

      checkTeamRequest.onreadystatechange = (e) => {
          if (checkTeamRequest.readyState !== 4) {
            return;
          }
          if (checkTeamRequest.status === 200) {
            response = JSON.parse(checkTeamRequest.response);
            if (response.result === -1){
              alert("go away hacker");
            } else {
              // console.log("CHECK TEAM", response);
              this.state.team_num = response.teams.length;
              console.log ("NUM OF TEAMS",  this.state.team_num)
              //create a team for this person
              payload = {
                "team_num": this.state.team_num + 1,
                "game_mode": "solo",
                "active": false,
                "session_token": this.state.userData.user_info.session_token
              }
              this.createTeamSolo(gameData.game.game_id, payload);
            }
          } else {
            response = JSON.parse(checkTeamRequest.response);
            console.log("Trouble", response) // Needs more error handling   
          }
        }
        checkTeamRequest.open('GET', getGameURL);
        checkTeamRequest.send();
        this.props.navigation.navigate('Loading',{userData: this.state.userData,gameData:gameData,host:'0'});
    }

  }

  createTeamSolo(game_id, payload){
    var getGameURL  =  Web_Urls.Host_Url + "/game/" + game_id + "/users"
      var createTeamRequest = new XMLHttpRequest();
      createTeamRequest.onreadystatechange = (e) => {
        if (createTeamRequest.readyState !== 4) {
          return;
        }
        if (createTeamRequest.status === 200) {
          response = JSON.parse(createTeamRequest.response);
          if (response.result === -1){
            alert("go away hacker");
          } else {
            console.log("CHECK CREATE TEAM", response, "--", this.state.userData);
            this.props.navigation.navigate('Loading',{userData: this.state.userData,gameData:this.state.gameData})
            // const team_id = response.game.teams[response.game.teams.length - 1];
            // this.putPlayerInTeam(this.state.userData, team_id);
          }
        } else {
          console.log("Create team issue", createTeamRequest.response) // Needs more error handling   
        }
      }
      createTeamRequest.open('PATCH', getGameURL);
      createTeamRequest.setRequestHeader("Content-type","application/json");
      createTeamRequest.send(JSON.stringify(payload));
  }

  putPlayerInTeam(userData, team_id){
    var getTeamURL  =  Web_Urls.Host_Url + "/team/" + team_id + "/users"
    console.log("Sending PATCH Request to", getTeamURL);
    console.log("Test Session Token", this.state.userData.user_info.session_token);
    payload = {"session_token": userData.user_info.session_token}
    console.log("Payload Testing", payload);
    var createSoloTeamRequest = new XMLHttpRequest();
    createSoloTeamRequest.onreadystatechange = (e) => {
      if (createSoloTeamRequest.readyState !== 4) {
        return;
      }
      if (createSoloTeamRequest.status === 200) {
        response = JSON.parse(createSoloTeamRequest.response);
        if (response.result === -1){
          alert("go away hacker");
        } else {
          console.log("Player is put into a Team", response);
        }
      } else {
        console.log("Put player in Team issue", createSoloTeamRequest.response) // Needs more error handling   
      }
    }
    createSoloTeamRequest.open('PATCH', getTeamURL);
    createSoloTeamRequest.setRequestHeader("Content-type","application/json");
    createSoloTeamRequest.send(JSON.stringify(payload));
  }

  goBack = () => {this.props.navigation.goBack()}

  renderJoinError = () => {
    if (this.state.joinGameError != ''){
      return (
      <Text style = {{backgroundColor: 'red', textAlign: 'center', color: 'white'}}>{this.state.joinGameError}</Text>
      )
    }else{
      return 
    }
  }
  renderJoinError = () => {
    if (this.state.joinGameError != ''){
      return (<Text style = {{backgroundColor: 'red', textAlign: 'center', color: 'white'}}>{this.state.joinGameError}</Text>)
    } else {
      return 
    }
  }

  renderSpinner = () => {
    if (this.state.loading == true){
      return(
        <Spinner 
          key="spiner"
          style = {{height:5,
          paddingTop: 43,
          paddingLeft: 15,
          justifyContent: 'center', 
          alignContent: 'center'
          }} size='small' color='blue' />
      )
    } else {
      return (<View/>)
    }
  }

  render() {
    return(
      <NativeBaseProvider>
      <ThemeProvider {...this.props}  theme={LaserTheme}>
        {/* <CustomHeader {...this.props} headerText= "Join Game" headerType = "join" /> */}
        <Header>
          <Icon name='chevron-left' type='feather' color='white' onPress={() => this.goBack()} />
          <Title><Text style= {{color: 'white'}}>{'Join Game'}</Text></Title>
        </Header>
        <View style={{marginTop: 10, marginHorizontal:10 , justifyContent: 'center', alignContent: 'center'}}>
          <Text style = {{fontSize:40, textAlign: "center"}}>Enter Game Key</Text>
          <Text></Text>
        </View>
        <Input
          placeholder='Game Key'
          keyboardType='default'
          returnKeyType='done'
          clearButtonMode='while-editing'
          // leftIcon={{ type: 'feather', name: 'link' }}
          errorMessage= {this.state.keyError}
          onChangeText={this.editGamekey}
          underlineColorAndroid = '#f2f2f2'
          style={{marginBottom:4}}
          textAlign='center'
          value={this.state.key}
        />
        <Button 
          loading = {this.state.loadingGame} 
          style={{paddingHorizontal: Container_Width/1.1, paddingVertical: 5, justifyContent: 'center', marginTop:10}} 
          title= "Join Game" 
          onPress={() => this.joinPressed(this.state.key)}/>
        {this.renderJoinError()}
      </ThemeProvider>
      </NativeBaseProvider>
    );
  }
} 