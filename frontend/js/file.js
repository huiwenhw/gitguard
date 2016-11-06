(function() {
  $(document).ready(function() {
    function getFile() {
      $.ajax({
        type: "GET",
        url: "https://api.github.com/repos/tungnk1993/scrapy/contents/scrapy/crawler.py",
        dataType: "json",
        success: processFiles,
        error: function() {
          alert("failed");
        }
      });
    }

    function getCommits() {
      $.ajax({
        type: "GET",
        url: "https://api.github.com/repos/tungnk1993/scrapy/commits?path=scrapy/crawler.py",
        dataType: "json",
        success: processCommits,
        error: function() {
          alert("Failed to get commits");
        }
      });
    }

    function bindButtons() {
      // bind partial blame button, full blame button and history button
    }

    function bindCommits() {
      //
    }

    function bindFile() {
      // Bind file lines
    }

    getFile();
    getCommits();
    bindButtons();

    function processCommits(data) {
      for (var i = 0; i < data.length; i++) {
        var author = data[i].author.login;
        var sha = data[i].sha;
        var commitMessage = data[i].commit.message;

        $('#list-id').append(
          '<article class="tile is-child notification is-info">' +
            '<p class="title">' +
              'Author: ' + author +
            '</p>' +
            '<p class="subtitle">' +
              'Sha: ' + sha +
            '</p>' +
            '<div class="context">' +
              '<p>' +
                'Message:' + commitMessage +
              '</p>' +
            '</div>' +
          '</article>'
        );

        bindCommits();
      }
    }

    function processFiles(data) {
      var dataContent = atob(data.content).split('\n');

      for (var i = 0; i < dataContent.length; i++) {
        $('#lines-id').append(
          '<p>' + (i + 1) + ': ' + dataContent[i] + '<p>'
        );

        bindFile();
      }
    }
  });
})();
