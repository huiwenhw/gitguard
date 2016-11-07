'use strict';

const config = require('../../config/env');
const cmd = require('node-cmd');

function gitGet(req, res) {
  cmd.get(
    `
      cd git/scrapy
      git ls-files | while read f; do git blame --line-porcelain $f | grep '^author '; done | sort -f | uniq -ic | sort -n
    `,
    function(data) {
      var dataArr = data.split('\n');
      dataArr.pop();
      for (var i = 0; i < dataArr.length; i++) {
        dataArr[i] = dataArr[i].trim();
      }
      return res.json({
        'res': dataArr
      });
    }
  );
}

function gitBlame(req, res) {
  cmd.get(
    `
      cd git/scrapy
      git blame scrapy/crawler.py --line-porcelain
    `,
    function(data) {
      var responseArr = [];
      var dataArr = data.split('\n');
      var restart = true;
      var sha = '';
      var message = '';
      var author = '';
      for (var i = 0; i < dataArr.length; i++) {
        var line = dataArr[i];

        if (restart) {
          sha = line.substring(0, 8);
          restart = false;
        }

        if (line.includes('author ')) {
          author = line.slice(7);
        }

        if (line.includes('summary')) {
          message = line.slice(8).slice(0, 40);
        }

        if (line.includes('\t')) {
          responseArr.push(sha);
          responseArr.push(author);
          responseArr.push(message);
          restart = true;
          continue;
        }
      }
      return res.json({
        'res': responseArr
      });
    }
  );
}

export default { gitBlame, gitGet };
