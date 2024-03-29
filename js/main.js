var jsonArr = [], percentArr = [], authorArr = [], jsonDirArr = [];
var totalCom, totalAdd, totalDel, totalAddDel, totalLineCommits;
var repoLink = localStorage.getItem('repolink'), repoName = localStorage.getItem('reponame');
var linesArr = [], percentLinesArr = [], authorLinesArr = [], percentCleanLinesArr = [], authorCleanLinesArr = [], jsonLinesArr = [];

$(document).ready(function() {
	obtainCurrentLinesData();
	obtainData();
	obtainDirData();
	displayRepoName();
	fileClickEvent();
});

function displayRepoName() {
	$('.reponame').text(repoName);
}

function obtainData() {
	var statsRepoLink = "https://api.github.com/repos/" + repoName + "/stats/contributors";
	console.log('repolink: ' + repoLink + ' reponame: ' + repoName + ' statslink: ' + statsRepoLink);
	$.ajax({
		type: "GET",
		url: statsRepoLink,
		dataType: "json",
		success: processData,
		error: function() {
			alert("The link given does not exist or GitHub could be down at the moment." +
					"Please press back on your browser and input your repolink again!");
		}
	});
}

function processData(data, status, xhr) {
	if (xhr.status != 200) {
		obtainData();
	}
	var author = "";
	for(i=0 ; i<data.length ; i++) {
		author = data[i].author.login;
		var add = 0, del = 0, com = 0;;
		for(k=0 ; k<data[i].weeks.length ; k++) {
			add += data[i].weeks[k].a;
			del += data[i].weeks[k].d;
			com += data[i].weeks[k].c;
		}
		jsonArr.push({"author": author, "add": add, "del": del, "com": com});
	}
	// Need to call drawPie here else data wont be processed
	// i.e. gotta wait for callback function
	publishData();
	addAll();
	calcPercentage();
	drawPie();
}

function publishData() {
	jsonArr = jsonArr.sort(function(a, b) {
		return parseInt(a.com) - parseInt(b.com);
	});
	jsonArr = jsonArr.reverse();
	for(i=0 ; i<jsonArr.length ; i++) {
		addRow(jsonArr[i].author, jsonArr[i].add, jsonArr[i].del, jsonArr[i].com);
	}
}

function addRow(author, insertions, deletions, commits) {
	$('#stats-table tr:last').before(
			'<tr>' +
			'<td><a href="commit_history.html?author=' + author  + '">' + author + '</a></td>' +
			'<td>' + commits +  '</td>' +
			'<td>' + insertions + '</td>' +
			'<td>' + deletions + '</td>');
}

function addAll() {
	totalCom = jsonArr.reduce(function (a, b) {
		return {com: parseInt(a.com) + parseInt(b.com)};
	});
	totalAdd = jsonArr.reduce(function (a, b) {
		return {add: parseInt(a.add) + parseInt(b.add)};
	});
	totalDel = jsonArr.reduce(function (a, b) {
		return {del: parseInt(a.del) + parseInt(b.del)};
	});
	totalAddDel = parseInt(totalAdd.add) + parseInt(totalDel.del);
}

function calcPercentage() {
	for(i=0 ; i<jsonArr.length ; i++) {
		percent = (parseInt(jsonArr[i].add) + parseInt(jsonArr[i].del)) / parseInt(totalAddDel);
		if(percent*100 > 1) {
			percentArr.push(percent*100);
			authorArr.push(jsonArr[i].author);
		}
		console.log('author: ' + jsonArr[i].author + ' percent: ' + percent);
	}
}

function obtainDirData() {
	var dirRepoLink= "https://api.github.com/repos/" + repoName + "/contents/";
	$.ajax({
		type: "GET",
		url: dirRepoLink,
		dataType: "json",
		success: processDirData,
		error: function(){
			// alert("Sorry file content is not avail!");
		}
	});
}

