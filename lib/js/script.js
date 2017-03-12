$( "button.brand, .about" ).click(function() {
    $( ".about" ).fadeToggle( "slow" );
});
var i=1;
$("#start").on("click", function(){
    $('.waper').css("background-color", "#ffea8a");
    $('span').css('color','#333;');
    $('#point').remove();
    $('#start').remove();
    $('#text').remove();
    socket.emit('start test', $('#m').val());
    return false;
});
$("#next").on("click", function(){
//    console.log($("input[type=radio][name=answer]:checked").val());
    socket.emit('answer message', $("input[type=radio][name=answer]:checked").val());
    $('.radio').remove();
    $('h2').remove();
    $('#next').hide("fast");
    i++
    return false;
});
socket.on('question message', function(msg){
    //i++;
    $( ".selector" ).progressbar( {
        value: i,
        max: 17
    } );
    $('#messages').append($("<h2 class='query'>").text(msg[0] ));
    if (msg[1] == -1){
        $('#messages').append("<div class='radio'><input name='answer' id='male' type='radio' value='1'> " +
            "<label for='male'>Жіноча</label><input name='answer' id='female' type='radio' value='2'><label for='female'>Чоловіча</label>" +
            "<input name='answer' id='none' type='radio'  value='3'><label for='none'>Пропустити</div>");
    } else if (msg[1] == -2){
        $('#messages').append("<div class='radio'><input name='answer' id='18' type='radio' value='1'><label for='18'>До 18</label>" +
            "<input name='answer' id='18-25' type='radio' value='2'><label for='18-25'>18-25</label>" +
            "<input name='answer' id='26-35' type='radio'  value='3'><label for='26-35'>26-35</label>" +
            "<input name='answer' id='36-45' type='radio'  value='4'><label for='36-45'>36-45</label>" +
            "<input name='answer' id='46-60' type='radio' value='5'><label for='46-60'>46-60</label>" +
            "<input name='answer' id='60' type='radio' value='6'><label for='60'>більше 60</label></div>");
    } else
    {
        $('#messages').append("<div class='radio'><input name='answer' id='first' type='radio' value='1'><label for='first'>Підтримую!</label>" +
            "<input name='answer' id='second' type='radio' value='2'><label for='second'>Не підтримую</label>" +
            "<input name='answer' id='third' type='radio'  value='3'><label for='third'>Не знаю</label>" +
            "<input name='answer' id='fourth' type='radio'  value='4'><label for='fourth'>Мені байдуже</label></div>");
    }
    $(":radio").on("click", function () {
        if ($('#next').is(':hidden')) {
            $('#next').show("fast");
            $('#next').css('display',"block !important");
            $('#next').css('margin',"0 auto");
//        console.log("Click");
        }

    });
});
socket.on('redirect', function(destination) {
    window.location.href = destination;
});
socket.on('finish message', function(msg){

    $('#messages').html('<div class="warp-item"><div class="block"></div></div>');
    $('#messages').prepend($('<h1 class="query">').text(msg));
    $( ".selector" ).remove();
    $('#next').remove();
    function expectation () {
        $( ".block" ).animate({ "top": "+=170px",
                "backgroundColor": "#FF5733" },
            "slow",
            function() {
                $(".block" ).animate({"backgroundColor": "#ffea8a;","top":"-=170px"},
                    "fast",
                    function() {
                        expectation();
                    });
            } );
        $(".warp-item").animate( {"backgroundColor": "#FF5733" },
            "5000",
            function () {
                $(".warp-item").animate( {"backgroundColor": "#ffea8a" },
                    "fast" )
            })
    }
    expectation();
});
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/uk_UA/sdk.js#xfbml=1&version=v2.8";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));