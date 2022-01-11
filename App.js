import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
//Screens --
import HomeScreen from './screens/HomeScreen'
import GunScreen from './screens/GunScreen'
import LoginScreen from './screens/LoginScreen'
import HostScreen from './screens/HostScreen'
import JoinGameScreen from './screens/JoinGameScreen';
import SignupScreen from './screens/SignupScreen';
import GameLobbyScreen from './screens/GameLobbyScreen';
import InGameScreen from './screens/InGame';
import LoadingScreen from './screens/LoadingScreen';
import { LogBox } from 'react-native';

// Screen setup
const RootStack = createStackNavigator(
  {
    Login: LoginScreen,
    Signup: SignupScreen,
    Home: HomeScreen,
    Join: JoinGameScreen,
    Host: HostScreen,
    Gun: GunScreen,
    Lobby: GameLobbyScreen,
    Game: InGameScreen ,
    Loading: LoadingScreen
  },
  {
    initialRouteName: "Home",
    headerMode: 'none',
    navigationOptions: {headerVisible: true, gestureEnabled: false,}
  }
);

const AppContainer = createAppContainer(RootStack);
// LogBox.ignoreAllLogs(false);

//---------------- Exported data---------------------- \\
export default class App extends React.Component {
  componentWillUnmount(){
    console.log("UNMOUNTING APP");
  }
  render() {
    return <AppContainer />;
  }
}