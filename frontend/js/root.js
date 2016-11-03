$(document).ready(function() {
	$("#inputlink").keyup(function(event){
		if(event.keyCode == 13){
			$("#submitbtn").click();
			$('#inputlink').val('');
		}
	});

	$('#submitbtn').on('click', function() {
		var repolink = $('#inputlink').val();
		var reponame = repolink.replace('https://github.com/','');
		console.log('repolink: ' + repolink + ' reponame: ' + reponame);
		localStorage.setItem('repolink', repolink);
		localStorage.setItem('reponame', reponame);
		console.log(localStorage.getItem('repolink'));
		console.log(localStorage.getItem('reponame'));
		location.href = "main.html";
	});
});
