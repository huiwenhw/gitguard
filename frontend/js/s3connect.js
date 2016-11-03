var bucketname = 'gitguardbucket';
var bucket = new AWS.S3({params: {Bucket: bucketname}});
var jsonFileName = "subslist" // do not change. constant filename

$('.subscribe-button').click(function() {
  subscribe();
});

function subscribe() {
  getJson(jsonFileName, function (subscriptionList) {
    var updatedList = $.extend(true, {}, subscriptionList); // deep copy of subscription list
    if (!isRepoFound(subscriptionList)) {
      updatedList = addRepoToJson(requestedRepoLink, updatedList);
    }

    updatedList = addEmailsToRepo(requestedEmails, requestedRepoLink, updatedList);

    // console.log("updatedlist:");
    // console.log(JSON.stringify(updatedList));
    // console.log("subscriptionList:");
    // console.log(JSON.stringify(subscriptionList));
    if (!(JSON.stringify(updatedList) === JSON.stringify(subscriptionList))) { // if there is no change
      uploadJson(updatedList);
    }
  });
}

function updateDate() {
  getJson(jsonFileName, function (subscriptionList) {
    var updatedList = $.extend(true, {}, subscriptionList); // deep copy of subscription list
    if (!isRepoFound(subscriptionList)) {
      updatedList = addRepoToJson(requestedRepoLink, updatedList);
    }

    editLastSeenDateforRepo(requestedRepoLink, updatedList);

    if (!(JSON.stringify(updatedList) === JSON.stringify(subscriptionList))) { // if there is no change
      uploadJson(updatedList);
    }
  });
}

function getJson(jsonFileName, callback) { // returns the object requested
  var param = {Key: jsonFileName + ".json"};
  bucket.getObject(param, function (err, data) {
    if (err) {
        var errString = err.toString();
        var obj = {};
        console.log(errString);
        if (errString.indexOf("The specified key does not exist.") > 0) {
          // create new one
          obj["repos"] = [];
        }
        console.log(obj);
        callback(obj);
    } else {
        var stringBuf = data.Body.toString('utf-8');
        var obj = JSON.parse(stringBuf);
        console.log('Loaded from S3: ');
        console.log(obj);
        callback(obj);
    }
  });
}

function isRepoFound(list) {
  for (var i = list["repos"].length - 1; i >= 0; i--) {
    if (list["repos"][i]["link"] == requestedRepoLink) {
      return true;
    }
  }
  return false;
}

function addRepoToJson(repoLink, jsonObj) {
  var repoArr = jsonObj["repos"];
  var newRepo = {
                  "link" : repoLink,
                  "emails" : []
                }
  repoArr.push(newRepo);
  console.log("added repo. new obj:");
  console.log(jsonObj);
  return jsonObj;
}

function addEmailsToRepo(emails, repoLink, jsonObj) {
  var repoArr = jsonObj["repos"];
  for (var i = repoArr.length - 1; i >= 0; i--) {
    if(repoArr[i]["link"] == repoLink) {
      var emailArr = repoArr[i]["emails"];
      for (var j = emails.length - 1; j >= 0; j--) {
        var email = emails[j];
        if (emailArr.indexOf(email) >= 0) {
          console.log("Email already exists");
          alert("Email " + email + " already exists, so it will be ignored.");
        } else {
          emailArr.push(email);
          console.log("email added. new obj:");  
        }
      }
      console.log(jsonObj);
      return jsonObj;
    }
  };
}

function editLastSeenDateforRepo(repoLink, jsonObj) {
  var repoArr = jsonObj["repos"];
  for (var i = repoArr.length - 1; i >= 0; i--) {
    if(repoArr[i]["link"] == repoLink) {
      var date = new Date();
      // console.log(date.getTime());
      repoArr[i]["last-seen"] = date.getTime();
      return jsonObj;
    }
  };
}

function uploadJson(updatedJson) {

  var params = {
    Key: jsonFileName + ".json", /* required */
    ACL: "bucket-owner-full-control", // to enable redownload and modification
    Body: JSON.stringify(updatedJson)
  };

  bucket.putObject(params, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("upload success!");
    }
  });
}