function processDirData(data, status, xhr) {
	if (xhr.status != 200) {
		obtainDirData();
	}
	for(i=0 ; i<data.length ; i++) {
		var filename = data[i].name;
		var filetype = data[i].type;
		var filepath = data[i].path;
		addDirRow(filename, filetype, filepath);
		jsonDirArr.push({"filename": filename, "filetype": filetype, "filepath": filepath});
	}
}

function addDirRow(filename, filetype, filepath) {
	$('#file-table tr:last').after(
			'<tr id="tr' + filepath + '" data-indent=0>' +
			'<td class="files"' +
			'id="' + filepath +'">' +
			'<a>' + filename + '</a></td>' +
			'<td id="file-' + filename + '">' + filetype + '</td></tr>');
}

function fileClickEvent() {
	$("#file-table").on('click', '.files', function() {
		var id = $(this).attr('id');
		//var type = $('#' + id).parent('tr').find('td')[1].textContent;
		var type = document.getElementById('file-' + id).textContent;
		console.log('clicked. id: ' + id + ' type: ' + type);
		if (type == 'file') {
			location.href = 'file.html?file=' + id;
		} else {
			if (document.getElementsByClassName(id + 'children').length) {
				console.log(id + 'children alr present');
			} else {
				obtainRecurTreeData(id, id);
			}
		}
	});
}

