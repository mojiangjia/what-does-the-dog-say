

module.exports = {
	header: {
	  method: 'POST',
	  headers: {
	    'Accept': 'application/json',
	    'Content-Type': 'application/json'
		}
  },
  cloudinary: {
    cloud_name: 'dogsays',  
    api_key: '927373898281311',  
    api_secret: 'WeJRazo6jNMw_CYY5fGUOZr82XI',
    base: 'http://res.cloudinary.com/dogsays',
    image: 'http://api.cloudinary.com/v1_1/dogsays/image/upload',
    video: 'http://api.cloudinary.com/v1_1/dogsays/video/upload',
    audio: 'http://api.cloudinary.com/v1_1/dogsays/raw/upload',
  },
  api: {
    // base: 'http://rap2api.taobao.org/app/mock/289/',
    // list: 'GET/api/list',
    // like: 'POST/api/like',
    // comment: 'GET/api/comments',
    // postcomment: 'POST/api/comments',
    // signup: 'POST/api/u/signup',
    // auth: 'POST/api/u/auth',
    // signature: 'POST/api/signature',
    // update: 'POST/api/u/update',
    base: 'http://localhost:8080/',
    list: 'api/creations',
    like: 'api/like',
    comment: 'api/comments',
    postcomment: 'api/comments',
    signup: 'api/u/signup',
    auth: 'api/u/auth',
    signature: 'api/signature',
    update: 'api/u/update',
    video: 'api/creations/video',
    audio: 'api/creations/audio',
    creation: 'api/creations'
  },
  default: {
    avatar: 'http://res.cloudinary.com/dogsays/image/upload/v1516849177/Unknown_qyczcy.pngs'
  }
}