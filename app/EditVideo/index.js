import _ from 'lodash';
import uuid from 'uuid';
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  TouchableOpacity,
  Image,
  Dimensions,
  AlertIOS,
  Platform,
  PermissionsAndroid,
  Modal,
  TextInput
} from 'react-native';
import Button from 'react-native-button';
import Video from 'react-native-video';
import ImagePicker from 'react-native-image-picker';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import Sound from 'react-native-sound';
import {CountDownText} from 'react-native-sk-countdown';
import {Circle} from 'react-native-progress';

import config from '../utils/config';
import request from '../utils/request';

const videoOptions = {
  title: 'Select Video',
  cancelButtonTitle: 'Cancal',
  takePhotoButtonTitle: 'Record video',
  chooseFromLibraryButtonTitle: 'Choose from library',
  videoQuality: 'medium',
  mediaType: 'video',
  durationLimit: 10,
  noData: false,
  storageOptions: { 
    skipBackup: true, 
    path: 'images'
  }
};


const defaultState = {

  previewVideo: null,

  videoLength: 0,
  currentTime: 0,
  videoProgress: 0,

  rate: 1,
  paused: false,
  muted: true,
  resizeMode: 'contain',
  repeat: false,

  videoUploadingProgress: 0,
  videoUploaded: false,
  videoUploading: false,

  video: null,
  videoId: null,
  countDown: false,
  recording: false,

  audio: null,
  audioId: null,
  audioPath: AudioUtils.DocumentDirectoryPath + '/dogsays.aac',
  audioPlaying: false,
  recorded: false,

  audioUploadingProgress: 0,
  audioUploaded: false,
  audioUploading: false,

  modalVisible: false,
  title: '',
  publishing: false,
  willPublish: false,
  publishProgress: 0.2
};

