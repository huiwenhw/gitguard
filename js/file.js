(function() {
  $(document).ready(function() {
    function setFileName() {
      $('#file-title').text(params['file'] + ' on ' + (params['sha'] ? params['sha'].substring(0, 8) : 'master'));
    }

    var repoName = localStorage.getItem('reponame');

    function getSearchParameters() {
      var prmstr = window.location.search.substr(1);
      return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
    }

    function transformToAssocArray( prmstr ) {
      var params = {};
      var prmarr = prmstr.split("&");
      for (var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
      }
      return params;
    }

    var params = getSearchParameters();

    function getFile() {
      $.ajax({
        type: 'GET',
        url: 'https://api.github.com/repos/' + repoName + '/contents/' + params['file'] + '?ref=' + (params['sha'] ? params['sha'] : 'master'),
        dataType: 'json',
        success: processFiles,
        error: function() {
          // alert('Failed to get file');
        }
      });
    }

    function getCommits() {
      $.ajax({
        type: 'GET',
        url: 'https://api.github.com/repos/' + repoName + '/commits?path=' + params['file'] + '&sha=' + (params['sha'] ? params['sha'] : 'master'),
        dataType: 'json',
        success: processCommits,
        error: function() {
          // alert('Failed to get commits');
        }
      });
    }

    function getBlame() {
      $.ajax({
        type: 'GET',
        url: 'https://polar-tundra-75062.herokuapp.com/api/git/git-blame?file=' + params['file'] + '&url=' + repoName + '&folderPath=' + repoName.split('/')[1] + '&sha=' + (params['sha'] ? params['sha'] : 'master'),
        dataType: 'json',
        success: processBlame,
        error: function() {
          // alert('Failed to get blame');
        }
      });
    }

    function bindButtons() {
      $('#partial-blame').click(function() {
        $('#partial-blame').addClass('btn-success').removeClass('btn-default');
        $('#full-blame').addClass('btn-default').removeClass('btn-success');
        $('#history').addClass('btn-default').removeClass('btn-success');
        $('#lines-id-partial-blame-div').removeClass('hidden');
        $('#lines-id-blame-div').addClass('hidden');
        $('#list-id').addClass('hidden');
        $('#start-line').removeClass('hidden').val('');
        $('#end-line').removeClass('hidden').val('');
        $('#clear-blame').addClass('hidden');
      });
      $('#full-blame').click(function() {
        $('#partial-blame').addClass('btn-default').removeClass('btn-success');
        $('#full-blame').addClass('btn-success').removeClass('btn-default');
        $('#history').addClass('btn-default').removeClass('btn-success');
        $('#lines-id-partial-blame-div').addClass('hidden');
        $('#lines-id-blame-div').removeClass('hidden');
        $('#list-id').addClass('hidden');
        $('#start-line').addClass('hidden');
        $('#end-line').addClass('hidden');
        $('#clear-blame').addClass('hidden');
      });
      $('#history').click(function() {
        $('#partial-blame').addClass('btn-default').removeClass('btn-success');
        $('#full-blame').addClass('btn-default').removeClass('btn-success');
        $('#history').addClass('btn-success').removeClass('btn-default');
        $('#lines-id-partial-blame-div').addClass('hidden');
        $('#lines-id-blame-div').addClass('hidden');
        $('#list-id').removeClass('hidden');
        $('#start-line').addClass('hidden');
        $('#end-line').addClass('hidden');
        $('#clear-blame').addClass('hidden');
      });
      $('#clear-blame').click(function() {
        $('#start-line').val('');
        $('#end-line').val('');
        triggerPartial();
      });
    }

    function bindCommits() {
      $('.author-click').click(function() {
        window.location.href = 'commit_history.html?author=' + $(this).data('author');
      });
      $('.sha-click').click(function() {
        window.location.href = 'file.html?file=' + params['file'] + '&sha=' + $(this).data('sha');
      });
    }

    var previousNumber = 0;

    function bindFile() {
      $('#lines-id-partial-blame').on('click', '.line-click', function() {
        var lineNumber = parseInt($(this).data('line'));
        if ($('#start-line').val() === '' && $('#end-line').val() === '') {
          $('#start-line').val(lineNumber);
          $('#end-line').val(lineNumber);
          triggerPartial();
          return;
        } else {
          var startNumber = parseInt($('#start-line').val());
          var endNumber = parseInt($('#end-line').val());
          if (lineNumber === startNumber || lineNumber === endNumber) {
            return;
          }
          if (lineNumber < startNumber) {
            $('#start-line').val(lineNumber);
            triggerPartial();
            previousNumber = parseInt(lineNumber);
            return;
          }
          if (lineNumber > startNumber && lineNumber < endNumber) {
            if (lineNumber < previousNumber) {
              $('#start-line').val(lineNumber);
              triggerPartial();
              previousNumber = parseInt(lineNumber);
              return;
            }
            if (lineNumber > previousNumber) {
              $('#end-line').val(lineNumber);
              triggerPartial();
              previousNumber = parseInt(lineNumber);
              return;
            }
          }
          if (lineNumber > endNumber) {
            $('#end-line').val(lineNumber);
            triggerPartial();
            previousNumber = parseInt(lineNumber);
            return;
          }
        }
      });
    }

    function triggerPartial() {
      if ($('#start-line').val() !== '' && $('#end-line').val() !== '') {
        for (var i = 0; i <= $('#lines-id-partial-blame-info').children().length; i++) {
          $('#lines-id-partial-blame-info p:nth-child(' + i + ')').addClass('hidden');
          $('#lines-id-partial-blame-info p:nth-child(' + i + ')').removeClass('text-invisible');
        }

        var startNumber = parseInt($('#start-line').val());
        var endNumber = parseInt($('#end-line').val());

        if (startNumber < 1) {
          startNumber = 1;
          $('#start-line').val(1);
        }

        if (startNumber > $('#lines-id-partial-blame-info').children().length + 1) {
          startNumber = $('#lines-id-partial-blame-info').children().length + 1;
          $('#start-line').val($('#lines-id-partial-blame-info').children().length + 1);
          $('#end-line').val($('#lines-id-partial-blame-info').children().length + 1);
        }

        if (endNumber > $('#lines-id-partial-blame-info').children().length + 1) {
          endNumber = $('#lines-id-partial-blame-info').children().length + 1;
          $('#end-line').val($('#lines-id-partial-blame-info').children().length + 1);
        }

        for (var i = 0; i < startNumber; i++) {
          $('#lines-id-partial-blame-info p:nth-child(' + i + ')').removeClass('hidden');
          $('#lines-id-partial-blame-info p:nth-child(' + i + ')').addClass('text-invisible');
        }

        for (var i = startNumber; i <= endNumber; i++) {
          $('#lines-id-partial-blame-info p:nth-child(' + i + ')').removeClass('hidden');
        }
      }
      if ($('#start-line').val() === '' && $('#end-line').val() === '') {
        for (var i = 0; i <= $('#lines-id-partial-blame-info').children().length; i++) {
          $('#lines-id-partial-blame-info p:nth-child(' + i + ')').addClass('hidden');
          $('#lines-id-partial-blame-info p:nth-child(' + i + ')').removeClass('text-invisible');
        }
      }
      if ($('#start-line').val() === '' && $('#end-line').val() !== '') {
        $('#start-line').val(parseInt($('#end-line').val()));
        triggerPartial();
        return;
      }
      if ($('#start-line').val() !== '' && $('#end-line').val() === '') {
        $('#end-line').val(parseInt($('#start-line').val()));
        triggerPartial();
        return;
      }
    }

    function bindBox() {
      $('#start-line').keypress(function(event) {
        var charCode = event.keyCode;
        return !(charCode > 31 && (charCode < 48 || charCode > 57));
      });
      $('#end-line').keypress(function(event) {
        var charCode = event.keyCode;
        return !(charCode > 31 && (charCode < 48 || charCode > 57));
      });
      $('#start-line').on('input', triggerPartial);
      $('#end-line').on('input', triggerPartial);
    }

    setFileName();
    getFile();
    getCommits();
    getBlame();
    bindFile();
    bindButtons();
    bindBox();

    function processCommits(data) {
      for (var i = 0; i < data.length; i++) {
        var author = data[i].author.login;
        var sha = data[i].sha;
        var commitMessage = data[i].commit.message;

        $('#list-id').append(
          '<article class="tile is-child notification is-info">' +
            '<div class="context">' +
              '<p>' +
                commitMessage +
              '</p>' +
              '<p>' +
                '<b class="author-click hover-underline" data-author="' + author + '" >' +
                  author + ' ' +
                '</b>' +
                '<i class="sha-click hover-underline" data-sha="' + sha +'" >' +
                  sha +
                '</i>' +
              '</p>' +
            '</div>' +
          '</article>'
        );
      }

      bindCommits();
    }

    function processFiles(data) {
      var dataContent = atob(data.content).split('\n');

      for (var i = 0; i < dataContent.length; i++) {
        $('#lines-id-partial-blame').append(
          '<p class="line-click hover-underline" data-line="' + (i + 1) +'">' + (i + 1) + ': ' + dataContent[i] + '</p>'
        );

        $('#lines-id-blame').append(
          '<p class="underline">' + (i + 1) + ': ' + dataContent[i] + '</p>'
        );
      }
    }

    function processBlame(data) {
      var dataContent = data['res'];
      for (var i = 0; i < dataContent.length; i+=3) {
        $('#lines-id-partial-blame-info').append(
          '<p class="hidden">' + ((i / 3) + 1) + ': ' +
            '<i>' +
              dataContent[i] + ' ' +
            '</i>' +
            '<b>' +
              dataContent[i + 1] + ' ' +
            '</b>' +
            dataContent[i + 2] + '...' +
          '</p>'
        );

        $('#lines-id-blame-info').append(
          '<p>' + ((i / 3) + 1) + ': ' +
            '<i>' +
              dataContent[i] + ' ' +
            '</i>' +
            '<b>' +
              dataContent[i + 1] + ' ' +
            '</b>' +
            dataContent[i + 2] + '...' +
          '</p>'
        );
      }
    }
  });
})();
