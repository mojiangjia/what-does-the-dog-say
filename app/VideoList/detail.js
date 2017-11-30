import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
  ListView,
  TextInput,
  Modal
} from 'react-native';
import Video from 'react-native-video';

import request from '../utils/request';
import config from '../utils/config';

export default class Detail extends Component<{}> {
  constructor(props) {
    super(props);
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 != r2});
    this.state = {
      data: this.props.data,
      dataSource: ds.cloneWithRows([]),

      error: false,
      videoLoaded: false,
      videoProgress: 0.01,
      videoLength: 0,
      currentTime: 0,

      playing: false,
      rate: 1,
      paused: false,
      muted: false,
      resizeMode: 'contain',
      repeat: false,

      // animationType
      modalVisible: false
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

  _onFocus() {
    this._setModalVisible(true);
  }

  _onBlur() {

  }

  _closeModal() {
    this._setModalVisible(false);
  }

  _setModalVisible(isVisible) {
    this.setState({
      modalVisible: isVisible
    });  
  }

  componentDidMount() {
    console.log('mount');
    this._fetchData();
  }

  _fetchData() {
    const url = config.api.base + config.api.comment;

    request.get(url, {
      videoId: 123,
      accessToken: 'mj'
    })
      .then((data) => {
        if (data && data.success) {
          const comments = data.data;
          if (comments && comments.length > 0) {
            this.setState({
              comments: comments,
              dataSource: this.state.dataSource.cloneWithRows(comments)
            });
          }
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  _renderRow(row) {
    console.log(row);
    return (
      <View key={row._id} style={styles.replyBox}>
        <Image style={styles.replyAvatar} source={{uri: row.replyBy.avatar}}/>
            <View style={styles.reply}>
              <Text style={styles.replyNickname}>{row.replyBy.nickname}</Text>
              <Text style={styles.replyContent}>{row.replyBy.content}</Text>
            </View>
      </View>
    );
  }

  _renderHeader() {
    const data = this.state.data;
    return (
      <View style={styles.listHeader}>
        <View style={styles.info}>
          <Image style={styles.avatar} source={{uri: data.author.avatar}}/>
          <View style={styles.description}>
            <Text style={styles.nickname}>{data.author.nickname}</Text>
            <Text style={styles.title}>{data.title}</Text>
          </View>
        </View>
        <View style={styles.commentBox}>
          <View style={styles.comment}>
            <Text>New comment</Text>
            <TextInput 
              placeholder='Say someting'
              style={styles.content}
              multiline={true}
              onFocus={this._onFocus.bind(this)}
            />
          </View>
        </View>
        <View style={styles.comments}>
          <Text styles={styles.commentHeader}>Comments</Text>
        </View>
      </View>
    );
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
          <Text style={styles.headerTitle} numberOfLines={1}>Detail</Text>
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
        <ListView 
          dataSource={this.state.dataSource}
          renderRow={this._renderRow.bind(this)} 
          renderHeader={this._renderHeader.bind(this)} 
          enableEmptySections={true} 
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false} 
        />

        <Modal
          animationType={'slide'}
          visible={this.state.modalVisible}
          onRequestClose={this._closeModal.bind(this)}>
          <View style={styles.modalContainer}>
            <Icon
              name='ios-close-outline'
              style={styles.closeIcon} 
              onPress={this._closeModal.bind(this)} />
            <View style={styles.commentBox}>
          <View style={styles.comment}>
            <Text>New comment</Text>
            <TextInput 
              placeholder='Say someting'
              style={styles.content}
              multiline={true}
              onFocus={this._onFocus.bind(this)}
              onBlur={this._onBlur.bind(this)}
              defaultValue={this.state.content}
              onChangeText={(text) => {
                this.setState({
                  content: text
                });
              }}
            />
          </View>
        </View>
          </View>
        </Modal>
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
  modalContainer: {
    flex: 1,
    paddingTop: 45,
    backgroundColor: '#fff'
  },
  closeIcon: {
    alignSelf: 'center',
    fontSize: 30,
    color: '#ee753c'
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
  headerTitle: {
    fontSize: 15,
    width: width - 120,
    textAlign: 'center'
  },
  videoBox: {
    width: width,
    height: width * 0.56,
    backgroundColor: '#000'
  },
  video: {
    width: width,
    height: width * 0.56,
    backgroundColor: '#000'
  },
  errorText: {
    position: 'absolute',
    left: 0,
    top: 90,
    width: width,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: 'transparent'
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 80,
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
    top: 80,
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
    height: width * 0.56,
    backgroundColor: 'transparent'
  },


  info: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  avatar: {
    width: 60,
    height: 60,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 30
  },
  description: {
    flex: 1
  },
  nickname: {
    fontSize: 18
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    color: '#666'
  },

  replyBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10
  },
  replyAvatar: {
    width: 40,
    height: 40,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 20
  },
  reply: {
    flex: 1
  },
  replyNickname: {
    color: '#666'
  },
  replyContent: {
    marginTop: 4,
    color: '#666'
  },

  listHeader: {
    width: width,
    marginTop: 10
  },
  commentBox: {
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    width: width
  },
  content: {
    paddingLeft: 2,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: 14,
    height: 80
  },

  comments: {
    width: width,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  }

});