/**
 * 1. parse URL
 * 2. 取文件内容
 * 3. 按文件顺序合并文件内容
 * 4. 输出到合并文件中
 */

var path = require('path'),
	fs = require('fs'),
	http = require('http');

var MIME = {
	'.css': 'text/css',
	'.js':  'application/javascript'
};

// 测试数据
/*var config1 = {
	url: 'E:/angelia/github/node_fileMerge/??a.js,b.js,c.js,d.js',
	root: '.',
	port: 80
};
main(config1);*/

main(process.argv.slice(2));

function main(settings) {
	
	var config = JSON.parse(fs.readFileSync(settings[0], 'utf-8'));
	var root = config.root || '.';
	var port = config.port || 80;
	
	http.createServer(function (request, response) {

		var fileInfo = parseUrl(root, config.url);
		var fileArr = fileInfo.fileArr;
		combineFile(fileArr, function (err, data) {
			if(err) {
				response.writeHead(404);
				response.end(err.message);
			} else {
				response.writeHead(200, {
					'Content-Type': fileInfo.mime
				});
				response.end(data);
			}
		});

	}).listen(port);

}

// http://assets.example.com/foo/??bar.js,baz.js
function parseUrl(root, url) {

	// var reg = /(\?\?|\,)([^\,]+)/g; // 怎么捕获
	var urlArr = [];
	
	if(url.indexOf('??') === -1) {
		urlArr = [url];
	} else {
		var paths = url.split('??');
		urlArr = paths[1].split(',').map(function (value) {
			return path.join(root, paths[0], value);
		});
	}

	return {
		mime: MIME[path.extname[urlArr[0]]] || 'text/plain',
		fileArr: urlArr
	}

}

function combineFile(fileArr, callback) {

	var output = [];

	// 按照文件顺序依次合并
	(function next(i, len) {

		if(i < len) {
			fs.readFile(fileArr[i], function (err, data) {
				if(err) {
					callback(err);
				} else {
					
					// 写入文件
					// fs.writeFile('./test.js', data, {flag: 'a'}, function (err) {
						
					// 	next(i+1, len);
					// });	
					
					output.push(data);
					next(i+1, len);
				}
			});
		} else {
			callback(null, Buffer.concat(output));
		}

	}(0, fileArr.length));

}
