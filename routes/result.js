var express = require('express');
var client = require("../config/mysql");
var router = express.Router();
var getMpsAll = require('./../lib/getmpsall');
var getMaxOfArray = require('./../lib/getMaxOfArray');
/* GET result listing. */

router.use('/',function(req, res, next) {
    getResult(req.query.test);
    function getResult(user_id) {
        client.query('SELECT * FROM answers AS a LEFT JOIN question AS q ON a.id_query=q.id WHERE a.user_id=?', user_id, readResult);
    }
    function readResult(error, result, fields) {
        if (error) throw error;
        if (result.length == 0){
            res.status(404).send("NOT FOUND");
        };
        checkResult(result, function (data){
            // console.log(data.policy.length);
            data.policy.forEach(function (item, index, array) {
                if (data.changer_array[index] == -1) {
                    var no_votes = data.policy[index].filter(function (mps) { return mps.voted == 0});
                    // console.log(no_votes);
                    var no_votes_list = no_votes.map(function (item) { return item.person_id});
                } else {
                    var no_votes_list = [];
                }
                // console.log(no_votes_list);
                // console.log(index);
                // console.log(item[0]);
                item.forEach(function (r, i, a) {
                    // console.log(i);
                    var mp = data.mps[0].find( function (m) { return m.id == r.person_id });
                    if (mp != undefined) {
                        if (!no_votes_list.includes(r.person_id)) {
                                mp.points = mp.points + r.label * data.changer_array[index];
                        }
                        if (Math.abs(data.changer_array[index]) != 0) {
                                mp.max_points = mp.max_points + Math.abs(3 * data.changer_array[index]);
                        }
                        mp.percent = mp.points / mp.max_points
                    }
                    // console.log(mp);
                });
            });
            max_points  = data.mps[0].map(function (i) { return i.max_points});
            max_point =  (getMaxOfArray(max_points)/3) * 2;
            mps = data.mps[0].filter(function (mp) { return mp.max_points >= max_point });
            // sort percent, presence_percent
            mps.sort(function(a, b) {
                return (a.percent<b.percent) - (b.percent<a.percent) || (a.presence_percent<b.presence_percent) - (b.presence_percent<a.presence_percent);
            });
            //------
            sart_mps = mps.slice(0, 5);
            end_mps = mps.slice(-5);
            // Return result in web page;
            res.send({head: sart_mps, foter: end_mps});
        });
    }
    function checkResult(data, callback) {
        res_mp = {};
        res_mp.policy =[];
        res_mp.changer_array = [];
        res_mp.mps = [];
        changer_array = [];
        var itemsProcessed = 0;
        data.forEach(function (item, index, array) {
            itemsProcessed++;
            switch (item.answer) {
                case 1:
                    var multiplier = 1;
                    break;
                case 2:
                    var multiplier = -1;
                    break;
                default:
                    var multiplier = 0;
            }
            var changer = multiplier * item.agreement;
            res_mp.changer_array.push(changer);
            queryPolicy(item.policy_id, function (result) {
                // console.log(result);
                res_mp.policy.push(result);
            });
            if (itemsProcessed === array.length ) {
                 getMpsAll(function (mps) {
                //     // console.log(mps);
                     res_mp.mps.push(mps);
                     callback(res_mp);
                 });
            }
        });
    }
    function queryPolicy(policy_id, collback) {
        client.query('SELECT * FROM policy WHERE id = ?', policy_id, function readPolicy(error, result, fields) {
            if (error) throw error;
            collback(result);
        })
    }
});

module.exports = router;