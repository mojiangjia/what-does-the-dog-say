import config from './config';

exports.avatar = function (id, type) {
	if (!id) return config.default.avatar;

  if (id.indexOf('http') > -1) return id;

  if (id.indexOf('data:image') > -1) return id;

  return config.cloudinary.base + '/' + type + '/upload/' + id;
}