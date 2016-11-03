const config = require('../../config/env');
const cmd = require('node-cmd');

function gitGet(req, res) {
  var response = {};

  cmd.get(
        `
          cd git/scrapy
          git ls-files | while read f; do git blame --line-porcelain $f | grep '^author '; done | sort -f | uniq -ic | sort -n
        `,
        function(data) {
          var dataArr = data.trim().split('\n');
          return res.json({
            'res': dataArr
          });
        }
    );
}

function gitHelper(req, res) {
  return res.json({
    git: 'git'
  });
}

export default { gitHelper, gitGet };
