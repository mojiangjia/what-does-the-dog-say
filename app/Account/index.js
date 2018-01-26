import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-picker';
import {Circle} from 'react-native-progress';
import Button from 'react-native-button';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TabBarIOS,
  TouchableOpacity,
  Dimensions,
  Image,
  AsyncStorage,
  AlertIOS,
  Modal
} from 'react-native';

import config from '../utils/config';
import util from '../utils/util';
import request from '../utils/request';

const photoOptions = {
  title: 'Select Avatar',
  cancelButtonTitle: 'Cancal',
  takePhotoButtonTitle: 'Take photo',
  chooseFromLibraryButtonTitle: 'Choose from library',
  quality: 0.75,
  allowsEditing: true,
  noData: false,
  storageOptions: { 
    skipBackup: true, 
    path: 'images'
  }
};


export default class Account extends Component<{}> {
  constructor(props) {
    super(props);
    let user = this.props.user || {};
    this.state = {
      user: user,

      uploading: false,
      avatarProgress: 0,

      isVisible: false
    };
  }

  componentDidMount() {
    let user;
    AsyncStorage.getItem('user')
      .then((data) => {
        if (data) {
          user = JSON.parse(data);
        }
        if (user && user.accessToken) {
          this.setState({user: user});
        }
      })
  }

  _edit() {
    this.setState({isVisible: true});
  }

  _closeModal() {
    this.setState({isVisible: false});
  }

