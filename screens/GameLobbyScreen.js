import React, { Component } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Button, ThemeProvider, ListItem } from 'react-native-elements';
import { LaserTheme } from '../components/Custom_theme';
import CustomHeader from '../components/CustomHeader';
import { Web_Urls } from '../constants/webUrls';

export default class GameLobbyScreen extends Component {
  static navigationOptions = {
    title: 'Game lobby', // Where all players will hang out before game starts
  };
  constructor() {
    super();
    this.state = {
      game_id: null,
      userData: {},
      teamData: {},
      gameData: {},
      loading: true,
      host: '',
      teamLoadError: '',
      teamList: [],
      defaultColorList: [
        'red',
        'blue',
        'green',
        'gray',
        'purple',
        'orange',
        'pink'
      ],
      availibleTeams: [],
      gameModeIndex: 1,
      gameModeText: 'solo',
      num_teams: null,                   //temp
      host: ''
    }
  }

  componentDidMount() {
    console.log("Join Game Mount")
    const userData = this.props.navigation.getParam("userData", null);
    const gameData = this.props.navigation.getParam("gameData");


    // console.log(userData, "+++", gameData);     //ERROR
    const game_id = gameData.game.game_id;
    const host = this.props.navigation.getParam("host");
    this.setState({ userData, gameData, game_id, host });

    this.requestTeams(game_id);

    console.log("CHECKING", this.state.num_teams);
    // this.populateTemplateTeams(); 
  }

  renderTeamTemplate = (num_teams) => {
    const prereqText = ((this.state.gameModeIndex == 0) ? "Players" : "Teams");
    const teamList = this.state.teamList; // TODO: CHECK Effifciency for starting from scratch or pulling from state
    if (prereqText == "Players") {
      return (
        <View></View>
      )
    }
    gameData = this.props.navigation.getParam("gameData");
    // console.log("Lobby Game Data:", gameData)
    userData = this.props.navigation.getParam("userData");
    // console.log("Lobby User Data:", userData)
    if (num_teams == 0 && gameData.game.game_mode == 'solo') {   
      //If team num == 0 & game mode is solo; each player should be automatically assigned to as a team
      //Send each person to Lobby screen directly
      this.props.navigation.navigate('Loading',{userData: this.state.userData, gameData: this.state.gameData, host: this.state.host})
      console.log("UserData (Solo Game) from Lobby:", this.state.userData)
      console.log("Should not be possible -- SOLO");
      console.log("NUM X, Game Data", this.gameData);
    } else if ( num_teams == 0 ){
      return (<Text>You should never see this... hacker</Text>);
    } else {
      // console.log("UserData (Team Game) from Lobby:", this.state.userData)
      // this.props.navigation.navigate('Loading',{userData: this.state.userData, gameData: gameData, host: this.state.host})
    }
    //this.setState({teamList});
    return (
      <View style={{ flex: 1, margin:10, borderRadius:10, overflow: false }}>
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

  updateNumTeams = num_teams => {
    const teamList = this.state.teamList;
    const colorList = this.state.defaultColorList;
    const listlen = teamList.length;
    if (listlen < num_teams) {
      for (i = listlen; i < num_teams; i++) {
        let index = i + 1;
        teamList.push({ color: colorList[i], name: "New Team " + index, color_name: '', team_id: null });
      }
    } else if (listlen > num_teams) {
      for (i = 0; i < listlen - num_teams; i++) {
        teamList.pop();
      }
    }
    this.setState({ teamList, num_teams });
  }

  TeamTempExtractor = (item, index) => index.toString()

  renderTeamItem = (teamTemp) => {
    const index = teamTemp.index;
    const item = teamTemp.item;
    const defaultColor = this.state.defaultColorList[index];
    const selectedTeam = this.state.teamList[index];
    let teamColor = defaultColor;
    let isNewText = 'New Team'
    // console.log(defaultColor)
    if (selectedTeam.color != "") {
      teamColor = defaultColor;
      isNewText = "Selected Team"
    }
    return (
    <View>
      <ListItem
        key={item.name}
        title={item.name}
        titleStyle={{ fontSize: 12, color: teamColor }}
        containerStyle={{backgroundColor: "#FFFFFF"}}
        subtitle={isNewText}
        subtitleStyle={{fontSize: 10, color: '#4a4a4a',}}
        rightIcon={{ type: 'feather', name: 'chevron-right', color: teamColor}} onPress={this.handleClick, handleClick = () => {this.selectTeam(index)}} 
        leftIcon={{ name: 'users', type: 'feather', color: teamColor } /*Could be Avatar as well? or team/League indicator */}
        bottomDivider
      />
    </View>)
  }

  renderTeamPicker = (index, item) => {
    const all_teams = this.state.all_teams;
    let availibleTeams = this.state.availibleTeams;
    return (
      <Button
        defaultValue="Select Team"
        style={{
        }}
        textStyle={{
          color: 'white',
          fontSize: 10,
        }}
        onPress={this.handleClick, handleClick = () => {this.selectTeam(index)}} 
       />
    )
  }

  selectTeam(index) {
    console.log("Adding to team", this.state.userData)
    const session_token = this.state.userData.user_info.session_token;
    const payload = {"session_token": session_token}
    var getURL = Web_Urls.Host_Url + "/team/" + teamList.teams[index]+ "/users"
    console.log("Sending request to ", getURL)
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        response = JSON.parse(request.response);
        console.log("Select team", response);
        if (response.result === -1){
          alert("Go away, hacker");
        } else {
          // console.log("Lobby Host: ", this.state.host)
          // console.log('Lobby User Data getting sent to Loading.js:',this.state.userData)
          this.props.navigation.navigate('Loading',{userData: this.state.userData, gameData:this.state.gameData, host: this.state.host})
        }
      } else {
        console.log("Trouble") // Needs more error handling   
      }
    }
    request.open('PATCH', getURL);
    request.setRequestHeader("Content-type","application/json");
    request.send(JSON.stringify(payload));
  }

  populateTemplateTeams = () => {
    const teamList = this.state.teamList;
    for (i = 1; i <= this.state.num_teams; i++) {
      teamList.push({ color: "", name: "New Team " + i, color_name: '', team_id: this.state.teamData.teams[i - 1] });
    }
    this.setState({ teamList });
  }

  requestTeams(game_id) {
    var getURL = Web_Urls.Host_Url + "/game/" + game_id + "/teams"
    console.log("Requesting Teams: Sending request to ", getURL)
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        teamList = JSON.parse(request.response);
        // console.log("Got teamList", teamList.teams);
        // console.log(teamList.teams.length);
        // const num_teams = teamList.teams.length;
        // Get unassigned players as well
        this.setState({ teamData: teamList, num_teams: teamList.teams.length })
        this.populateTemplateTeams();
      } else {
        console.log("Trouble fetching team data") // Needs more error handling   
      }
    }
    request.open('GET', getURL);
    request.send();
  }
  
  render() {
    return (
      <ThemeProvider theme={LaserTheme}>
        <CustomHeader {...this.props} headerText="Game Lobby" headerType="lobby" />
        {/* <Text>{this.state.game_id} {JSON.stringify(this.state.teamData.teams)}</Text> Renders game ID and all team IDs - Delete or comment out when ready for deployment */}
        <Text style = {{ color: '#4a4a4a', fontSize: 40, textAlign: 'center'}}>Choose a Team</Text>
        <View style={{ flex: 2 }}>
          {this.renderTeamTemplate(this.state.num_teams)}
        </View>
      </ThemeProvider>
    );
  }
}