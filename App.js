/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  AsyncStorage,
} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

import List from './app/VideoList/index';
import Account from './app/Account/index';
import Login from './app/Account/login';
import Edit from './app/EditVideo/index';


export default class App extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      selectedTab: 'List',
      loggedin: false
    };
  }

  componentDidMount() {
    this._asyncAppStatus();
  }

  _asyncAppStatus() {
    AsyncStorage.getItem('user')
      .then((data) => {
        let user;
        let newState = {};

        if (data) {
          user = JSON.parse(data);
        }

        if (user && user.accessToken) {
          newState.user = user;
          newState.loggedin = true;
        }
        else {
          newState.loggedin = false;
        }

        this.setState(newState);
      })

  }

  _afterLogin(user) {
    AsyncStorage.setItem('user', JSON.stringify(user))
      .then(() => {
        this.setState({
          loggedin: true,
          user: user
        })
      })
  }

  _logout() {
    AsyncStorage.removeItem('user');
    this.setState({
      loggedin: false,
      user: null
    });
  }

  render() {

    if (!this.state.loggedin) {
      return <Login afterLogin={this._afterLogin.bind(this)}/>;
    }

    return (
      <TabBarIOS tintColor="#ee735c">
        <Icon.TabBarItem
          iconName='ios-videocam-outline'
          selectedIconName='ios-videocam'
          selected={this.state.selectedTab === 'List'}
          onPress={() => {
            this.setState({
              selectedTab: 'List',
            });
          }}>
          <Navigator
            initialRoute={{
              name: 'list',
              component: List,
              params: {
                user: this.state.user
              }
            }}
            configureScene={(route) => {
              return Navigator.SceneConfigs.FloatFromRight
            }}
            renderScene={(route, navigator) => {
              const Component = route.component

              return <Component {...route.params} navigator={navigator} />
            }} />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-recording-outline'
          selectedIconName='ios-recording'
          selected={this.state.selectedTab === 'Edit'}
          onPress={() => {
            this.setState({
              selectedTab: 'Edit',
            });
          }}>
          <Edit user={this.state.user} />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-more-outline'
          selectedIconName='ios-more'
          selected={this.state.selectedTab === 'Account'}
          onPress={() => {
            this.setState({
              selectedTab: 'Account',
            });
          }}>
          <Account user={this.state.user} logout={this._logout.bind(this)}/>
        </Icon.TabBarItem>
      </TabBarIOS>
    );

  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
