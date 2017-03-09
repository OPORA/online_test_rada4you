var client = require("../config/mysql");
var getMpsAll = function(callback) {
    mps =[];
        client.query('SELECT * FROM all_mps order by id asc', function (error, result, fields) {
            if (error) throw error;
            // res.json(result);
            var itemsProcessed = 0;
            result.forEach(function (item, index, array) {
                itemsProcessed++;
                mps.push({
                    id: item.id,
                    first_name: item.first_name,
                    last_name: item.last_name,
                    party: item.party,
                    presence_percent: item.presence_percent,
                    points: 0,
                    max_points: 0,
                    percent: null
                });
                if (itemsProcessed === array.length ) {
                    callback(mps);
                }
            });
        });
};
module.exports = getMpsAll;