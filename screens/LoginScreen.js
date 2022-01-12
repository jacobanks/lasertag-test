import React, { Component } from 'react';
import {StyleSheet,View, Text} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Button, ThemeProvider, Input, Header } from 'react-native-elements';
import { LaserTheme } from '../components/Custom_theme';
import { Container, Content, Spinner, Body,Left, Right, NativeBaseProvider } from 'native-base';
import {Web_Urls} from '../constants/webUrls';
import CustomHeader from '../components/CustomHeader';
import HomeScreen from './HomeScreen';
import Title from '../components/Title'
import storage from '../Storage'
import { Dimensions} from 'react-native';

export default class LoginScreen extends Component {
  static navigationOptions = {
    title: 'Login', // Possibly have it dynamic to name
    };
    state = {
      loading: false,
      email: '',
      emailError: '',
      pass: '',
      passError: '',
    }

    editEmail = email => {
      this.setState({ email });
    };
    editPassword = pass => {
      this.setState({ pass });
    };
    editGamekey = key => {
      this.setState({ key });
    };
    componentDidMount(){
        console.log("Login mount")
        // this.loadStorage()
        //const data = this.props.navigation.getParam("varName", "None") or else none
    } 
    
    loadStorage = () => {
        global.storage.load ({
        key: 'userData',
        autoSync: true,
        syncInBackground: true,
        syncParams: {
          extraFetchOptions: {
            // blahblah
          },
          someFlag: true
        }})
      .then(ret => {
        console.log(ret);      
        })
        .catch(err => {
          console.log(err.message);
          switch (err.name) {
            case 'NotFoundError':
              console.log((" Nodata"));
              break;
            case 'ExpiredError':
              // TODO
              break;
            }
          });
        }

    loggedIn = (userData) => {
      // Before jump, check if the session token are the same
      global.storage.save({
        key: 'userData',
        data: {
          user_id: userData.user_info.user_id,
          session_token: userData.user_info.session_token,
          password: this.state.pass,
          role: "player",
        }
      })
      // console.log("Global userdata Check before jump", userData);
      this.props.navigation.navigate("Home",{userData: userData});
    }
  
    requestLogin() { // Request all games
      this.setState({loading: true})
      const email = this.state.email;
      const password = this.state.pass;
      const payload = {
        "email": email,
        "password": password}
      var getURL = Web_Urls.Host_Url + "/user/session";
      console.log("Sending request to ",getURL)
      var request = new XMLHttpRequest();
      request.onreadystatechange = (e) => {
        if (request.readyState !== 4) {
          return;
        }
          if (request.status === 200) {
            playerResponse = JSON.parse(request.response);
            this.handleLoginResponse(playerResponse);
          } else {
            console.log("Got Error",request);
            // Needs more error handling
            this.setState({passError: "An error has occured Please try again later"});
          }
        }
        request.open('POST',getURL);
        request.setRequestHeader("Content-type","application/json");
        request.send(JSON.stringify(payload)); // Strigify?
      }
    
      handleLoginResponse = response => {
        this.setState({loading: false})
        if (response.result == 0){
          this.setState({usernameError: '', passError: ''});
          const userData = response;
          console.log("handle LoginResponse userData",userData);   
          this.loggedIn(userData);
        } else{
          console.log("Incorrect Something",response.message);
          this.setState({passError: "Incorrect Username or Password"}); 
        }
      }
    
    handleLoginResponse = response => {
      this.setState({loading: false})
      if (response.result == 0){
        this.setState({usernameError: '', passError: ''});
        const userData = response;
        this.loggedIn(userData);
      } else {
        console.log("Incorrect Something",response.message);
        this.setState({passError: "Incorrect Username or Password"}); 
      }
    }
    
    parseResponse = data => {
      if (data == "error"){
        this.setState({chemData: "Something went wrong"})
      } else if (data == "noData"){
        console.log("no data found")
      } else if (data == "notType"){
        console.log("Input type not recognized")
      } else {
        this.setState({errorStat: [false,"loading"]})
        var data = JSON.parse(data)            
      }
    }

    loginPressed = () => {
      var error = false;
      console.log("Pressed login");
      console.log(this.state);
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
      if (error == true){
        return // Breaks out of sending data
      } else{
        this.requestLogin();
      }
    };

    goSignup = () => {
      console.log("Signup")
      this.props.navigation.navigate("Signup")
    }

    renderSpinner = () => {
      if (this.state.loading == true){
        return(
          <Spinner style = {{height:5,
            paddingTop: 23,
            paddingLeft: 15,
            justifyContent: 'center', 
            alignContent: 'center'
            }} size='small' />
        )
      } else {
        return (<View/>);
      }
    }

    render() {
      return(
        <NativeBaseProvider>
        <ThemeProvider theme={LaserTheme}>
        <Header>
          <Text></Text>
          <Title><Text style= {{color: 'white'}}>{'Login'}</Text></Title>
          <Icon name='user-plus' type='feather' color='white' onPress={() => this.goSignup()} />
        </Header>
        <Container>
        <Input
          value = {this.state.email}
          autoCompleteType = 'email'
          placeholder='Email'
          returnKeyType='done'
          leftIcon={{ type: 'feather', name: 'user' }}
          errorMessage= {this.state.emailError}
          onChangeText={this.editEmail}
        />
        <Input
          value = {this.state.pass}
          autoCompleteType = 'password'
          secureTextEntry = {true}
          password={true}
          placeholder='Password'
          returnKeyType='done'
          leftIcon={{ type: 'feather', name: 'lock' }}
          errorMessage= {this.state.passError}
          onChangeText={this.editPassword}
        />
        <Button 
          style = {{
            marginTop: 3,
            marginHorizontal: 10
          }}
          title= 'Login'
          onPress={() => this.loginPressed()}
          loading = {this.state.loading}
          />
         </Container>
         </ThemeProvider>
        </NativeBaseProvider>

      );
    }
  }
  
const styles = StyleSheet.create({
  header: {
    //flex:1,
    top: 0, 
    alignItems: 'center',
    marginBottom:1
  },
  title: {
    textAlign: 'center',
    color: '#1E0F2A',
    fontSize: 19,
    fontWeight: 'bold'
  },
})