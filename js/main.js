obtainData();

function obtainData() {
	$.ajax({
		type: "GET",
		url: "https://api.github.com/repos/cassidoo/getting-a-gig/stats/contributors",
		dataType: "json",
		success: processData,
		error: function(){ alert("failed"); }
	});
}

function processData(data) {
	var author = "";
	var arr = [];
	for(i=0 ; i<data.length ; i++) {
		author = data[i].author.login;
		var add = 0, del = 0, com = 0;;
		for(k=0 ; k<data[i].weeks.length ; k++) {
			add += data[i].weeks[k].a;
			del += data[i].weeks[k].d;
			com += data[i].weeks[k].c;
		}
		addRow(author, add, del, com);
	}
}

function calculate(data) {
	var add = 0, del = 0, com = 0;;
	for(i=0 ; i<data.weeks.length ; i++) {
		add += data.weeks[i].a;
		del += data.weeks[i].d;
		com += data.weeks[i].c;
	}
	return [add, del, com];
}

function addRow(author, commits, insertions, deletions) {
	$('#stats-table tr:last').after('<tr><td>' + author + '</td><td>' + commits +  '</td><td>' + insertions + '</td><td>' + deletions + '</td>');
}
