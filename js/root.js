$(document).ready(function() {
	$("#inputlink").keyup(function(event){
		if(event.keyCode == 13){
			$("#submitbtn").click();
			$('#inputlink').val('');
		}
	});

	$('#submitbtn').on('click', function() {
		var repolink = $('#inputlink').val();
		if (!repolink.startsWith('https://github.com')) {
			alert('The link given must be a GitHub url, starting with "https://github.com"');
			return;
		}
		var reponame = repolink.replace('https://github.com/', '');
		if (reponame.charAt(reponame.length - 1) == '/') {
			reponame = reponame.substr(0, reponame.length - 1);
		}
		localStorage.setItem('repolink', repolink);
		localStorage.setItem('reponame', reponame);
		location.href = 'main.html';
	});
});
