import './fonts/Montserrat/Montserrat-Regular.ttf'; 

//Updated Pallette:
//#7447d1 -- Purple       Variants: #845cd6 and #9370db   Justification: Lighter, less washed out than official logo colors. More friendly.
//#d1b947 -- Gold         Variants: #d6c15c and #dbc970   Justification: Complements proposed purple. Also less washed out than official colors.
//#4a4a4a -- Text Color   Variants: None                  Justification: If it ain't broke...

export const LaserTheme = {
  colors: {
    primary: 'white',
    background: 'white',
    card: 'white'
  },
  Body: {
    backgroundColor: 'white'
  },
  Button: {
    raised: false,
    titleStyle: {
      color: 'white',
    },
    buttonStyle: {
      backgroundColor: '#7447d1',
      borderRadius: 50, // 0-50
      paddingVertical: 5, 
      justifyContent: 'center', 
      marginTop:10
    }
  },
  Header:{
    backgroundColor:'#7447d1'
  },
  Input:{
    errorStyle:{
      color:'#7447d1'
    },
    containerStyle:{
      borderRadius:10,
    },
    leftIconContainerStyle:{
      // backgroundColor: 'white',
      marginRight: 8,
      marginLeft: 3
    },
    // backgroundColor: 'white',
  },
  Icon:{
    color:'#7447d1',
    size:24,
    type:'feather'
  },
  Text:{
    fontFamily:'Montserrat-Regular',
    color:'#4a4a4a'
  }
};
