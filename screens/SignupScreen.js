import React, { Component } from 'react';
import {StyleSheet,View,Text} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import EntypoI from 'react-native-vector-icons/Entypo'
import { Button, ThemeProvider, Input, Header } from 'react-native-elements';
import { LaserTheme } from '../components/Custom_theme';
import { Container, Content, Spinner, Body,Left, Right, NativeBaseProvider } from 'native-base';
import {Web_Urls} from '../constants/webUrls';
import CustomHeader from '../components/CustomHeader';
import HomeScreen from './HomeScreen';
import Title from '../components/Title'

export default class SignupScreen extends Component {
  static navigationOptions = {
    title: 'Sign up', // Possibly have it dynamic to name
  };
  state = {
    loading: false,
    username: '',
    usernameError: '',
    pass: '',
    passError: '',
    confirmPass: '',
    conFirmPassError: ''
  }

  editUsername = username => {this.setState({ username });};
  editEmail = email => {this.setState({ email });};
  editPassword = pass => {this.setState({ pass });};
  editConfirmPass = confirmPass => {this.setState({ confirmPass });};
  componentDidMount(){
      //const data = this.props.navigation.getParam("varName", "None") or else none
  } 
  
  signupPressed = () => {
    var error = false;
    console.log("Pressed Signup");
    console.log(this.state);
    if (this.state.username == '') {// Also run through alphanumeric validator
      console.log("Empty usname");
      this.setState({usernameError: "Must Input Username"});
      error =true;
    }
    if (this.state.email == '') {// Also run through alphanumeric validator
      console.log("Empty email");
      this.setState({emailError: "Must Input Email"});
      error =true;
    }
    if (this.state.pass == '') {// Also run through alphanumeric validator
      console.log("Empty Password");
      this.setState({passError: "Must Input Password"});
      error = true
    } 
    if (this.state.conFirmPass == '') {// Also run through alphanumeric validator
      console.log("Empty Password");
      this.setState({conFirmPassError: "Must Confirm Password"});
      error = true
    } else if (this.state.confirmPass != this.state.pass){
      console.log("Unmatching password")
      this.setState({conFirmPassError: "Passwords Do not match"});
      error = true
    }

    if (error == true){
      return // Breaks out of sending data
    } else {
      this.setState({usernameError: '', emailError: '', passError: '', conFirmPassError: ''});
      this.requestCreatePlayer()
    }
  };

  requestCreatePlayer(gameData){ 
    this.setState({loading: true})
    const username = this.state.username;
    const email = this.state.email;
    const password = this.state.pass;
    const payload = {
      "username": username,
      "email": email,
      "password": password
    }
    var getURL = Web_Urls.Host_Url + "/user";
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        playerResponse = JSON.parse(request.response);
        this.handleCreatePlayerResponse(playerResponse);
      } else {
        console.log("Got Error",request);
        this.setState({finalError: "An error has occured. Please try again later."});
      }
    }
    request.open('POST',getURL);
    request.setRequestHeader("Content-type","application/json");
    request.send(JSON.stringify(payload)); // Strigify?
  }
    
    handleCreatePlayerResponse = response => {
        this.setState({loading: false})
        if (response.result == 0){
          this.setState({usernameError: '', emailError: '', passError: '', conFirmPassError: ''});
          userData = response.body;
          console.log("UserData",userData)
          // Save user data 
          global.storage.save({
          key: 'userData',
            data: {
              username: this.state.username,
              email: this.state.email,
              password: this.state.confirmPass,
            }
          })
          // Navigate to HomeScreen
          this.props.navigation.navigate("Login",{userData:userData});
        } else{
          console.log("OOF",response);
          if (response.result == -1){
            this.setState({usernameError: response.reason})
          }
          else if (response.result == -2){
            this.setState({emailError: response.reason})
          }
          else{
            this.setState({conFirmPassError: "Something went wrong"})
          }
        }
      }
      
  goLogin = () => {this.props.navigation.navigate("Login")}

  renderSpinner = () => {
    if (this.state.loading == true){
      return(
        <Spinner style = {{height:5,
          paddingTop: 23,
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
        <ThemeProvider theme={LaserTheme}>
        <Header>
          <Icon name='chevron-left' type='feather' color='white' onPress={() => this.goLogin()} />
          <Title><Text style= {{color: 'white'}}>{'Signup'}</Text></Title>
          <Text></Text>
        </Header>
        <Container>
          <Input
            //autoCompleteType = 'username'
            placeholder='Username'
            returnKeyType='done'
            leftIcon={{ name: 'user', color: '#9370db' }}
            errorMessage= {this.state.usernameError}
            onChangeText={this.editUsername}
          />
          <Input
            //autoCompleteType = 'username'
            placeholder='Email'
            returnKeyType='done'
            leftIcon={{ name: 'mail', color:'#9370db' }}
            errorMessage= {this.state.emailError}
            onChangeText={this.editEmail}
          />
          <Input
            //autoCompleteType = 'password'
            secureTextEntry = {true}
            password={true}
            placeholder='Password'
            returnKeyType='done'
            leftIcon={{ name: 'lock', color:'#9370db' }}
            errorMessage= {this.state.passError}
            onChangeText={this.editPassword}
          />
          <Input
            //autoCompleteType = 'password'
            secureTextEntry = {true}
            password={true}
            placeholder='Confirm Password'
            returnKeyType='done'
            leftIcon={{ name: 'lock', color:'#9370db' }}
            errorMessage= {this.state.conFirmPassError}
            onChangeText={this.editConfirmPass}
          />
          <Button 
            style = {{
              marginTop: 3,
              padding: 10
            }}
            title= 'Sign Up'
            onPress={() => this.signupPressed()}
            errorMessage= {this.state.finalError}
            loading = {this.state.loading}
            />
          </Container>
          </ThemeProvider>
      </NativeBaseProvider>
      );
    }
  }