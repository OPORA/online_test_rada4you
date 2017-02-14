var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var client = require("./../config/mysql");
var api_key = require("./../config/api_key");

function getLabel(Label){
    if (Label <= 5) {
        return -3 //against_max"
    } else if (Label <= 15) {
        return -2 //"against_medium"
    } else if (Label <= 40) {
        return -1 // "against_soft"
    } else if (Label <= 60) {
        return 0 // "null"
    } else if (Label <= 85) {
        return 1 // "for_soft"
    } else if (Label <= 95) {
        return 2 // "for_medium"
    } else if (Label <= 100) {
        return 3 // "for_max"
    }
}
function getPolicyResult(id) {
    var URI = "https://rada4you.org/api/v1/policies/" + id + ".json?key=" + api_key.key;
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
        var policies = JSON.parse( xhr.responseText); // responseText -- body result.
        return policies;
    }
}
function getPolicies(cb){
    var policy = [];
    client.query('SELECT DISTINCT `policy_id` FROM `question` ORDER BY`policy_id` ASC', function (err, results, fields) {
        var pending = results.length;
        for ( i in results) {
            policy.push(results[i].policy_id);
            if( 0 === --pending ) {
                cb(policy); //callback if all queries are processed
            }
        }
    } );
}
function savePolicies(res) {
    var sql = "INSERT INTO policy ( id, name, person_id, agreement, voted, number_of_votes, label ) VALUES ?";
    client.query(sql, [res], function (err) {
        if (err) throw err;
        client.end();
    });
}
getPolicies(function (policies) {
    var result =[];
    policies.forEach( function (item) {
        console.log(item);
        var policy = getPolicyResult(item);
        policy.people_comparisons.forEach(function (res) {
          var agreement = res.agreement.replace(/,/,'.');
          var Label = getLabel(agreement);
          var obj = [ policy.id,  policy.name,   res.person.id, agreement,  res.voted,  policy.policy_divisions.length,  Label];
           result.push(obj);
           console.log(policy.id + " " +policy.name + " " + res.person.id + " "+ agreement + " " + res.voted + " " + policy.policy_divisions.length  + " " + Label);
        });
    });
    savePolicies(result);
});