import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
  Image,
  Dimensions
} from 'react-native';

export default class List extends Component<{}> {
  constructor(props) {
    super(props);
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 != r2})
    this.state = {
    	dataSource: ds.cloneWithRows([{
      "_id": "320000199006020594",
      "thumb": "http://dummyimage.com/1280x720/79f2a7)",
      "url": "http://ltsaka.qq.com/QAYBCNvmTcjMF_1HQKJP7Rvh5xFr5Das0Qcy9AdSzORo4tfPAz7cUCz-X8sNgxqOk5GOzVt8pNu_gJfKj_U6Mb2RcrOngcnBT3oSPCBugdzhOyuwHfTauD92upJqONuyJxgbjjfxss0EgxRzWBoxNnyqk1mgzL28/x0025vlzeza.321002.ts.m3u8?ver=4",
      "title": "Paurb Kboumb Pgijr Qievmqcua Wdd"
    },
    {
      "_id": "650000197812164282",
      "thumb": "http://dummyimage.com/1280x720/f28379)",
      "url": "http://ltsaka.qq.com/QAYBCNvmTcjMF_1HQKJP7Rvh5xFr5Das0Qcy9AdSzORo4tfPAz7cUCz-X8sNgxqOk5GOzVt8pNu_gJfKj_U6Mb2RcrOngcnBT3oSPCBugdzhOyuwHfTauD92upJqONuyJxgbjjfxss0EgxRzWBoxNnyqk1mgzL28/x0025vlzeza.321002.ts.m3u8?ver=4",
      "title": "Oknenxlv Lupllwyb Eyii Dpo Mlwpikjtf"
    },
    {
      "_id": "460000197709234216",
      "thumb": "http://dummyimage.com/1280x720/7991f2)",
      "url": "http://ltsaka.qq.com/QAYBCNvmTcjMF_1HQKJP7Rvh5xFr5Das0Qcy9AdSzORo4tfPAz7cUCz-X8sNgxqOk5GOzVt8pNu_gJfKj_U6Mb2RcrOngcnBT3oSPCBugdzhOyuwHfTauD92upJqONuyJxgbjjfxss0EgxRzWBoxNnyqk1mgzL28/x0025vlzeza.321002.ts.m3u8?ver=4",
      "title": "Plfs Bckbsgt Kjtosghe Tmxfoxv Weljika"
    },
    {
      "_id": "140000197804236784",
      "thumb": "http://dummyimage.com/1280x720/b5f279)",
      "url": "http://ltsaka.qq.com/QAYBCNvmTcjMF_1HQKJP7Rvh5xFr5Das0Qcy9AdSzORo4tfPAz7cUCz-X8sNgxqOk5GOzVt8pNu_gJfKj_U6Mb2RcrOngcnBT3oSPCBugdzhOyuwHfTauD92upJqONuyJxgbjjfxss0EgxRzWBoxNnyqk1mgzL28/x0025vlzeza.321002.ts.m3u8?ver=4",
      "title": "Fvrrttzrfw Oiae Oual Eekbtr Xbemgn"
    }])
    };
  }

  renderRow(rowData) {
  	console.log(rowData.thumb);
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

  render() {
    return (
      <View style={styles.container}>
      	<View style={styles.header}>
        	<Text style={styles.headerText}>What does the dog say?</Text>
        </View>
        <ListView 
        	dataSource={this.state.dataSource}
        	r
        	renderRow={this.renderRow} 
        	enableEmptySections={true} 
        	automaticallyAdjustContentInsets={false}/>
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
  }

});