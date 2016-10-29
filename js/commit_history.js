/**
 * Initialise elements in the page.
 */
function initPage() {
  initMemberDropdown();
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
  var commitHistoryUrl = "https://api.github.com/repos/TEAMMATES/teammates/commits?author=" + username;

  $.ajax({
    url: commitHistoryUrl
  }).done(function(datas) {
    console.log(datas);
  });
}



/**
 * Comparator to ignore case when sorting.
 */
function ignoreCaseComparator(s1, s2) {
  var s1lower = s1.toLowerCase();
  var s2lower = s2.toLowerCase();
  return s1lower > s2lower? 1 : (s1lower < s2lower? -1 : 0);
}
