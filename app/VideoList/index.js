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
  ActivityIndicator,
  RefreshControl,
  AlertIOS
} from 'react-native';
import _ from 'lodash';

import request from '../utils/request';
import config from '../utils/config';
import Detail from './detail';

let cacheList = {
	nextPage: 1,
	items: [],
	total: 0
};

class Item extends Component {
	constructor(props) {
		super(props);
		this.state = {
			row: props.row,
			like: props.row.liked
		};
	}

	_onTapLike() {
		let like = !this.state.like;
		let row = this.state.row;

		let url = config.api.base + config.api.like;

		let body = {
			_id: row._id,
			like: like ? 'yes' : 'no',
			accessToken: this.props.user.accessToken
		};

		request.post(url, body)
			.then((data) => {
				if (data && data.success) {
					this.setState ({
						like: like
					});
				}
				else {
					AlertIOS.alert('like failed');
				}
			})
			.catch((err) => {
				console.log(err);
				AlertIOS.alert('like failed');
			})		
	}

	render() {
		let row = this.state.row;
		return (
			<TouchableHighlight onPress={this.props.onSelect}>
  			<View style={styles.item}>
  				<Text style={styles.itemTitle}>{row.title}</Text>
  				<View>
  					<Image 
	  					source={{uri: row.creation_thumb}}
	  					style={styles.thumb} />
  					<Icon
  						name='ios-play'
  						size={28}
  						style={styles.play} />
  				</View>
  				<View style={styles.itemFooter}>
  					<View style={styles.handlerBox}>
	  					<Icon
	  						name={this.state.like ? 'ios-heart' : 'ios-heart-outline'}
	  						size={28}
	  						style={[styles.like, this.state.like ? null : styles.unlike]} 
	  						onPress={this._onTapLike.bind(this)} />
	  					<Text style={styles.text} onPress={this._onTapLike.bind(this)}>likes</Text>
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
}

export default class List extends Component<{}> {
  constructor(props) {
    super(props);
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 != r2});
    this.state = {
    	dataSource: ds.cloneWithRows([]),
    	isLoadingMore: false,
    	refreshing: false
    };
  }

  _renderRow(rowData) {
  	return (
  		<Item user={this.props.user} key={rowData._id} row={rowData} onSelect={() => this._loadDetailPage(rowData)}/>
  	);
  }

	componentDidMount() {
		this._fetchData(1);
  }

  _fetchData(page) {
  	if (page != 0) 
  		this.setState({isLoadingMore: true});
  	else 
  		this.setState({refreshing: true});
    console.log(config.api.base + config.api.list);
  	request.get(config.api.base + config.api.list, {
			accessToken: this.props.user.accessToken,
			page: page
		})
      .then((data) => {
      	if (data.success) {
          console.log(data);
          if (data.data.length == 0) return;

          const id = this.props.user._id;

          data.data.map((item) => {
            let likes = item.likes;
            if (likes.indexOf(id) > -1) {
              item.liked = true;
            }
            else item.liked = false;;
            return item
          });


      		let items = cacheList.items.slice();
      		if (page != 0) {
      			cacheList.nextPage += 1;
      			cacheList.items = items.concat(data.data);
      		}
      		else
      			cacheList.items = data.data.concat(items);
      		cacheList.total = data.total;
      		
    			if (page != 0)
      			this.setState({
      				isLoadingMore: false,
      				dataSource: this.state.dataSource.cloneWithRows(cacheList.items)
      			});
      		else {
      			this.setState({
      				refreshing: false,
      				dataSource: this.state.dataSource.cloneWithRows(cacheList.items)
      			});
      		}
          
      	} 
      })
      .catch((error) => {
      	if (page != 0)
	      	this.setState({
	      		isLoadingMore: false
	      	});
	      else 
	      	this.setState({
	      		refreshing: false
	      	});
        console.error(error);
      });
  }

  _fetchMoreData() {
  	if (!this._hasMore() || this.state.isLoadingMore) return;

  	let page = cacheList.nextPage;
  	this._fetchData(page);
  }

  _hasMore() {
  	return cacheList.items.length != cacheList.total;
  }

  _renderFooter() {
  	if (!this._hasMore() && cacheList.items.length != 0) {
  		return (
  			<View style={styles.loadingMore}><Text style={styles.noMoreText}>No more videos</Text></View>
  		);
  	}
  	if (!this.state.isLoadingMore) {
  		return <View style={styles.loadingMore} />
  	}
  	return (<ActivityIndicator style={styles.loadingMore}/>);
  }

  _onRefresh() {
  	console.log('refreshing');
  	// if (!this._hasMore() || this.state.refreshing) return;
    this._fetchData(0);
  }

  _loadDetailPage(row) {
		this.props.navigator.push({
			name: 'detail',
			component: Detail,
			params: {
				data: row,
        user: this.props.user
			}
		});
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
        	showsVerticalScrollIndicator={false} 
        	refreshControl={
        		<RefreshControl
            	refreshing={this.state.refreshing}
            	onRefresh={this._onRefresh.bind(this)}
            	title='Loading'
            	tintColot='#ff6600'
          	/>
        	}
        />
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
  	color: '#ed7b66'
  },
  unlike: {
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