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
  AsyncStorage
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
        let user = this.state.user;
        user.avatar = source;
        this.setState({
          user: user
        });

        const timestamp = Data.now();
        const tags = 'app,avatar';
        const folder = 'avatar';
        const signatureURL = config.api.base + config.api.sign;

        // get signature from sever
        request.post(signatureURL, {
          accessToken: this.state.user.accessToken,
          timestamp: timestamp,
          type: 'avatar'
        })
        .then((data) => {
          if (data && data.success) {
            let signature = 'folder=' + folder + '&tags=' + tags + '&timestamp' + timestamp + config.cloudinary.api_secret;
            signature = sha1(signature);
          }
        })
      }
    });
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