export default class Edit extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = _.clone(defaultState);
  }

  componentDidMount() {
    this._initAudio();
  }

  _initAudio() {
    this._checkPermission().then((hasPermission) => {
      this.setState({ hasPermission });

      if (!hasPermission) return;

      this._prepareRecordingPath(this.state.audioPath);

      AudioRecorder.onProgress = (data) => {
        console.log(Math.floor(data.currentTime));
      };

      AudioRecorder.onFinished = (data) => {
        console.log('recording done');
      };
    });
  }

  _checkPermission() {
    if (Platform.OS !== 'android') {
      return Promise.resolve(true);
    }

    const rationale = {
      'title': 'Microphone Permission',
      'message': 'Dogsays needs access to your microphone so you can record audio.'
    };

    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
      .then((result) => {
        console.log('Permission result:', result);
        return (result === true || result === PermissionsAndroid.RESULTS.GRANTED);
      });
  }

  _prepareRecordingPath(audioPath){
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "High",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000
    });
  }

  _pickVideo() {
    ImagePicker.showImagePicker(videoOptions, (res) => {
      if (res.didCancel) {
        return;
      }
      else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      }
      else {
        let state = _.clone(defaultState);
        let source = res.uri;

        this.setState(state, () => {
          this.setState({
            previewVideo: source
          });
        });
        const timestamp = Date.now();

        this._getSign('video', timestamp)
        .then((data) => {
          if (data && data.success) {
            const signature = data.data;

            let body = new FormData();

            body.append('folder', 'video');
            body.append('signature', signature);
            body.append('tags', 'app,video');
            body.append('timestamp', timestamp);
            body.append('api_key', config.cloudinary.api_key);
            body.append('resource_type', 'video');
            body.append('file', {
              type: 'video/mp4',
              uri: source,
              name: res.fileName
            });

            this._upload(body, 'video');
          }
        })
        .catch((e) => {
          console.log(e);
        })

      }
    });
  }

  _uploadAudio() {
    const timestamp = Date.now();
    this._getSign('audio', timestamp)
    .then((data) => {
      if (data && data.success) {
        const signature = data.data;

        let body = new FormData();

        body.append('folder', 'audio');
        body.append('signature', signature);
        body.append('tags', 'app,audio');
        body.append('timestamp', timestamp);
        body.append('api_key', config.cloudinary.api_key);
        body.append('resource_type', 'video');
        body.append('file', {
          type: 'video/mp4',
          uri: 'file://' + this.state.audioPath,
          name: 'dogsays.aac'
        });

        this._upload(body, 'audio');
      }
    })
    .catch((e) => {
      console.log(e);
    })
  }

  _getSign(type, timestamp) {
    const signatureURL = config.api.base + config.api.signature;

    // get signature from sever
    return request.post(signatureURL, {
      accessToken: this.props.user.accessToken,
      timestamp: timestamp,
      type: type
    });
    
  }

  _upload(body, type) {
    let xhr = new XMLHttpRequest();
    const url = config.cloudinary.video;

    let newState = {};

    newState[type + 'Uploading'] = true;
    newState[type + 'Uploaded'] = false;
    newState[type + 'UploadingProgress'] = 0;

    this.setState(newState);

    xhr.open('POST', url);
    xhr.onload = () => {
      if (xhr.status !== 200) {
        AlertIOS.alert('request failed');
        console.log(xhr.responseText);
        return;
      }

      if (!xhr.responseText) {
        AlertIOS.alert('request failed');
        return;
      }

      let response;

      try {
        response = JSON.parse(xhr.response);
      }
      catch(e) {
        console.log(e);
        console.log('parse failed')
      }

      if (response && response.public_id) {
        let newState = {};
        newState[type + 'Uploading'] = false;
        newState[type + 'Uploaded'] = true;
        newState[type] = response;

        this.setState(newState);

        console.log('Upload success');
        console.log(this.state.videoId);

        // if (type === 'audio') return;
        const mediaURL = config.api.base + config.api[type];

        let body = {
          accessToken: this.props.user.accessToken,
        };

        body[type] = response;

        if (type === 'audio') {
          body.videoId = this.state.videoId;
        };

        request.post(mediaURL, body)
        .catch((e) => {
          console.log(e);
          if (type === 'video') {
            AlertIOS.alert('Video synchronization falied, please upload again');
          }
          else if (type === 'audio') {
            AlertIOS.alert('Audio synchronization falied, please upload again');
          }
        })
        .then((data) => {
          if (data || data.success) {
            let mediaState = {};
            mediaState[type + 'Id'] = data.data;

            if (type === 'audio') {
              this._showModal();
              mediaState.willPublish = true;
            }

            this.setState(mediaState);
          }
          else {
            if (type === 'video') {
              AlertIOS.alert('Video synchronization falied, please upload again');
            }
            else if (type === 'audio') {
              AlertIOS.alert('Audio synchronization falied, please upload again');
            }
          }
        })

      }
    };

    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Number((event.loaded / event.total).toFixed(2));

          let progress = {};
          progress[type + 'UploadingProgress'] = percent;
          this.setState(progress);
        }
      }
    }

    xhr.send(body);
  }

  _onLoad(data) {
    const duration = data.duration;
    this.setState({
      videoLength: duration,
    });  
  }

  _onProgress(data) {
    const currentTime = data.currentTime;
    const percent = Number((currentTime / this.state.videoLength).toFixed(2));

    this.setState({
      currentTime: Number(currentTime.toFixed(2)),
      videoProgress: percent
    });

  }

  async _onEnd() {
    console.log('end');
    let newState = {videoProgress: 1};
    
    if (this.state.recording) {
      newState.recorded = true;
      newState.recording = false;

      try {
        const filePath = await AudioRecorder.stopRecording();
      }
      catch (e) {
        console.log(e);
      }
    }
    else if (this.state.audioPlaying) {
      newState.audioPlaying = false;
    }
    this.setState(newState);
  }

  _record() {
    this.setState({
      videoProgress: 0.01,
      countDown: false,
      recording: true,
      recorded: false,
      audioUploaded: false
    });

    AudioRecorder.startRecording();
    this.refs.videoPlayer.seek(0);
  }

  _countDown() {
    if (!this.state.countDown && !this.state.recording && !this.state.audioPlaying) {
      this.setState({
        countDown: true
      });
      this.refs.videoPlayer.seek(this.state.videoLength - 0.01);
    }
  }

  _preview() {
    this.setState({
      audioPlaying: true,
      videoProgress: 0,
    });

    let sound = new Sound(this.state.audioPath, '', (error) => {
      if (error) {
        console.log('Failed to load sound', error);
      }
    })

    setTimeout(() => {
      this.refs.videoPlayer.seek(0);

      sound.play((success) => {
        if (success) {
          console.log('Finished playing');
        }
        else {
          console.log('play failed');
        }
      })
    }, 100);
  }

  _closeModal() {
    this.setState({
      modalVisible: false
    });
  }

  _showModal() {
    this.setState({
      modalVisible: true
    });
  }

  _submit() {
    const body = {
      title: this.state.title,
      videoId: this.state.videoId,
      audioId: this.state.audioId,
    };

    const creationURL = config.api.base + config.api.creation;
    const user = this.props.user;

    if (user && user.accessToken) {
      body.accessToken = user.accessToken;

      this.setState({
        publishing: true
      });

      request.post(creationURL, body)
      .then((data) => {
        if (data && data.success) {
          const state = _.clone(defaultState);
          this.setState(state, () => {
            setTimeout(() => {
              AlertIOS.alert('Video published');
            }, 100);
          });
          console.log(data);
        }
        else {
          this.setState({
            publishing: true
          });
          AlertIOS.alert('Failed to publish');
        }
      })
      .catch((e) => {
        AlertIOS.alert('Failed to publish');
      })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.title}>
            { 
              this.state.previewVideo
              ? 'Start'
              : 'Make a dubbing'
            }
          </Text>
          {
            this.state.previewVideo && this.state.videoUploaded
            ? <Text style={styles.change} onPress={this._pickVideo.bind(this)}>change</Text>
            : null
          }  
        </View>

        <View style={styles.page}>
          { 
            this.state.previewVideo
            ? <View style={styles.videoContainer}>
                <View style={styles.videoBox}>
                  <Video
                    ref='videoPlayer'
                    source={{uri: this.state.previewVideo}}
                    style={styles.video} 
                    volume={3} 
                    paused={this.state.paused} 
                    rate={this.state.rate} 
                    muted={this.state.muted} 
                    resizeMode={this.state.resizeMode} 
                    repeat={this.state.repeat} 

                    onLoad={this._onLoad.bind(this)}
                    onProgress={this._onProgress.bind(this)} 
                    onEnd={this._onEnd.bind(this)} />

                  {
                    !this.state.videoUploaded && this.state.videoUploading
                    ? <View style={styles.progressBox}>
                        <View style={styles.progressBar}>
                          <View style={[styles.progress, {width: width * this.state.videoUploadingProgress}]}></View>
                        </View>
                        <Text style={styles.progressText}>
                          Generating muted video, {(this.state.videoUploadingProgress * 100).toFixed(2)}% completed.
                        </Text>
                      </View>
                    : null
                  }

                  {
                    this.state.recording || this.state.audioPlaying  //|| (!this.state.audioPlaying && this.state.recorded)
                    ? <View style={styles.progressBox}>
                        <View style={styles.progressBar}>
                          <View style={[styles.progress, {width: width * this.state.videoProgress}]}></View>
                        </View>
                        {
                          this.state.recording
                          ? <Text style={styles.progressText}>
                              Recording
                            </Text>
                          : null
                        }
                      </View>
                    : null
                  }

                  {
                    this.state.recorded
                    ? <TouchableOpacity style={styles.previewContainer} onPress={this._preview.bind(this)}>
                        <View style={styles.previewBox}>
                          <Icon name='ios-play' style={styles.previewIcon} />
                          <Text style={styles.previewText}>Preview</Text>
                        </View>
                      </TouchableOpacity>
                    : null
                  }
                </View>
              </View>
            : <TouchableOpacity
              style={styles.uploadContainer}
              onPress={this._pickVideo.bind(this)}>
                <View style={styles.uploadBox}>
                  <Image source={require('../assets/images/record.png')}
                  style={styles.uploadIcon} />
                  <Text style={styles.uploadTitle}>Upload a video</Text>
                  <Text style={styles.uploadDesc}>No longer than 10 seconds</Text>
                </View>
              </TouchableOpacity>
          }

          {
            this.state.videoUploaded
            ? <View style={styles.recordBox}>
                <View style={[styles.recordIconBox, (this.state.recording || this.state.audioPlaying) && styles.recording]}>

                  {
                    this.state.countDown && !this.state.recording
                    ? <CountDownText
                        style={styles.countBtn}
                        countType='seconds' 
                        auto={true} 
                        afterEnd={this._record.bind(this)} 
                        timeLeft={3}
                        step={-1}  
                        endText='Go' 
                        intervalText={(sec) => {
                          return sec === 0 ? 'Go' : sec;
                        }} />
                    : <TouchableOpacity onPress={this._countDown.bind(this)}>
                        <Icon name='ios-mic' style={styles.recordIcon}/>
                      </TouchableOpacity>
                  }
                    
                </View>
              </View>
            : null
          }

          {
            this.state.videoUploaded && this.state.recorded
            ? <View style={styles.uploadAudioBox}>
                {
                  !this.state.audioUploaded && !this.state.audioUploading
                  ? <Text style={styles.uploadAudioText} onPress={this._uploadAudio.bind(this)}>Next</Text>
                  : null
                }

                {
                  this.state.audioUploading
                  ? <Circle
                      showsText={true}
                      size={64}
                      color={'#ee735c'}
                      progress={this.state.audioUploadingProgress} />
                  : null
                }
                
              </View>
            : null
          }
          
        </View>

        <Modal
          animationType={'none'}
          visible={this.state.modalVisible}>
          
          <View style={styles.modalContainer}>
            <Icon 
              name='ios-close-outline'
              onPress={this._closeModal.bind(this)}
              style={styles.closeIcon} />

            {
              this.state.audioUploaded && !this.state.publishing
              ? <View style={styles.field}>
                  <TextInput
                    placeholder='What does your dog say?'
                    style={styles.input}
                    autoCapitalize={'none'}
                    defaultValue={this.state.title}
                    onChangeText={(text) => {
                      this.setState({
                        title: text
                      });
                    }}>  
                  </TextInput>
                </View>
              : null
            }

            {
              this.state.publishing
              ? <View style={styles.publishBox}>
                  <Text style={styles.publishText}>Publishing...</Text>
                  {
                    this.state.willPublish
                    ? <Text style={styles.publishText}>Generating your own video...</Text>
                    : null
                  }

                  {
                    this.state.publishProgress > 0.3
                    ? <Text style={styles.publishText}>Starting uploading...</Text>
                    : null
                  }
                  <Circle
                    showsText={true}
                    size={64}
                    color={'#ee735c'}
                    progress={this.state.publishProgress} />
                </View>
              : null
            }
                
            <View style={styles.submitBox}>
              {
                this.state.audioUploaded && !this.state.publishing
                ? <Button 
                    style={styles.btn}
                    onPress={this._submit.bind(this)}>
                    Publish
                  </Button>
                : null
              }
            </View>

          </View>
        </Modal>
      </View>
    );
  }
}

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  toolbar: {
    flexDirection: 'row',
    paddingTop: 25,
    paddingBottom: 15,
    backgroundColor: '#ee735c'
  },

  title: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600'
  },

  change: {
    position: 'absolute',
    right: 10,
    top: 26,
    color: '#fff',
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 16
  },

  page: {
    flex: 1,
    alignItems: 'center'
  },

  uploadContainer: {
    marginTop: 90,
    width: width - 40,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius: 6,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },

  uploadBox: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  uploadIcon:{
    width: 110,
    resizeMode: 'contain'
  },

  uploadTitle: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 16,
    color: '#000'
  },

  uploadDesc: {
    color: '#999',
    textAlign: 'center',
    fontSize: 12
  },

  videoContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },

  videoBox: {
    width: width,
    height: height * 0.6,
  },

  video: {
    width: width,
    height: height * 0.6,
    backgroundColor: '#000'
  },

  progressBox: {
    width: width,
    height: 30,
    backgroundColor: 'rgba(244,244,244,0.65)'
  },

  progressText: {
    color: '#333',
    width: width - 10,
    padding: 5
  },

  progressBar: {
    height: 4,
    width: width
  },

  progress: {
    width: 0,
    height: 4,
    backgroundColor: '#ee735c'
  },

  recordBox: {
    width: width,
    height: 60,
    alignItems: 'center'
  },

  recordIconBox: {
    marginTop: -30,
    width: 70,
    height: 70,
    borderWidth: 1,
    borderRadius: 35,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ee735c'
  },

  recordIcon: {
    fontSize: 50,
    backgroundColor: 'transparent',
    color: '#fff'
  },

  countBtn: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff'
  },

  recording: {
    backgroundColor: '#ccc'
  },

  previewContainer: {
    position: 'absolute',
    width: 100,
    height: 30,
    right: 10,
    bottom: 10,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius: 3,
  },

  previewBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  previewIcon: {
    marginRight: 5,
    fontSize: 20,
    color: '#ee735c',
    backgroundColor: 'transparent'
  },

  previewText: {
    fontSize: 20,
    color: '#ee735c',
    backgroundColor: 'transparent'
  },

  uploadAudioBox: {
    width: width,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },

  uploadAudioText: {
    width: width - 40,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius: 5,
    padding: 5,
    textAlign: 'center',
    fontSize: 30,
    color: '#ee735c'
  },

  modalContainer: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#fff'
  },

  closeIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    fontSize: 32,
    right: 20,
    top: 30,
    color: '#ee735c'
  },

  field: {
    width: width - 40,
    height: 36,
    marginTop: 30,
    marginLeft: 20,
    marginRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },

  input: {
    height: 36,
    flex: 1,
    color:'#666',
    fontSize: 14,
    textAlign: 'center'
  },

  publishBox: {
    width: width,
    height: 50,
    marginTop: 10,
    padding: 15,
    alignItems: 'center'
  },

  publishText: {
    marginBottom: 10,
    textAlign: 'center',
    color: '#333'
  },

  submitBox: {
    marginTop: 50,
    padding: 15
  },

  btn: {
    padding: 10,
    marginTop: 60,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius: 4,
    color: '#ee735c'
  },


});