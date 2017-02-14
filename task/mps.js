var request = require('request');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var client = require("./../config/mysql");
var api_key = require("./../config/api_key");
var URL = "https://rada4you.org/api/v1/people.json?key=" + api_key.key;
console.log(URL);


function  savePeople(obj) {
    var sql = "INSERT INTO all_mps ( id, first_name, last_name, party, presence_percent ) VALUES ?";
    client.query(sql, [obj], function (err) {
        if (err) throw err;
        client.end();
    });
}

function getPresence_percent (mp_id) {
    var URI = "https://rada4you.org/api/v1/people/" + mp_id + ".json?key=" + api_key.key;
    // Create new object XMLHttpRequest
    var xhr = new XMLHttpRequest();
    // GET request
    xhr.open('GET', URI, false);
    // Send
    xhr.send();
    if (xhr.status != 200) {
        // return error
        console.log( xhr.status + ': ' + xhr.statusText ); // example return : 404: Not Found
    } else {
        // return result
        var mps = JSON.parse( xhr.responseText); // responseText -- body result.
        var presence_percent = (mps.votes_attended / mps.votes_possible * 100).toFixed(2);
        return presence_percent;
    }
}
try {
    request({
        url: URL,
        headers: {'User-Agent': 'HTTP_USER_AGENT:Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/534.13 (KHTML, like Gecko) Chrome/9.0.597.47'}
    }, function (err, res, body) {
        if (err) throw err;
        console.log("start")
        var obj = JSON.parse(body);
        var insert  = [];
        obj.forEach(function (item) {
            var presence_percent = getPresence_percent(item.id);
            console.log(item.id+" "+item.latest_member.name.first+" "+item.latest_member.name.last+" "+item.latest_member.party+" "+presence_percent);
            insert.push([item.id, item.latest_member.name.first, item.latest_member.name.last, item.latest_member.party, presence_percent])
        });
        savePeople(insert);
        console.log("All done");
    });
}
catch (err) { 
    console.log("Error");
}
