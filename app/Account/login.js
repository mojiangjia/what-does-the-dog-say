import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  TextInput,
  AsyncStorage,
  AlertIOS,
  Dimensions
} from 'react-native';

import Button from 'react-native-button';
import {CountDownText} from 'react-native-sk-countdown';

import request from '../utils/request';
import config from '../utils/config';

export default class Login extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: '',
      verifyCode: '',
      codeSent: false,
      countDone: false
    };
  }

  _submit() {
    const phoneNumber = this.state.phoneNumber;
    const verifyCode = this.state.verifyCode;

    if (!phoneNumber || ! verifyCode) {
      return AlertIOS.alert('please enter phone number and verify code');
    }

    let body = {
      phoneNumber: phoneNumber,
      verifyCode: verifyCode
    };


    const url = config.api.base + config.api.auth;
    
    request.post(url, body)
      .then((data) => {
        if (data && data.success) {
          console.log('login');
          console.log(data);
        }
        else {
          AlertIOS.alert('failed to login, please retry');
        }
      })
      .catch((err) => {
        AlertIOS.alert('failed to login, check network status');
      })
  }

  _sendVerifyCode() {
    const phoneNumber = this.state.phoneNumber;

    if (!phoneNumber) {
      return AlertIOS.alert('please enter phone number');
    }

    let body = {
      phoneNumber: phoneNumber
    };


    const url = config.api.base + config.api.signup;
    
    request.post(url, body)
      .then((data) => {
        if (data && data.success) {
          this._showVerifyCode();
        }
        else {
          AlertIOS.alert('failed to get verify code, check your phone number');
        }
      })
      .catch((err) => {
        AlertIOS.alert('failed to get verify code, check network status');
      })
  }

  _showVerifyCode() {
    this.setState({
      codeSent: true,
      countDone: false
    });
  }

  _countDone() {
    this.setState({countDone: true});
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.signupBox}>
          <Text style={styles.title}>Login</Text>
          <TextInput
            placeholder='phone number'
            autoCapitalize={'none'}
            autoCorrect={false}
            keyboardType={'numeric'}
            style={styles.input}
            onChangeText={(text) => {
              this.setState({phoneNumber: text});
            }} />

            {
              this.state.codeSent
              ? <View style={styles.verifyCodeBox}>
                  <TextInput
                    placeholder='verify code'
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    keyboardType={'numeric'}
                    style={[styles.input, {flex:1}]}
                    onChangeText={(text) => {
                      this.setState({verifyCode: text});
                    }} />

                  {
                    this.state.countDone
                    ? <Button 
                      style={styles.countBtn} 
                      onPress={this._sendVerifyCode.bind(this)}>get verify code</Button>
                    : <CountDownText
                      style={styles.countBtn}
                      countType='seconds' 
                      auto={true} 
                      afterEnd={this._countDone.bind(this)} 
                      timeLeft={10}
                      step={-1} 
                      startText='get verify code' 
                      endText='get verify code' 
                      intervalText={(sec) => sec + ' seconds remaining'} 
                      />
                  }
                </View>
              : null
            }

            {
              this.state.codeSent
              ? <Button 
                style={styles.btn}
                onPress={this._submit.bind(this)}>Login</Button>
              : <Button
                style={styles.btn}
                onPress={this._sendVerifyCode.bind(this)}>Get Verify Code</Button>
            }
        </View>
      </View>
    );
  }
}

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F5FCFF',
  },

  signupBox: {
    marginTop: 30,
    height: 100
  },

  title: {
    marginBottom: 20,
    color: '#333',
    fontSize: 20,
    textAlign: 'center'
  },

  input: {
    // width: width - 180,
    height: 40,
    padding: 5,
    color: '#666',
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 4
  },

  btn: {
    padding: 10,
    marginTop: 10,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius: 4,
    color: '#ee735c'
  },

  verifyCodeBox: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  countBtn: {
    width: 180,
    height: 40,
    padding: 10,
    marginLeft: 8,
    backgroundColor: '#ee735c',
    color: '#fff',
    // borderWidth: 2,
    // borderColor: '#ee735c',
    // borderRadius: 10,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600'
  }
});