import React, { Component } from 'react';
import { StyleSheet, View, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LaserTheme from './Custom_theme'
import { Container, NativeBaseProvider } from 'native-base';
import { Text, ThemeProvider, Button, Card} from 'react-native-elements';
import AppImages from "../assets/index"

const dimensions = Dimensions.get('window');
const Container_Width = Math.round(dimensions.width *0.95);
const Container_Height = Math.round(dimensions.height * 0.50);
const imageHeight = Math.round(Container_Height* 0.150);

export default class ButtonMenu extends Component{
    renderItem = (text, i) => {
        const {onPressItem} = this.props
        const iconMap = ['bluetooth','users','plus-square']
        const descriptionMap = ['Connect, disconnect, or manage your laser gun','Enter a game code to join an existing game','Create and edit settings for a game']
        return ( 
            <Card 
                key = {i}
                containerStyle={{width: Container_Width, backgroundColor: '#fefefe', borderWidth:1, borderRadius:10, overflow:'hidden', }}
                wrapperStyle={{height: Container_Width/2.1}}
                image={AppImages[i]}
                imageStyle={{height: imageHeight*1.5,}}
            >
                <Text style={{justifyContent: 'center', textAlign:'center', }}>
                    {descriptionMap[i]}
                </Text>      
                <NativeBaseProvider>
                <Container style = {{flex: 0.3, flexDirection: 'row', justifyContent:'center', paddingTop:10}}>
                    <Button 
                        buttonStyle={styles.myButton}
                        icon={<Icon name = {iconMap[i]} size=  {15} color= "white"/>}
                        title= {text}
                        onPress={ () => onPressItem(i)}
                        />
                </Container>
                </NativeBaseProvider>      
            </Card>               
        )
    }

    render(){
        const {menuOptions} = this.props
        console.log(menuOptions)
        return (
            // <ThemeProvider theme={LaserTheme}>
                <View style= {styles.MenuStyle}>
                    {menuOptions.map(this.renderItem)}
                </View>
            // </ThemeProvider>
        )
    }
}

const styles = StyleSheet.create({
    MenuStyle: {
        flex: 10,
        flexDirection: 'column',  
        marginBottom: 5,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'white',
    },  
    myButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#7447d1',
        borderRadius: 50, // 0-50
        paddingHorizontal: 15,
        paddingVertical: 5
    },
    buttonText: {
        color: 'black',
        fontSize: 24
    }
  });