var jsonArr = [];
var percentArr = [], authorArr = [];
var totalCom, totalAdd, totalDel, totalAddDel;
obtainData();

function obtainData() {
	$.ajax({
		type: "GET",
		url: "https://api.github.com/repos/twbs/bootstrap/stats/contributors",
		dataType: "json",
		success: processData,
		error: function(){ alert("failed"); }
	});
}

function processData(data) {
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
		addRow(author, add, del, com);
	}
	// Need to call drawPie here else data wont be processed 
	// i.e. gotta wait for callback function
	addAll();
	calcPercentage();
	drawPie();
}

function addAll() {
	totalCom = jsonArr.reduce(function (a, b) {
		  return {com: a.com + b.com}; 
	});
	totalAdd = jsonArr.reduce(function (a, b) {
		  return {add: a.add+ b.add}; 
	});
	totalDel = jsonArr.reduce(function (a, b) {
		  return {del: a.del+ b.del}; 
	});
	totalAddDel = totalAdd.add + totalDel.del;
}

function calcPercentage() {
	for(i=0 ; i<jsonArr.length ; i++) {
		percent = (jsonArr[i].add + jsonArr[i].del) / totalAddDel;
		percentArr.push(Math.round(percent*100));
		authorArr.push(jsonArr[i].author);
	}	
}

function addRow(author, commits, insertions, deletions) {
	$('#stats-table tr:last').after('<tr><td>' + author + '</td><td>' + commits +  '</td><td>' + insertions + '</td><td>' + deletions + '</td>');
}

function drawPie() {
	var data = [{
		values: percentArr,
		labels: authorArr,
		domain: {
			x: [0, 0.95],
			y: [0.48, 1]
		},
		name: 'Insertions/Deletions',
		hoverinfo: 'label+percent+name',
		hole: .8,
		type: 'pie'
	}];

	var layout = {
		title: 'Contributions of members',
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
