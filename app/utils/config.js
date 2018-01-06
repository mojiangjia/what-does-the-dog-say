

module.exports = {
	header: {
	  method: 'POST',
	  headers: {
	    'Accept': 'application/json',
	    'Content-Type': 'application/json'
		}
  },
  api: {
  	base: 'http://rap2api.taobao.org/app/mock/289/',
  	list: 'GET//api/list',
  	like: 'POST//api/like',
  	comment: 'GET//api/comments',
    postcomment: 'POST//api/comments'
  }
}