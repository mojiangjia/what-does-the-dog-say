import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-picker';
import sha1 from 'sha1';
import {
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  TouchableOpacity,
  Dimensions,
  Image,
  AsyncStorage,
  AlertIOS
} from 'react-native';

import config from '../utils/config';
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
}

export default class Account extends Component<{}> {
  constructor(props) {
    super(props);
    let user = this.props.user || {};
    this.state = {
      user: user
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

  _pickAvatar() {
    ImagePicker.showImagePicker(photoOptions, (res) => {
      if (res.didCancel) {
        return;
      }
      else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      }
      else {
        let source = 'data:image/jpeg;base64,' + res.data;
        // let user = this.state.user;
        // user.avatar = source;
        // this.setState({
        //   user: user
        // });

        const timestamp = Date.now();
        const tags = 'app,avatar';
        const folder = 'avatar';
        const signatureURL = config.api.base + config.api.signature;

        // get signature from sever
        request.post(signatureURL, {
          accessToken: this.state.user.accessToken,
          timestamp: timestamp,
          folder: folder,
          tags: tags,
          type: 'avatar'
        })
        .then((data) => {
          if (data && data.success) {
            let signature = 'folder=' + folder + '&tags=' + tags + '&timestamp=' + timestamp + config.cloudinary.api_secret;
            signature = sha1(signature);

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
          console.lgo(e);
        })
      }
    });
  }

  _upload(body) {
    let xhr = new XMLHttpRequest();
    const url = config.cloudinary.image;

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

        user.avatar = this._avatar(response.public_id, 'image');

        this.setState({user: user});
      }
    };

    xhr.send(body);
  }

  _avatar(id, type) {
    return config.cloudinary.base + '/' + type + '/upload/' + id;
  }

  render() {
    const user = this.state.user || {};
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.title}>My Account</Text>
        </View>

        {
          user.avatar
          ?
            <TouchableOpacity onPress={this._pickAvatar.bind(this)} style={styles.avatarContainer}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarBox}>
                  <Image 
                    source={{uri: user.avatar}}
                    style={styles.avatar} />
                </View>
                <Text style={styles.avatarTip}>Change your profile</Text>
              </View>
            </TouchableOpacity>
          :    
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarTip}>Add your profile</Text>
              <TouchableOpacity onPress={this._pickAvatar.bind(this)} style={styles.avatarBox}>
                <Icon 
                  name='ios-add'
                  style={styles.plusIcon} />
              </TouchableOpacity>
            </View>
        }


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
  }

});