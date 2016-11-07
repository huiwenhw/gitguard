// Global variables
var repoLink = localStorage.getItem('repolink');
var repoName = localStorage.getItem('reponame');
var membersList = [];
var contributionsList;



/**
 * Initialise elements in the page.
 */
function initPage() {
  // Initialise elements
  initDatepicker();
  initMemberDropdown();
  initAddMemberButton();
}



/**
 * Initialise the dropdown list with members names.
 */
function initMemberDropdown() {
  var contributorsUrl = "https://api.github.com/repos/" + repoName +  "/stats/contributors";

  var $memberDropdownList = $("#member-dropdown-list");
  var $memberDropdownMenu = $("#member-dropdown-list .dropdown-menu");

  populateMemberDropdown($memberDropdownMenu, contributorsUrl);

  // Click event for member dropdown to replace the display text with the selected text
  $memberDropdownMenu.on("click", "li a", function() {
    var $memberDropdownDisplay = $(this).closest(".dropdown").find(".display-text");
    var selectedText = $(this).html();

    $memberDropdownDisplay.html(selectedText);
  });
}

function initDatepicker() {
  var now = new Date();
  var currMonthFirstDate = getMonthFirstDate(now.getFullYear(), now.getMonth());
  var currMonthLastDate = getMonthLastDate(now.getFullYear(), now.getMonth());

  var $monthDatepicker = $("#month-datepicker");

  // Initialise the datepicker
  $monthDatepicker.datepicker({
    changeMonth: true,
    changeYear: true,
    dateFormat: 'dd MM yy',
    showButtonPanel: true,
    onClose: function(dateText, inst) {
      var monthFirstDate = getMonthFirstDate(inst.selectedYear, inst.selectedMonth);
      var monthLastDate = getMonthLastDate(inst.selectedYear, inst.selectedMonth);

      $monthDatepicker.datepicker('setDate', monthFirstDate);
      updateCharts(monthFirstDate, monthLastDate);
    }
  });

  // Set the date to current month
  $monthDatepicker.datepicker("setDate", currMonthFirstDate);
  updateCharts(currMonthFirstDate, currMonthLastDate);
}



function initAddMemberButton() {
  var $addMemberButton = $("#add-member-button");
  $addMemberButton.click(function() {
    var $memberDropdownMenu = $("#member-dropdown-list .dropdown-menu");
    var $memberDropdownDisplay = $memberDropdownMenu.closest(".dropdown").find(".display-text");
    var selectedText = $memberDropdownDisplay.html();
    var startDate = $("#month-datepicker").datepicker("getDate");
    var $selectedAuthors = $("td.author-name");

    if (selectedText === "Please select a member to view efforts") {
      alert("Please choose again!");
      return;
    }

    for (var i = 0; i < $selectedAuthors.length; i++) {
      if ($($selectedAuthors[i]).html() === selectedText) {
        alert("Author already chosen!");
        return;
      }
    }

    addMemberContributions(startDate, selectedText);
  });
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
    contributionsList = datas;

    // Add contributors into membersList array
    $.each(datas, function(index, data) {
      membersList.push(data.author.login);
    });

    // Sort the contributors
    membersList.sort(ignoreCaseComparator);

    // Reset the dropdown list and add the contributors to the dropdown list.
    $memberDropdownMenu.empty();
    $.each(membersList, function(index, contributor) {
      $memberDropdownMenu.append("<li><a href='#'>" + contributor + "</a></li>");
    });

    // Updates the dropdown display after loading is done.
    var $memberDropdownDisplay = $memberDropdownMenu.closest(".dropdown").find(".display-text");
    $memberDropdownDisplay.html("Please select a member to view efforts");
  });
}



function addMemberContributions(startDate, author) {
  var graphs = generateGraphs(startDate, author);

  appendGraphs(graphs);
}