var parentID = "", parentPATH = "";
function obtainRecurTreeData(id, path) {
	var recurTreeRepoLink = "https://api.github.com/repos/" + repoName + "/contents/" + id;
	console.log('recurRepoLink: ' + recurTreeRepoLink);
	parentID = id.replace(/\//g,'');
	parentPATH = path;
	console.log('in obtainrecur. id: ' + parentID + ' path: ' + parentPATH);
	$.ajax({
		type: "GET",
		url: recurTreeRepoLink,
		dataType: "json",
		success: processRecurTreeData,
		error: function(){
			// alert("Sorry file content is not avail!");
		}
	});
}

function processRecurTreeData(data, status, xhr) {
	if (xhr.status != 200) {
		obtainRecurTreeData(recurID, recurSHA);
	}
	for(i=0 ; i<data.length ; i++) {
		var filename = data[i].name;
		var filetype = data[i].type;
		var filepath = data[i].path;
		addRecurTreeRow(filename, filetype, filepath);
		jsonDirArr.push({"filename": filename, "filetype": filetype, "filepath": filepath});
	}
}

/*
 * now:
 * tr id: using tr+filename w/o slashes:  to add new rows under
 * tr class: using parent filename + children: to check if data was loaded
 * td class: for styling
 * td[0] id: for filename
 * td[1] id: for textcontent (file/dir?)
 * Try:
 * td id: use filepath.
 */
function addRecurTreeRow(filename, filetype, filepath) {
	//console.log(`filename: ${filename}, myIndent: ${myIndent}, myIndent*30: ${myIndent * 30}`);
	var myIndent = parseInt($('#tr' + parentID).data('indent'), 10) + 1;
	//console.log('addRow: ' + document.getElementById('tr' + parentID) + ' file: ' + filename);

	$('#tr' + parentID).after(
			'<tr id="tr' + filepath.replace(/\//g,'') +
			'" class="' + parentPATH + 'children" data-indent=' + myIndent + '>' +
			'<td class="files" id="' + filepath +'">' +
			'<a>' + filepath + '</a></td>' +
			'<td id="file-' + filepath + '">' + filetype + '</td></tr>');
	$(document.getElementById('tr' + filepath.replace(/\//g,''))).find('td').first().css('padding-left', `${30 + myIndent * 30}px`); // doesn't work for names with . in btwn
}

function obtainCurrentLinesData() {
	console.log('obtaining lines still alive in project');
	$.ajax({
		type: "GET",
		url: "https://polar-tundra-75062.herokuapp.com/api/git/git-get?url=" + repoName.replace('/','%2F'),
		dataType: "json",
		success: processLines,
		error: function(){
			// alert("Sorry we are unable to obtain the commits per author for the current repo. Please try again later!");
		}
	});
}

function processLines(data) {
	data = data.res;
	for(i=0 ; i<data.length-1 ; i++) {
		var lines = data[i].split('author')[0].trim();
		var author = data[i].split('author')[1].trim();
		jsonLinesArr.push({"author": author, "lines": lines});
		linesArr.push(lines);
		authorLinesArr.push(author);
	}
	sumLinesCommits();
	convertToLinesPercent();
	removeLeastPercentage(percentLinesArr);
	publishLinesData();
	drawLinesPie();
}

function sumLinesCommits() {
	totalLineCommits = linesArr.reduce(function(a, b) {
		return parseInt(a) + parseInt(b);
	});
}

function convertToLinesPercent() {
	percentLinesArr = linesArr.map(function(elem) {
		return (elem / totalLineCommits)*100;
	});
}

function removeLeastPercentage(arr) {
	for(i=0 ; i<arr.length ; i++) {
		if(arr[i] > 1) {
			percentCleanLinesArr.push(percentLinesArr[i]);
			authorCleanLinesArr.push(authorLinesArr[i]);
		}	
	}
}

function publishLinesData() {
	jsonLinesArr = jsonLinesArr.sort(function(a, b) {
		return parseInt(a.lines) - parseInt(b.lines);
	});
	jsonLinesArr = jsonLinesArr.reverse();
	for(i=0 ; i<jsonLinesArr.length ; i++) {
		addLinesRow(jsonLinesArr[i].author, jsonLinesArr[i].lines);
	}
}
function addLinesRow(author, lines) {
	$('#currentcommit-table tr:last').before(
			'<tr>' +
			'<td><a href="commit_history.html?author=' + author  + '">' + author + '</a></td>' +
			'<td>' + lines +  '</td></tr>');
}

function drawPie() {
	console.log(percentArr);
	console.log(authorArr);
	var data = [{
		values: percentArr,
		labels: authorArr,
		type: 'pie'
	}];

	var layout = {
		title: 'Contributions of authors',
		height: 400,
		width: 480
	};

	Plotly.newPlot('piechart', data, layout);
}

/*
function drawPie() {
	console.log(percentArr);
	console.log(authorArr);
	var data = [{
		values: percentArr,
		labels: authorArr,
		domain: {
			x: [0, 0.95],
			y: [0.48, 1]
		},
		name: '',
		hoverinfo: 'label+percent+name',
		hole: .8,
		type: 'pie'
	}];

	var layout = {
		title: 'Contributions of authors',
		annotations: [
		{
			font: {
				size: 14
			},
			showarrow: false,
			text: '',
		}
		],
		height: 400,
		width: 480
	};

	Plotly.newPlot('piechart', data, layout);
}
*/

function drawLinesPie() {
	console.log(percentCleanLinesArr);
	console.log(authorCleanLinesArr);
	var data = [{
		values: percentCleanLinesArr,
		labels: authorCleanLinesArr,
		type: 'pie'
	}];

	var layout = {
   		title: 'Lines surviving per author',
		height: 400,
		width: 480
	};

	Plotly.newPlot('pielineschart', data, layout);
}

/*
   function drawLinesPie() {
   console.log(percentCleanLinesArr);
   console.log(authorCleanLinesArr);
   var data = [{
   values: percentCleanLinesArr,
   labels: authorCleanLinesArr,
   domain: {
   x: [0, 0.95],
   y: [0.48, 1]
   },
   name: '',
   hoverinfo: 'label+percent+name',
   hole: .8,
   type: 'pie'
   }];

   var layout = {
   title: 'Lines surviving per author',
   annotations: [
   {
   font: {
   size: 14
   },
   showarrow: false,
   text: '',
   }
   ],
   height: 400,
   width: 480
   };

   Plotly.newPlot('pielineschart', data, layout);
   }
   */