  _pickAvatar() {
    ImagePicker.showImagePicker(photoOptions, (res) => {
      if (res.didCancel) {
        return;
      }
      else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      }
      else {
        console.log(res);
        let source = 'data:image/jpeg;base64,' + res.data;
        // let source = res.uri;
        const timestamp = Date.now();
        const tags = 'app,avatar';
        const folder = 'avatar';
        const signatureURL = config.api.base + config.api.signature;

        // get signature from sever
        request.post(signatureURL, {
          accessToken: this.state.user.accessToken,
          timestamp: timestamp,
          type: 'avatar'
        })
        .then((data) => {
          if (data && data.success) {
            let signature = data.data;

            let body = new FormData();

            body.append('folder', folder);
            body.append('signature', signature);
            body.append('tags', tags);
            body.append('timestamp', timestamp);
            body.append('api_key', config.cloudinary.api_key);
            body.append('resource_type', 'image');
            body.append('file', source);

            this._upload(body);
          }
        })
        .catch((e) => {
          console.log(e);
        })
      }
    });
  }

  _upload(body) {
    let xhr = new XMLHttpRequest();
    const url = config.cloudinary.image;

    this.setState({
      uploading: true,
      avatarProgress: 0
    });

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
        let user = this.state.user;

        user.avatar = response.public_id;

        this.setState({
          user: user,
          uploading: false
        });

        this._asyncUser();
      }
    };

    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Number((event.loaded / event.total).toFixed(2));

          this.setState({
            avatarProgress: percent
          });
        }
      }
    }

    xhr.send(body);
  }

  

  _asyncUser() {
    const user = this.state.user;

    if (user && user.accessToken) {
      const url = config.api.base + config.api.update;

      request.post(url, user)
        .then((data) => {
          if (data && data.success) {
            const u = data.data;
            // AlertIOS.alert('Avatar updated');

            this.setState({
              user: u
            }, () => {
              console.log('close');
              this._closeModal();
              AsyncStorage.setItem('user', JSON.stringify(u));
            });

          }
        })
    }
  }

  _changeUserState(key, value) {
    let user = this.state.user

    user[key] = value

    this.setState({
      user: user
    })
  }

  _submit() {
    this._asyncUser();
  }

  _logout() {
    this.props.logout();
  }

  render() {
    const user = this.state.user || {};
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.title}>My Account</Text>
          <Text style={styles.edit} onPress={this._edit.bind(this)}>Edit</Text>
        </View>

        {
          user.avatar
          ?
            <TouchableOpacity onPress={this._pickAvatar.bind(this)} style={styles.avatarContainer}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarBox}>
                  {
                  this.state.uploading
                  ? <Circle
                      showsText={true}
                      size={75}
                      color={'#ee735c'}
                      progress={this.state.avatarProgress} />
                  : <Image 
                      source={{uri: util.avatar(user.avatar, 'image')}}
                      style={styles.avatar} />
                  }
                </View>
                <Text style={styles.avatarTip}>Change your profile</Text>
              </View>
            </TouchableOpacity>
          :    
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarTip}>Add your profile</Text>
              <TouchableOpacity onPress={this._pickAvatar.bind(this)} style={styles.avatarBox}>
                {
                  this.state.uploading
                  ? <Circle
                      showsText={true}
                      size={75}
                      color={'#ee735c'}
                      progress={this.state.avatarProgress} />
                  : <Icon 
                      name='ios-add'
                      style={styles.plusIcon} />
                }
              </TouchableOpacity>
            </View>
        }

        <Modal
          animationType={'slide'}
          visible={this.state.isVisible}>
          
          <View style={styles.modalContainer}>
            <Icon 
              name='ios-close-outline'
              onPress={this._closeModal.bind(this)}
              style={styles.closeIcon} />

            <View style={styles.field}>
              <Text style={styles.label}>Nickname</Text>
              <TextInput
                placeholder='Your nickname'
                style={styles.input}
                autoCapitalize={'none'}
                defaultValue={user.nickname}
                onChangeText={(text) => {
                  this._changeUserState('nickname', text);
                }}>  
              </TextInput>
            </View>
            
            <View style={styles.field}>
              <Text style={styles.label}>Breed</Text>
              <TextInput
                placeholder="Dog's Breed"
                style={styles.input}
                autoCapitalize={'none'}
                defaultValue={user.breed}
                onChangeText={(text) => {
                  this._changeUserState('breed', text);
                }}>  
              </TextInput>
            </View>
            
            <View style={styles.field}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                placeholder="Dog's age"
                style={styles.input}
                autoCapitalize={'none'}
                defaultValue={user.age}
                onChangeText={(text) => {
                  this._changeUserState('age', text);
                }}>  
              </TextInput>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Sex</Text>
              <Icon.Button 
                onPress={() => {
                  this._changeUserState('gender', 'male');
                }}
                style={[
                  styles.gender,
                  user.gender === 'male' && styles.genderSelected
                ]}
                name='ios-male'>Male</Icon.Button>
              <Icon.Button 
                onPress={() => {
                  this._changeUserState('gender', 'female');
                }}
                style={[
                  styles.gender,
                  user.gender === 'female' && styles.genderSelected
                ]}
                name='ios-female'>Female</Icon.Button>
            </View>

            <Button 
              style={styles.btn}
              onPress={this._submit.bind(this)}>Save</Button>

          </View>
        </Modal>

        <Button 
          style={styles.btn}
          onPress={this._logout.bind(this)}>Logout</Button>

      </View>
    );
  }
}

const width = Dimensions.get('window').width;

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

  edit: {
    position: 'absolute',
    right: 10,
    top: 26,
    color: '#fff',
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 16
  },

  avatarContainer: {
    width: width,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666'
  },

  avatarBox: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    marginBottom: 10,
    width: width * 0.2,
    height: width * 0.2,
    resizeMode: 'cover',
    borderRadius: width * 0.1
  },

  avatarTip: {
    color: '#fff',
    backgroundColor: 'transparent',
    fontSize: 14
  },

  plusIcon: {
    padding: 20,
    paddingLeft: 25,
    paddingRight: 25,
    color: '#333',
    fontSize: 28,
    backgroundColor: '#fff',
    borderRadius: 8
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    borderColor: '#eee',
    borderBottomWidth: 1
  },

  label: {
    color: '#ccc',
    marginRight: 10
  },

  input: {
    height: 50,
    flex: 1,
    color:'#666',
    fontSize: 14
  },

  gender: {
    backgroundColor: '#ccc'
  },

  genderSelected: {
    backgroundColor: '#ee735c'
  },

  btn: {
    padding: 10,
    marginTop: 30,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius: 4,
    color: '#ee735c'
  },

});