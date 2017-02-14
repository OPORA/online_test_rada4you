var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var client = require("./config/mysql");
var result = require("./routes/result")
app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'jade');
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
app.use('/result', result);

io.on('connection', function(socket){
  socket.on('start test', function(){
     var user_id = socket.id;
     var i = 0;
    function getQuery(cb) {
      socket.questions = [];
      var pending = 15;
      var policy = client.query('SELECT DISTINCT `policy_id` FROM `question` ORDER BY RAND() LIMIT 15'); 
      policy.on('error', function(err) {
        throw err;
      });
      policy.on('result', function(row) {
        var query = client.query('SELECT * FROM `question` WHERE policy_id = ' + row.policy_id + ' ORDER BY RAND() LIMIT 1');
        query.on('error', function(err) {
          throw err;
        });
        query.on('result', function(row) {

          socket.questions.push(row);
          if( 0 === --pending ) {
            cb(socket.questions); //callback if all queries are processed
          }
        });
      });
    }
    function sendQuery(query) {
      io.to(user_id).emit('question message', query);
    }
    function  saveAnswer(id_query, answer) {
      client.query('INSERT INTO answers SET ?', {id_query: id_query, answer: answer, user_id: socket.id}, function (error, results, fields) {
        if (error) throw error;
        // console.log(results.insertId);
      });
    }
    getQuery(function (query) {
      sendQuery(query[i].question);
      // console.log(i);
      // console.log(query[i].question);
      socket.on('answer message', function (result) {

        if ( result != null ) {
          // console.log(result);
          saveAnswer(query[i].id, result)
        }

        i++;
        if (i < 15)
        {
          sendQuery(query[i].question);
          // console.log(i);
          // console.log(query[i].question); 
        }    
        else {
          text = "The End :)"
          io.to(user_id).emit('finish message', text);
          var destination = '/result?test='+ user_id;
          io.to(user_id).emit('redirect', destination);
        }
      });
    });
  });
});
//Start web server
http.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
