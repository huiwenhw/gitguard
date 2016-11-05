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
      git blame scrapy/crawler.py
    `,
    function(data) {
      var dataArr = data.split('\n');
      for (var i = 0; i < dataArr.length; i++) {
        dataArr[i] = dataArr[i].trim();
      }
      return res.json({
        'res': dataArr
      });
    }
  );
}

export default { gitBlame, gitGet };
