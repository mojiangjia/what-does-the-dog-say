import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Video from 'react-native-video';

export default class Detail extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      rate: 1,
      muted: false,
      resizeMode: 'contain',
      repeat: false
    };
  }

  _backToList() {
    this.props.navigator.pop();
  }

  _onLoadStart() {
    console.log('start');
  }

  _onLoad() {
    console.log('load');
  }

  _onProgress(data) {
    console.log('progress');
    console.log(data);
  }

  _onEnd() {
    console.log('end');
  }

  _onError(err) {
    console.log(err);
  }

  render() {
    let data = this.state.data;
    console.log(data);
    return (
      <View style={styles.container}>
        <Text onPress={this._backToList.bind(this)}>detail {data._id}</Text>
        <View style={styles.videoBox}>
          <Video
            ref='videoPlayer'
            source={{uri: data.url}}
            style={styles.video} 
            volume={3} 
            pause={false} 
            rate={this.state.rate} 
            muted={this.state.muted} 
            resizeMode={this.state.resizeMode} 
            repeat={this.state.repeat} 

            onLoadStart={this._onLoadStart.bind(this)}
            onLoad={this._onLoad.bind(this)}
            onProgress={this._onProgress.bind(this)} 
            onEnd={this._onEnd.bind(this)}
            onError={this._onError.bind(this)} />
        </View>
      </View>
    );
  }
}

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  videoBox: {
    width: width,
    height: 360,
    backgroundColor: '#000'
  },
  video: {
    width: width,
    height: 360,
    backgroundColor: '#000'
  }
});