function appendGraphs(graphs) {
  var $effortsTable = $("#efforts-table");
  var hasDefaultRow = $effortsTable.has("tr.default").length == 1;
  var isTableEmpty = $effortsTable.children().length == 0;
  var $row = $("<tr></tr>");

  if (hasDefaultRow || isTableEmpty) {
    var $thead = $("<thead></thead>");

    // remove default row and add header
    $effortsTable.find("tr.default").remove();

    $row.append("<th>Author</th>");

    $.each(graphs.data, function(index, data) {
      var date = data[0];
      $row.append("<th>Week of " + formatDate(date) + "</th>");
    });

    $thead.append($row);
    $effortsTable.append($thead);
    $row = $("<tr></tr>");
  }

  // append rows
  $row.append("<td class='author-name'>" + graphs.author + "</td>")
  $.each(graphs.data, function(index, data) {
    $row.append("<td id='" + graphs.author + index + "'></td>");
  });

  $effortsTable.append($row);

  // Plot the graphs
  $.each(graphs.data, function(index, data) {
    console.log(data[1]);
    Plotly.newPlot(graphs.author+index, data[1], getGraphLayout(), {staticPlot: true});
  })
}



function generateGraphs(startDate, authorName) {
  var endDate = getMonthLastDate(startDate.getFullYear(), startDate.getMonth());

  // Filter author
  var author = jQuery.grep(contributionsList, function(contributions, i) {
    return contributions.author.login === authorName;
  })[0];

  // Filter weeks
  var weeks = jQuery.grep(author.weeks, function(week, i) {
    var date = unixTimestampToDate(week.w);
    return startDate <= date && date <= endDate;
  });

  var data = [];

  $.each(weeks, function(index, week) {
    var date = unixTimestampToDate(week.w);
    var additionsGraph = generateGraph("additions", week.a, "#00d1b2");
    var deletionsGraph = generateGraph("deletions", week.d, "#ee6e73");
    var graphInfo = [additionsGraph, deletionsGraph];

    data.push([date, graphInfo]);
  });

  return {
    author: authorName,
    data: data
  };
}



/**
 * Generates the graph based on the parameters provided.
 *
 * @param valueName   the appropriate name for the value
 * @param value       the value to be displayed
 * @param color       the color of that value
 * @return            an object containing information required to build the whole graph
 */
function generateGraph(valueName, value, color) {
  return {
    type: 'bar',
    x: [value],
    name: valueName,
    orientation: 'h',
    marker: {
      color: color,
      width: 10
    }
  };
}


function updateCharts(startWeekDate, endWeekDate) {
  var $authorNameCells = $("td.author-name");
  var $effortsTable = $("#efforts-table");
  var hasDefaultRow = $effortsTable.has("tr.default").length == 1;

  if (!hasDefaultRow) {
    $effortsTable.empty();
  }

  $authorNameCells.each(function() {
    var graphs = generateGraphs(startWeekDate, $(this).html());

    appendGraphs(graphs);
  })
}



/**
 * Gets the layout for the graph.
 *
 * @return  the layout for the graph
 */
function getGraphLayout() {
  return {
    thickness: 20,
    barmode: 'stack',
    showlegend: false,
    xaxis: {
      autorange: true,
      showgrid: false,
      zeroline: false,
      showline: false,
      autotick: true,
      ticks: '',
      showticklabels: false
    },
    yaxis: {
      autorange: true,
      showgrid: false,
      zeroline: false,
      showline: false,
      autotick: true,
      ticks: '',
      showticklabels: false
    }
  };
}



/**
 * Converts unix timestamp to date.
 * @param timestamp   the timestamp to be converted
 * @return            the converted timestamp
 */
function unixTimestampToDate(timestamp) {
  return new Date(timestamp * 1000);
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
 * Retrieves the first date of the month provided.
 * First date with time set to 0:0:0.0
 *
 * @param year    the year to look at the month
 * @param month   the month to get its first date (month is from 0 to 11)
 * @return        a date object that is set to the first date of the month provided
 */
function getMonthFirstDate(year, month) {
  return new Date(year, month, 1, 0, 0, 0, 0);
}



/**
 * Retrieves the last date of the month provided.
 * Last date with time set to 23:59:59:999
 *
 * @param year    the year to look at the month
 * @param month   the month to get its last date (month is from 0 to 11)
 * @return        a date object that is set to the last date of the month provided
 */
function getMonthLastDate(year, month) {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}



/**
 * Comparator to ignore case when sorting.
 */
function ignoreCaseComparator(s1, s2) {
  var s1lower = s1.toLowerCase();
  var s2lower = s2.toLowerCase();
  return s1lower > s2lower? 1 : (s1lower < s2lower? -1 : 0);
}
