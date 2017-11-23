import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';

import request from '../utils/request';
import config from '../utils/config';

let cachList = {
	nextPage: 1,
	items: [],
	total: 0
};

export default class List extends Component<{}> {
  constructor(props) {
    super(props);
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 != r2})
    this.state = {
    	dataSource: ds.cloneWithRows([]),
    	isLoadingMore: false,
    };
  }

  _renderRow(rowData) {
  	return (
  		<TouchableHighlight>
  			<View style={styles.item}>
  				<Text style={styles.itemTitle}>{rowData.title}</Text>
  				<View>
  					<Image 
	  					source={{uri: rowData.thumb}}
	  					style={styles.thumb} />
  					<Icon
  						name='ios-play'
  						size={28}
  						style={styles.play} />
  				</View>
  				<View style={styles.itemFooter}>
  					<View style={styles.handlerBox}>
	  					<Icon
	  						name='ios-heart-outline'
	  						size={28}
	  						style={styles.like} />
	  					<Text style={styles.text}>likes</Text>
	  				</View>
	  				<View style={styles.handlerBox}>
	  					<Icon
	  						name='ios-chatboxes-outline'
	  						size={28}
	  						style={styles.comment} />
	  					<Text style={styles.text}>comments</Text>
	  				</View>
  				</View>
  			</View>
  		</TouchableHighlight>
  	);
  }

	componentDidMount() {
		this._fetchData(1);
  }

  _fetchData(page) {
  	this.setState({isLoadingMore: true});
  	request.get(config.api.base + config.api.list, {
			accessToken: 'jmj',
			page: page
		})
      .then((data) => {
      	if (data.success) {
      		let items = cachList.items.slice();
      		cachList.items = items.concat(data.data);
      		cachList.total = data.total;
      		cachList.nextPage = page + 1;
      		setTimeout(() => this.setState({
      			isLoadingMore: false,
      			dataSource: this.state.dataSource.cloneWithRows(cachList.items)
      		}), 500);
      	} 
      })
      .catch((error) => {
      	this.setState({
      		isLoadingMore: false
      	});
        console.error(error);
      });
  }

  _fetchMoreData() {
  	if (!this._hasMore() || this.state.isLoadingMore) return;

  	let page = cachList.nextPage;
  	this._fetchData(page);
  }

  _hasMore() {
  	return cachList.items.length != cachList.total;
  }

  _renderFooter() {
  	if (!this._hasMore() && cachList.items.length != 0) {
  		return (
  			<View style={styles.loadingMore}><Text style={styles.noMoreText}>No more videos</Text></View>
  		);
  	}
  	if (!this.state.isLoadingMore) {
  		return <View style={styles.loadingMore} />
  	}
  	return (<ActivityIndicator style={styles.loadingMore}/>);
  }

  render() {
    return (
      <View style={styles.container}>
      	<View style={styles.header}>
        	<Text style={styles.headerText}>What does the dog say?</Text>
        </View>
        <ListView 
        	dataSource={this.state.dataSource}
        	renderRow={this._renderRow.bind(this)} 
        	enableEmptySections={true} 
        	automaticallyAdjustContentInsets={false}
        	onEndReached={this._fetchMoreData.bind(this)} 
        	onEndReachedThreshold={20} 
        	renderFooter={this._renderFooter.bind(this)} 
        	showsVerticalScrollIndicator={false} />
      </View>
    );
  }
}

const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header: {
  	paddingTop: 25,
  	paddingBottom: 12,
  	backgroundColor: '#ee735c',
  },
  headerText: {
  	color: '#fff',
  	fontSize: 16,
  	textAlign: 'center',
  	fontWeight: '600',
  },
  item: {
  	width: width,
  	marginBottom: 10,
  	backgroundColor: '#fff'
  },
  thumb: {
  	width: width,
  	height: width * 0.56,
  	resizeMode: 'cover'
  },
  itemTitle: {
  	padding: 10,
  	fontSize: 18,
  	color: '#333'
  },
  itemFooter: {
  	flexDirection: 'row',
  	justifyContent: 'space-between',
  	backgroundColor: '#eee'
  },
  handlerBox: {
  	padding: 10,
  	flexDirection: 'row',
  	width: width / 2 - 0.5,
  	justifyContent: 'center',
  	backgroundColor: '#fff'
  },
  play: {
  	position: 'absolute',
  	bottom: 14,
  	right: 14,
  	width: 46,
  	height: 46,
  	paddingTop: 9,
  	paddingLeft: 18,
  	backgroundColor: 'transparent',
  	borderColor: '#fff',
  	borderWidth: 1,
  	borderRadius: 23,
  	color: '#ed7b66'
  },
  text: {
  	paddingLeft: 12,
  	fontSize: 18,
  	color: '#333'
  },
  like: {
  	fontSize: 22,
  	color: '#333'
  },
  comment: {
  	fontSize: 22,
  	color: '#333'
  },
  loadingIcon: {
  	marginVertical: 20
  },
  noMoreText: {
  	color: '#777',
  	textAlign: 'center'
  }

});