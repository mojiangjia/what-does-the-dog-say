import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import Video from 'react-native-video';

export default class Detail extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      error: false,
      videoLoaded: false,
      rate: 1,
      paused: false,
      muted: false,
      resizeMode: 'contain',
      repeat: false,
      videoProgress: 0.01,
      videoLength: 0,
      currentTime: 0,
      playing: false
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
    const duration = data.playableDuration;
    const currentTime = data.currentTime;
    const percent = Number((currentTime / duration).toFixed(2));

    let newState = {
      videoLength: duration,
      currentTime: Number(currentTime.toFixed(2)),
      videoProgress: percent
    };

    if (!this.state.videoLoaded) {
      newState.videoLoaded = true;
    }
    if (!this.state.playing) {
      newState.playing = true;
    }
    this.setState(newState);
  }

  _onEnd() {
    console.log('end')
    this.setState({
      videoProgress: 1,
      playing: false
    });
  }

  _onError(err) {
    this.setState({
      error: true
    });
    console.log(err);
  }

  _replay() {
    this.refs.videoPlayer.seek(0);
  }

  _pause() {
    this.setState({
      paused: !this.state.paused
    });
  }

  _resume() {
    if (this.state.paused) {
      this.setState({
        paused: false
      });
    }
  }

  render() {
    let data = this.state.data;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.back} 
            onPress={this._backToList.bind(this)}>
            <Icon 
              name='ios-arrow-back'
              style={styles.backIcon}
            />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>Detail</Text>
        </View>
        <View style={styles.videoBox}>
          <Video
            ref='videoPlayer'
            source={{uri: data.url}}
            style={styles.video} 
            volume={3} 
            paused={this.state.paused} 
            rate={this.state.rate} 
            muted={this.state.muted} 
            resizeMode={this.state.resizeMode} 
            repeat={this.state.repeat} 

            onLoadStart={this._onLoadStart.bind(this)}
            onLoad={this._onLoad.bind(this)}
            onProgress={this._onProgress.bind(this)} 
            onEnd={this._onEnd.bind(this)}
            onError={this._onError.bind(this)} />
          {
            !this.state.videoLoaded && <ActivityIndicator color='#ee735c' style={styles.loading} />
          }
          {
            this.state.error && <Text style={styles.errorText}>Error</Text>
          }
          {
            this.state.videoLoaded && !this.state.playing
            ? <Icon
              onPress={this._replay.bind(this)}
              name='ios-play' 
              style={styles.play} 
              size={50} />
            : null 
          }
          {
            this.state.videoLoaded && this.state.playing
            ? <TouchableOpacity 
                onPress={this._pause.bind(this)}
                style={styles.pause}>
                {
                  this.state.paused
                  ? <Icon 
                      onPress={this._resume.bind(this)}
                      name='ios-play'
                      style={styles.play}
                      size={50} />
                  : <Text></Text>
                }
              </TouchableOpacity>
            : null
          }
          <View style={styles.progressBar}>
            <View style={[styles.progress, {width: width * this.state.videoProgress}]}></View>
          </View>
        </View>
      </View>
    );
  }
}

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: 64,
    paddingTop: 20,
    paddingLeft: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff'
  },
  back: {
    position: 'absolute',
    left: 12, 
    top: 32,
    width: 50,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backIcon: {
    color: '#999',
    marginRight: 5,
  },
  backText: {
    color: '#999',
  },
  title: {
    fontSize: 15,
    width: width - 120,
    textAlign: 'center'
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
  },
  errorText: {
    position: 'absolute',
    left: 0,
    top: 180,
    width: width,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: 'transparent'
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 140,
    width: width,
    alignSelf: 'center',
    backgroundColor: 'transparent'
  },
  progressBar: {
    width: width,
    height: 2,
    backgroundColor: '#ccc'
  },
  progress: {
    width: 1,
    height: 2,
    backgroundColor: '#ff6600'
  },
  play: {
    position: 'absolute',
    top: 140,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    paddingTop: 6,
    paddingLeft: 20,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66'
  },
  pause: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width,
    height: 360
  }
});