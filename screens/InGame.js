import React, { Component } from 'react';
import { StyleSheet, View, NativeEventEmitter, AppState, NativeModules, ActivityIndicator, FlatList, Dimensions, ViewBase, Alert } from 'react-native';
import { Text, ThemeProvider, ListItem } from 'react-native-elements';

// import CustomHeader from '../components/CustomHeader';
import { Web_Urls } from '../constants/webUrls';

const dimensions = Dimensions.get('window');
const Container_Width = Math.round(dimensions.width * 1 / 4);
const Container_Height = Math.round(dimensions.height * 1 / 20);
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class GameLobbyScreen extends Component {
  static navigationOptions = {
    title: 'Game lobby', // Where all players will hang out before game starts
  };
  constructor() {
    super();
    this.state = {
      availibleTeams: [],
      gameClock: null,
      gameData: {},
      game_id: null,
      gameLength: null,
      gameModeIndex: 1,
      gameModeText: 'solo',
      host: '',
      loading: true,
      num_teams: null, 
      scoreEvents: {},
      teamData: {},
      teamList: [],
      teamScoreList: [],
      teamLoadError: '',
      userData: null,
    }
  }

  componentDidMount() {
    console.log("In Game Mount")
    userData = this.props.navigation.getParam("userData", null);
    // console.log('UserData from InGame:',this.state.userData)
    gameData = this.props.navigation.getParam("gameData");
    const game_id = gameData.game.game_id;
    const gameLength = 900; // Equal to 15 minutes
    num_teams = gameData.game.teams.length
    if(num_teams > 0){
      this.state.teamList = teamList.teams
    }
  
    scoreEvents = this.requestScoreboardData(game_id)

    console.log("USer data:",userData,"\nGame data:",gameData,"\nGame length:",gameLength,"\nGame ID:",game_id,"\nnumTeams:",num_teams)
    this.setState({userData: userData, gameData: gameData})//, teamList: teamList})
    // console.log(userData, "+++", gameData)
    // const game_id = gameData.game.game_id;
    // const host = this.props.navigation.getParam("host");
    // this.setState({ userData, gameData, game_id, host });
    // this.requestTeams(game_id);
    // console.log("CHECKING", this.state.num_teams);
    // this.populateTemplateTeams(); 

    if (gameLength != null){
      this.setState({gameClock: gameLength}); // Should be sconds in game
      // set gamelentgh
    } else {
      console.log("no gamelength recieved"); // Alert user and pull from server
    }
    
    this.gameClockLoop = setInterval(()=> { 
      const curClock = this.state.gameClock;
      if (curClock == null){
        return;
      }
      if (curClock <= 0){
        const gameID = this.state.gameData.game.id;
        console.log("Game is over")
        //this.requestGameOver(gameID);
         } else {
        this.setState({gameClock: curClock -1});
      }
    }, 1000);
    
    this.gameDataRefreshLoop = setInterval(()=> { 
    }, 5000);
  } 

  componentWillUnmount() { // cancel all async tasks herere? Appstate change?
    console.log("unmouting inGame ");
    clearInterval(this.gameClockLoop);
    clearInterval(this.gameDataRefreshLoop);
  }

  requestGameInfo(game){
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
        // console.log("Joining Game?",response)
        this.handleJoinGame(response);
      } else {
        console.log("Error",request)
        this.setState({joinGameError: "Could not Join Game with ID: " + game, loading: false});     
      }
    }
    request.open('GET', getURL);
    request.send();
  }
  
  requestScoreboardData(game){
    this.setState({loadingGame: true})
    var getURL = Web_Urls.Host_Url + "/game/" + game + "/scorelog";
    console.log("Sending request to ", getURL)
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        response = JSON.parse(request.response);
        // console.log("Scoreboard",response)
        // this.handleJoinGame(response);
      } else {
        console.log("Error",request)
        this.setState({joinGameError: "Could not Join Game with ID: " + game, loading: false});     
      }
    }
    request.open('GET', getURL);
    request.send();
  }

  TeamTempExtractor = (item, index) => index.toString()

  rendergameTimer(gameTime){
    const clientTime = this.state.gameClock;

    var formattedHours= Math.floor(clientTime/60/60);
    var formattedMinutes = Math.floor(clientTime/60) %60;
    var formatedSeconds = clientTime %60
    if (formattedHours < 10){
      formattedHours = "0"+formattedHours;
    }
    if (formattedMinutes < 10){
      formattedMinutes = "0"+formattedMinutes;
    }
    if (formatedSeconds < 10){
      formatedSeconds = "0"+formatedSeconds;
    }
    const endTime = formattedHours + ":" +formattedMinutes + ":" + formatedSeconds;
    return (
      <View style = {{alignItems: 'center'}}><Text style = {{ fontSize: 80, fontWeight: '200'}}>{endTime}</Text></View>
    )
  }

  renderTeamScores = (num_teams) =>  {
    const prereqText = ((this.state.gameModeIndex == 0) ? "Players" : "Teams");
    // const teamList = this.state.teamList; // TODO: CHECK Effifciency for starting from scratch or pulling from state
    const teamList = this.getTeamScoreList()
    if (prereqText == "Players") {
      return (
        <View></View>
      )
    }
    const gameData = this.props.navigation.getParam("gameData");
    return (
      <View style={{ flex: 1, margin:10, borderRadius:10, overflow: false }}>
        <Text style={{fontSize: 40, textAlign:"center"}}>Leaderboard:</Text>
        <FlatList
          listKey="team"
          keyExtractor={this.TeamTempExtractor}
          data={teamList}
          renderItem={this.renderTeamItem}
          extraData={this.state}
        />
      </View>
    )
  }

  renderTeamItem = (teamTemp) => {
    const index = teamTemp.index;
    const points = teamTemp.item.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") //regex came from https://stackoverflow.com/users/28324/elias-zamaria
    // const points = 100
    var item = ''
    const thisTeam = this.state.gameData.game.teams[index]
    const thisUser = this.state.userData.user_info.user_id
    const thisIndex = thisTeam.users.indexOf(thisUser)
    
    var yourTeam = false

    if (thisIndex > -1){yourTeam=true}
    console.log(yourTeam)
    // console.log('Scoreboard thinks this is your ID:',this.state.userData.user_info.user_id)
    // console.log('Scoreboard is looking for you in this team:',this.state.gameData.game.teams)

    item = "Team "+teamTemp.item.id.toString()
    // if (yourTeam == true){
    //   console.log("Found user", thisUser, "in Team", thisTeam.team_id)
      
    // } else {
    //   // item = "Team "+teamTemp.item.id.toString()+" (Enemy Team)"

    // }

    return (
      <ListItem
        key={index}
        title={item}
        rightTitle={points}
        rightSubtitle="points"
        bottomDivider
      />
    )
  }

  getTeamScoreList(){
    const teamList = this.state.teamList;
    teamScoreList = []

    // scores = this.requestScoreboardData(this.state.game_id)
    // console.log('Scores pulled from server:', scores)

    for (i=0;i<teamList.length;i++){
      teamObj = {id: teamList[i], score: Math.floor(Math.random() * 10001)}
      // teamObj = {id: teamList[i], score: this.scoreEvents.gameData.game.teams[i].score}
      teamScoreList.push(teamObj)
    }
    function compare(a, b) {
      // Use toUpperCase() to ignore character casing
      const teamA = a.score;
      const teamB = b.score;
    
      let comparison = 0;
      if (teamA > teamB) {
        comparison = 1;
      } else if (teamA < teamB) {
        comparison = -1;
      }
      return comparison*-1;
    }
    teamScoreList.sort(compare);
    return(teamScoreList)
  }

  render() {
    const gameTime = 900;
    const styles = StyleSheet.create({
      titleText: {
        fontSize: 50,
        fontWeight: "bold",
        textAlign: 'center'
      }
    });
    return (
      <View>

        {/* <BluetoothManager {...this.props} screen= "Home" ></BluetoothManager> */}
        {this.rendergameTimer(gameTime)}
        
        <View style={{ flex: 8 }}> 
          {this.renderTeamScores(this.state.num_teams)}
        </View>
      </View>
    );
  }
}