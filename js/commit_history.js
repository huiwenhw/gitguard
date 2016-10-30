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
  var contributorsUrl = "https://api.github.com/repos/TEAMMATES/teammates/stats/contributors";

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
    updateDateBoundary();
  });

  $endDatepicker.change(function() {
    updateDateBoundary();
  });
}



function initCommitHistoryTable() {
  $("#commit-history-table").DataTable();

}



function updateDateBoundary() {
  var $startDatepicker = $("#startDatepicker");
  var $endDatepicker = $("#endDatepicker");

  $startDatepicker.datepicker("option", "maxDate", $endDatepicker.datepicker("getDate"));
  $endDatepicker.datepicker("option", "minDate", $startDatepicker.datepicker("getDate"));
}



/**
 * Method to retrieve members of the repo and populate them in the dropdown list.
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
    var selectedText = $memberDropdownMenu.find("li").first().find("a").html();
    $memberDropdownDisplay.html(selectedText);

    loadCommitHistory(selectedText);
  });
}



/**
 * Loads the commit history for the user specified.
 */
function loadCommitHistory(username) {
  var startDate = $("#startDatepicker").datepicker("getDate");
  var endDate = $("#endDatepicker").datepickter("getDate");
  var commitHistoryUrl = "https://api.github.com/repos/TEAMMATES/teammates/commits?author=" + username;

  $("#commit-history-table").DataTable({
    ajax: {
      url: commitHistoryUrl,
      dataSrc: function(json) {
          return json;
      }
    },
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
    destroy: true,
    order: [
      [2, "desc"]
    ]
  });

  $.ajax({
    url: commitHistoryUrl
  }).done(function(datas) {
    console.log(datas);
    var $commitHistoryTable = $("#commit-history-table");
    //$commitHistoryTable.empty();
    //$commitHistoryTable.append("<tr><th>Description</th><th>Commit</th><th>Date</th></tr>");
    /*$.each(datas, function(index, data) {
      var commitMessage = data.commit.message;
      var commitSha = data.sha;
      var commitDate = new Date(data.commit.author.date);

      $commitHistoryTable.append("<tr><td>" + commitMessage + "</td><td>" + commitSha + "</td><td>" + formatDate(commitDate) + "</td></tr>");
    });*/
  });
}



function formatDate(date) {
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  console.log(date.getDate() + " " + months[date.getMonth()] + " " + date.getYear());
  return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
}



function formatSHA(sha) {
  return sha.substring(0, 7);
}



/**
 * Comparator to ignore case when sorting.
 */
function ignoreCaseComparator(s1, s2) {
  var s1lower = s1.toLowerCase();
  var s2lower = s2.toLowerCase();
  return s1lower > s2lower? 1 : (s1lower < s2lower? -1 : 0);
}
