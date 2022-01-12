import React, { Component } from 'react'
import { Text, StyleSheet, Alert} from 'react-native'
import {Header, Icon} from 'react-native-elements';
// import { LaserTheme } from './Custom_theme';
import { Title } from 'native-base';

export default class CustomHeader extends Component {
  goHome = () => {this.props.navigation.navigate("Home")}

  goSignup = () => {
    console.log("Signup")
    this.props.navigation.navigate("Signup")
  }

  goLogin = () => {this.props.navigation.navigate("Login")}
  logout = () => {this.props.navigation.navigate("Login")}
  goSettings = () => {console.log("opening settings")}
  goBack = () => {this.props.navigation.goBack()}
  refresh = () =>{
    const type = this.props.headerType
    if (type = "join"){
      this.props.navigation.navigate("Join")}
    else if (type = "host"){
      this.props.navigation.navigate("host")}
    else if (type = "lobby"){
      this.props.navigation.navigate("lobby")}
    else if (type = "loading"){
      this.props.navigation.navigate("loading")}
  }

  exitLobby = () =>{
    Alert.alert(
      'Exit Lobby',
      'Are you sure you want to exit this lobby?',
      [
        {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Yes', onPress: () => this.props.navigation.navigate("Home")},
      ],
      {cancelable: true},
    );
  }

  exitGame = () =>{
    Alert.alert(
      'Exit Game',
      'Are you sure you want to exit this game?',
      [
        {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Yes', onPress: () => this.props.navigation.navigate("Home")},
      ],
      {cancelable: true},
    );
  }

  getHeader = () => { 
    const type = this.props.headerType
    if (type == "login"){
      return (
        <Header>
          <Text></Text>
          <Title><Text style= {{color: 'white'}}>{this.props.headerText}</Text></Title>
          <Icon name='user-plus' type='feather' color='white' onPress={() => this.goSignup()} />
        </Header>
      )
    } else if (type == "signup") {
      return (
        <Header>
          <Icon name='chevron-left' type='feather' color='white' onPress={() => this.goLogin()} />
          <Title><Text style= {{color: 'white'}}>{this.props.headerText}</Text></Title>
          <Text></Text>
        </Header>
      )
    } else if (type == "home") {
      return (
        <Header>
          <Text/>
          <Title><Text style= {{color: 'white'}}>{this.props.headerText}</Text></Title>
          <Icon name='log-out' type='feather' color='white' onPress={() => this.logout()} />
        </Header>
      )
    } else if (type == "gun") {
      return (
        <Header>
          <Icon name='chevron-left' type='feather' color='white' onPress={() => this.goBack()} />
          <Title><Text style= {{color: 'white'}}>{this.props.headerText}</Text></Title>
          <Icon name='home' type='feather' color='white' onPress={() => this.goHome()} />
        </Header>
      )
    } else if (type == "join") {
      return (
        <Header>
          <Icon name='chevron-left' type='feather' color='white' onPress={() => this.goBack()} />
          <Title><Text style= {{color: 'white'}}>{this.props.headerText}</Text></Title>
        </Header>
      )
    } else if (type == "host") {
      return (
        <Header>
          <Icon name='chevron-left' type='feather' color='white' onPress={() => this.goBack()} />
          <Title><Text style= {{color: 'white'}}>{this.props.headerText}</Text></Title>
          {/*<Icon name='home' type='feather' color='white' onPress={() => this.goHome()} />*/}
        </Header>
      )
    } else if (type == "lobby") {
      return (
        <Header>
          <Icon name='chevron-left' type='feather' color='white' onPress={() => this.exitLobby()} />
          <Title><Text style= {{color: 'white'}}>{this.props.headerText}</Text></Title>
          {/* <Icon name='refresh-cw' type='feather' color='white' onPress={() => this.refresh()} /> */}
        </Header>
      )
    } else if (type == "game") {
      return (
        <Header>
          <Icon name='chevron-left' type='feather' color='white' onPress={() => this.exitGame()} />
          {/* <Text/> */}
          <Title><Text style= {{color: 'white'}}>{this.props.headerText}</Text></Title>
          {/* <Icon name='refresh-cw' type='feather' color='white' onPress={() => this.refresh()} /> */}
        </Header>
      )
    } else {
      console.log("no header type")
    }
  }

  render() {
    // console.log(this)
    return (this.getHeader())
  }
}

const styles = StyleSheet.create({
  header: {
    //flex:1,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    color: 'darkblue',
    fontSize: 23,
    fontWeight: 'bold'
  },
})