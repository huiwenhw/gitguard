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
		if(reponame.charAt(reponame.length-1) == '/')
			reponame = reponame.substr(0, reponame.length - 1);
		console.log('repolink: ' + repolink + ' reponame: ' + reponame);
		localStorage.setItem('repolink', repolink);
		localStorage.setItem('reponame', reponame);
		console.log(localStorage.getItem('repolink'));
		console.log(localStorage.getItem('reponame'));
		location.href = "main.html";
	});
});
