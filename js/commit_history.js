// Global variables
var repoLink = localStorage.getItem('repolink');
var repoName = localStorage.getItem('reponame');

/**
 * Initialise elements in the page.
 */
function initPage() {
  initMemberDropdown();
  initDatepicker();
  initCommitHistoryTable();
}



/**
 * Initialise the dropdown list with members names.
 */
function initMemberDropdown() {
  var contributorsUrl = "https://api.github.com/repos/" + repoName +  "/stats/contributors";

  var $memberDropdownList = $("#memberDropdownList");
  var $memberDropdownMenu = $("#memberDropdownList .dropdown-menu");

  populateMemberDropdown($memberDropdownMenu, contributorsUrl);

  // Click event for member dropdown to replace the display text with the selected text
  $memberDropdownMenu.on("click", "li a", function() {
    var $memberDropdownDisplay = $(this).closest(".dropdown").find(".display-text");
    var selectedText = $(this).html();

    $memberDropdownDisplay.html(selectedText);
    loadCommitHistory(selectedText);
  });
}



/**
 * Initialise date picker to within the past month starting from today.
 * Also set all its event handler that is required.
 */
function initDatepicker() {
  var $startDatepicker = $("#startDatepicker");
  var $endDatepicker = $("#endDatepicker");

  var defaultEndDate = new Date();
  var defaultStartDate = new Date(defaultEndDate);

  defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);

  $startDatepicker.datepicker({
    dateFormat: "dd MM yy, DD"
  }).datepicker("setDate", defaultStartDate);

  $endDatepicker.datepicker({
    dateFormat: "dd MM yy, DD"
  }).datepicker("setDate", defaultEndDate);

  updateDateBoundary();

  // Change event for datepicker
  $startDatepicker.change(function() {
    var username = $("#memberDropdownList .display-text").html();

    updateDateBoundary();
    loadCommitHistory(username);
  });

  $endDatepicker.change(function() {
    var username = $("#memberDropdownList .display-text").html();

    updateDateBoundary();
    loadCommitHistory(username);
  });
}



/**
 * Initialise the commit history table.
 */
function initCommitHistoryTable() {
  $("#commit-history-table").DataTable();
}



/**
 * Refreshes the start and end datepicker's date when either one is changed.
 */
function updateDateBoundary() {
  var $startDatepicker = $("#startDatepicker");
  var $endDatepicker = $("#endDatepicker");

  $startDatepicker.datepicker("option", "maxDate", $endDatepicker.datepicker("getDate"));
  $endDatepicker.datepicker("option", "minDate", $startDatepicker.datepicker("getDate"));
}



/**
 * Method to retrieve members of the repo and populate them in the dropdown list.
 *
 * @param $memberDropdownMenu the dropdown menu that is to be populated
 * @param url                 the URL to load the members of the repo
 */
function populateMemberDropdown($memberDropdownMenu, url) {
  $.ajax({
    url: url
  }).done(function(datas) {
    var contributors = [];

    // Add contributors into contributors array
    $.each(datas, function(index, data) {
      contributors.push(data.author.login);
    });

    // Sort the contributors
    contributors.sort(ignoreCaseComparator);

    // Reset the dropdown list and add the contributors to the dropdown list.
    $memberDropdownMenu.empty();
    $.each(contributors, function(index, contributor) {
      $memberDropdownMenu.append("<li><a href='#'>" + contributor + "</a></li>");
    });

    // Set the first record in the dropdown list to be selected.
    var $memberDropdownDisplay = $memberDropdownMenu.closest(".dropdown").find(".display-text");
    var selectedText = getParameterByName("author", window.location.href);

    $memberDropdownDisplay.html(selectedText);

    loadCommitHistory(selectedText);
  });
}



/**
 * Loads the commit history for the user specified.
 *
 * @param username  username of the author to load his / her commit history
 */
function loadCommitHistory(username) {
  var startDate = $("#startDatepicker").datepicker("getDate");
  var endDate = $("#endDatepicker").datepicker("getDate");

  // Set the end time to end at the end of the end date i.e. 23:59:59
  endDate.setHours(23);
  endDate.setMinutes(59);
  endDate.setSeconds(59);

  var commitHistoryUrl = "https://api.github.com/repos/" + repoName + "/commits"
                       + "?author=" + username + "&since=" + startDate.toISOString()
                       + "&until=" + endDate.toISOString();
  var commitHistories = [];

  retrieveCommitHistory(commitHistories, commitHistoryUrl, populateCommitHistory);
}



/**
 * Recursive function to retrieve all the commit history. Needed because github
 * returns the list of commits in 30 by default and it's paginated.
 *
 * @param commitHistories   an array of commit history
 * @param commitHistoryUrl  the URL to retrieve the commit history
 * @param callback          the function to execute after retrieving all the data
 * @return                  a list of commit history
 */
function retrieveCommitHistory(commitHistories, commitHistoryUrl, callback) {
  $.ajax({
    url: commitHistoryUrl
  }).done(function(datas, textStatus, jqXHR) {
    commitHistories = commitHistories.concat(datas);

    var link = jqXHR.getResponseHeader("Link");

    // Link not null means there's might be next page.
    // According to API, next link will be the first among all the links.
    if (link !== null) {
      var nextUrl = link.split(",")[0].split(";")[0];
      var isNext = link.split(",")[0].split(";")[1].includes("next");

      // Only recurse if it's a next link.
      if (isNext) {
        // To remove the < and > are the start and end of the url
        nextUrl = nextUrl.substring(1, nextUrl.length - 1);
        
        return retrieveCommitHistory(commitHistories, nextUrl, callback);
      }
    }

    // Method to execute after the retrival of content is completed.
    callback(commitHistories);

    return commitHistories;
  });
}



/**
 * Populates the datatable according to the commit history retrieved.
 *
 * @param commitHistories   the commit history retrieved that is to be displayed
 */
function populateCommitHistory(commitHistories) {
  $("#commit-history-table").DataTable({
    columns: [
      { data: "commit.message" },
      {
        data: "sha",
        render: function(data) {
          return formatSHA(data);
        }
      },
      {
        data: "commit.author.date",
        render: function(data) {
          return formatDate(new Date(data));
        }
      }
    ],
    data: commitHistories,
    destroy: true,
    order: [
      [2, "desc"]
    ]
  });
}



/**
 * Format the date received to display as dd MMM yyyy.
 *
 * @param date  the date to be formatted
 * @return      the formatted date
 */
function formatDate(date) {
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
}




/**
 * Format the SHA received to display as a 7 character string.
 *
 * @param   sha the SHA to be formatted
 * @return      the formatted SHA
 */
function formatSHA(sha) {
  return sha.substring(0, 7);
}



/**
 * Function to get the value of parameter by name from the query string.
 *
 * @param name  the parameter name to retrieve
 * @param url   the url to retrieve the parameter name from
 * @return      the value of the parameter specified
 */
function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }

  name = name.replace(/[\[\]]/g, "\\$&");

  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  var results = regex.exec(url);

  if (!results) {
    return null;
  }

  if (!results[2]) {
    return '';
  }

  return decodeURIComponent(results[2].replace(/\+/g, " "));
}



/**
 * Comparator to ignore case when sorting.
 */
function ignoreCaseComparator(s1, s2) {
  var s1lower = s1.toLowerCase();
  var s2lower = s2.toLowerCase();
  return s1lower > s2lower? 1 : (s1lower < s2lower? -1 : 0);
}
