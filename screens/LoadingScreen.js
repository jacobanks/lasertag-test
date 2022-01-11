import React, { Component } from 'react';
import { StyleSheet, View, NativeEventEmitter, AppState, NativeModules, ActivityIndicator, FlatList, Dimensions, ViewBase, Alert } from 'react-native';

// import CustomHeader from '../components/CustomHeader';
import { ThemeProvider, Icon, Text, Button, Slider, ListItem, ButtonGroup, Card } from 'react-native-elements';
import { Container, Spinner } from 'native-base';
import { Web_Urls } from '../constants/webUrls';

const dimensions = Dimensions.get('window');
const Container_Width = Math.round(dimensions.width *1/3);
const Container_Height = Math.round(dimensions.height * 1/20);

export default class GameLobbyScreen extends Component {
  static navigationOptions = {
    title: 'Loading', // Where all players will hang out before game starts
  };

  constructor() {
    super();
    this.state = {
      teamData: {},
      loading: false,
      gameData: {},
      host: '',
      game_id: null,
      userData: {},
      time: null,
      gameLength: null
    }
  }

  componentDidMount() {
    const gameData = this.props.navigation.getParam("gameData");
    const userData = this.props.navigation.getParam("userData");
    // console.log('component mount user data from loading screen:',userData)
    const game_id = gameData.game.game_id;
    const host = this.props.navigation.getParam("host");
    this.setState({ gameData, userData, host, game_id });
    this.interval = setInterval(() => this.checkActive(game_id), 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  checkActive(game_id) {
    // console.log("Checking if Game Live")
    var getURL = Web_Urls.Host_Url + "/game/" + game_id
    console.log("Checking if Game Live: Sending request to ", getURL)
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        gameInfo = JSON.parse(request.response);
        console.log("Got Game Info: ", gameInfo);
        if (gameInfo.game.active == true) {
          console.log("game IS active... Sending to game")
          clearInterval(this.interval);
          this.props.navigation.navigate("Game",{userData: this.state.userData, gameData: this.state.gameData});
        } else {
          console.log("Game NOT active")
        }
      } else {
        console.log("Trouble fetching gameInfo")
      }
    }
    request.open('GET', getURL);
    request.send();
  }

  startGame() {
    this.setState({loading: true});
    const payload = {
      "active": true,
      "session_token": this.state.userData.user_info.session_token
    }
    var getURL = Web_Urls.Host_Url + "/game/" + this.state.game_id
    console.log("Sending request to ", getURL)
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        response = JSON.parse(request.response);
        console.log(response)
        if (response.result === -1){
          alert("Problems with request");
        } else {
          console.log("Success")
          //this.props.navigation.navigate('Loading',{userData: this.state.userData,gameData:this.state.gameData,host: this.state.host})
        }
      } else {
        console.log(request.response) 
      }
    }
    request.open('PATCH', getURL);
    request.setRequestHeader("Content-type","application/json");
    request.send(JSON.stringify(payload));
  }

  renderStartButton = () => {
    console.log("Final host", this.state.host)
    if (this.state.host == '1') {
      return (
        <Button
          style={{
            paddingHorizontal: Container_Width/1.1, 
            paddingVertical: 5, 
            justifyContent: 'center', 
            marginTop:10
          }}
          title='Start Game'
          loading = {this.state.loading}
          onPress={() => this.startGame()}
        />
      )
    } else {
      return
    }
  }

  renderSpinner = () => {
    if (this.state.loading == true){
      return(
        <Spinner style = {{height:5,
          paddingTop: 23,
          paddingLeft: 15,
          justifyContent: 'center', 
          alignContent: 'center'
          }} size='small' color='#7447d1' />
      )
    } else{
      return (<View/>)
    }
  }

  render() {
    const styles = StyleSheet.create({
      titleText: {
        fontSize: 50,
        fontWeight: "bold",
        textAlign: 'center'
      }
    });
    return (
      <View>
        <Text style={styles.titleText}>Game Code: {this.state.game_id}</Text>
        <Spinner style={{
          height: 5,
          marginBottom: 100,
          paddingTop: 100,
          paddingLeft: 15,
          justifyContent: 'center',
          alignContent: 'center'
        }} size='large' color='#7447d1' />
        {this.renderStartButton()}
      </View>
    );
  }
}