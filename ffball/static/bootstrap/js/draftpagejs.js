// !!!! NOTE FROM SAIKAT
//!!!!!!!!!!!this needs to change!
// ie onclick="CounterInit(10); return false;"
// this is where i got it from : http://www.jqueryscript.net/time-clock/Simple-jQuery-Digital-Countdown-Timer-Plugin.html
//CounterInit(1);

$(function ()
{ $("#moreOnPlayer").popover();
});

$(function() {
    $('tr').bind('click', function (e) { });
    $('button').bind('click', function(e) {
        e.stopPropagation();
   });
});


$(function(){
    $('#listOfWatchPlayers2').slimScroll({
		height: '200px',
		width: 'auto',
		alwaysVisible: false,
		railVisible: true,
		size: '9px',
		color: '#ffffff',
		railColor: '#999999',
		disableFadeOut: false
    });

    $('#newsbox').slimScroll({
		height: '200px',
		width: 'auto',
		alwaysVisible: false,
		railVisible: true,
		size: '9px',
		color: '#ffffff',
		railColor: '#999999',
		disableFadeOut: false
    });
    $('#newsbox2').slimScroll({
		height: '200px',
		width: 'auto',
		alwaysVisible: false,
		railVisible: true,
		size: '9px',
		color: '#ffffff',
		railColor: '#999999',
		disableFadeOut: false
    });
});


var dragSrcEl = null;
var cols = document.querySelectorAll('#listOfWatchPlayers .dndcontainer');

function handleDragStart(e) {
  this.style.opacity = '0.4';  // this / e.target is the source node.
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }
  e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
  return false;
}

function handleDragEnter(e) {
  // this / e.target is the current hover target.
  this.classList.add('over');
}

function handleDragLeave(e) {
  this.classList.remove('over');  // this / e.target is previous target element.
  update_Q();
}

function handleDrop(e) {
  // this/e.target is current target element.

  if (e.stopPropagation) {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }

  // Don't do anything if dropping the same column we're dragging.
  if (dragSrcEl != this) {
    // Set the source column's HTML to the HTML of the column we dropped on.
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text/html');
    this.style.opacity = '1.0';
    dragSrcEl.style.opacity = '1.0';
  }
  return false;
}

function handleDragEnd(e) {
  // this/e.target is the source node.
  [].forEach.call(cols, function (col) {
    col.classList.remove('over');
    col.style.opacity = '1.0';
  });
}

[].forEach.call(cols, function(col) {
  col.addEventListener('dragstart', handleDragStart, false);
  col.addEventListener('dragenter', handleDragEnter, false);
  col.addEventListener('dragover', handleDragOver, false);
  col.addEventListener('dragleave', handleDragLeave, false);
  col.addEventListener('drop', handleDrop, false);
  col.addEventListener('dragend', handleDragEnd, false);
});



// ------------------------------- jQuery/Ajax functions ---------------------------------------------------------
// using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrftoken = getCookie('csrftoken');
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function sameOrigin(url) {
    // test that a given url is a same-origin URL
    // url could be relative or scheme relative or absolute
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = '//' + host;
    var origin = protocol + sr_origin;
    // Allow absolute or scheme relative URLs to same origin
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
        (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
        // or any other URL that isn't scheme relative or absolute i.e relative.
        !(/^(\/\/|http:|https:).*/.test(url));
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
            // Send the token to same-origin, relative URLs only.
            // Send the token only if the method warrants CSRF protection
            // Using the CSRFToken value acquired earlier
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});


function get_info( pid ) {
   res = { 'player_id' : pid,
           'league_id' : league_id,
           'func' : 'get_player_info'
         };
  $.ajax({
    type: "POST",
    url: "/jquery/",
    dataType: "json",
    data: {'data' : JSON.stringify(res)},
    success: function (response) {
       console.log(JSON.stringify(response));
       if ( response['result'] != 'success' ) { alert(response['msg']); return }
       $('#selected_player [name=name]').html('<h4>&nbsp;' + response['msg']['name'] + '</h4>');
       $('#selected_player [name=team_name]').html('&nbsp;' + response['msg']['team']);
       $('#selected_player [name=position]').html('&nbsp;<b>' + response['msg']['position'] + '</b>');
       $('#selected_player [name=rank]').html('&nbsp;Rank #' + response['msg']['rank']);
       $('#moreOnPlayer').attr('data-content', response['msg']['more']);
       $('#moreOnPlayer').attr('data-original-title', response['msg']['name']);
       $('#player-image').attr('src', response['msg']['img_url']);
       $('button[name=addToTeam]').attr('onclick', "addToTeam('{pid}', '{name}')".format({'pid' : pid, 'name': response['msg']['name'] }))
       $('button[name=addToQ]').attr('onclick', "addToQ('{pid}', '{name}')".format({'pid' : pid, 'name': response['msg']['name'] }))
       current_selected['player_id'] = pid;
       current_selected['name'] = response['msg']['name'];
       return true;
    },
    error: function (msg) {
      alert("Error while calling web service," + msg.Message);
    }
  });

}


function sendJsonQuery( res, success_func, error_func ) {
    $.ajax({
    type: "POST",
    url: "/jquery/",
    dataType: "json",
    data: {'data' : JSON.stringify(res)},
    success: success_func,
    error: error_func || function (msg) {
      alert("Error while calling web service," + msg.Message);
    }
  });
}

if (!String.prototype.format) {
  String.prototype.format = function() {
 //   alert(JSON.stringify(arguments))
    var args = arguments[0];
    return this.replace(/{([A-Za-z_\d]+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function addToQ( pid ) {
    res = { 'player_id' : pid || current_selected['player_id'],
	    'league_id' : league_id,
	    'func' : 'add_player',
	    'status': 'Q',
    };
    var a = addedQ.indexOf(res['player_id']);
    if ( a>=0 ) { alert("Already in the Queue!"); return true; }
    sendJsonQuery ( res, function (response) {
	    if ( response['result']!='success' ) {alert(response['msg']); return;}
	    div_elem = '<div class="dndcontainer" name="watchPlayers" id="watchplayer-{player_id}" draggable="true"> \
                   <table width=100% > \
                     <tr> \
                       <td width="25"><b>{position}</b></td> \
                       <td width=%> \
                         <button class="btn btn-small btn-success" onclick="addToTeam(\'{player_id}\', \'{name}\')" type="button" > {name} </button> \
                       </td> \
                       <td width="25" align="right"> \
                         <a><i id="deletequeue-{player_id}" onclick="delete_from_watchlist(this)" class="icon-minus icon-white"></i></a> \
                       </td> \
                     </tr> \
                   </table> \
                </div>'.format(response['msg']);
	    $(div_elem).on('dragstart', handleDragStart, false);
	    $(div_elem).on('dragenter', handleDragEnter, false);
	    $(div_elem).on('dragover', handleDragOver, false);
	    $(div_elem).on('dragleave', handleDragLeave, false);
	    $(div_elem).on('drop', handleDrop, false);
	    $(div_elem).on('dragend', handleDragEnd, false);
	    $(div_elem).appendTo('#listOfWatchPlayers');
	    addedQ.push(pid);
	});
}


function addToTeam( pid, player_name ) {
   res = { 'player_id' : pid || current_selected['player_id'],
           'league_id' : league_id,
           'func' : 'add_player',
           'status': 'A',
         };
   var a = addedP.indexOf(res['player_id']);
   if ( a>=0 ) { alert("Already in the Queue!"); return true; }
   r = confirm("Going to draft " + player_name +"! Lets do it?")
   if ( r == true ) {
       sendJsonQuery ( res, function (response) {
           console.log(JSON.stringify(response));
           if ( response['result']=='success') {
              if ( response['msg']['status'] == 'B' ) {
                  if ( benchCount > 0 ) {
                      a=$('#tr-BN'+ benchCount)
                  }
                  else {
                       console.log('first bench');
                       a = $('#tr-K1');
                  }
                  b = a.clone();
                  benchCount += 1;
                  b.attr('id', 'tr-BN'+benchCount);
                  $(b).children().find('b').html('BN'+benchCount)
                  $(b).children().find('button').html(response['msg']['name'])
                  a.after(b)
              }
              else {
                  tdid = "#tr-{position}{rank}".format(response['msg'])
                  console.log(tdid);
                  $(tdid).find('button').html(response['msg']['name'])
              }
              $('#watchplayer-{0}'.format({0:pid})).remove()
              addedP.push(pid)
           }
           else {
              alert('ERROR!:' + response['msg']);
           }
       })
   }
}

function update_Q(){
    list = $(cols)
}

function delete_from_watchlist( elem ) {
   pid = elem.id.split('-')[1];
   w_id = "#watchplayer-" + pid;
   res = { 'player_id' : pid,
           'league_id' : league_id,
           'func'      : 'delete_from_queue'
         }
   sendJsonQuery(res, function (response) {
       //alert('Done!Mother Fucker' + JSON.stringify(response) + w_id);
       $(w_id).remove();
       var a = addedQ.indexOf(res['player_id']);
       if ( a>=0 ) { addedQ.splice(a, 1) }
       return true;
    })
}

function UpdateCurrentDrafter(team_id)
{
    // XXX: Should we change the "height" too?
    for (i = 0; i < team_ids.length; i++) {
        $('#team-image-' + team_ids[i]).width(80);
    }
    $('#team-image-' + team_id).width(normalWidth);
}

function UpdateTimeout(timeout)
{
    var now = new Date();
    var diff = Math.floor((timeout - now)/1000);
    if (diff > 0) {
        console.log("timeout in: " + diff);
        CounterInit(diff);
    }
}

function DraftStatusProcess(data)
{
    //console.log(data);
    if (draft_current != data['current']) {
        console.log("current-drafter: " + data['current']);
        draft_current = data['current'];
        UpdateCurrentDrafter(draft_current);
    }
    if (draft_timeout != data['timeout'] && data['timeout'] != null) {
        console.log("current-timeout: " + data['timeout']);
        draft_timeout = data['timeout'];
        UpdateTimeout(data['timeout']);
    }
}

(function DraftStatusPoll(){
    setTimeout(function() {
        $.ajax({
            type: "GET",
		    url: "/data/draft/{league_id}/updates".format({'league_id':league_id}),
		    success: function(data){
		    // Process poll response
		    DraftStatusProcess(data);
		},
		    dataType: "json",
		    complete: DraftStatusPoll,
		    timeout: 3000 });
        }, 3000 );
})();

function field(s)
{
    if (s  == null) {
        return '-';
    } else if (typeof s == 'number') {
        return s.toFixed(1);
    }
    return s;
}

function table_row(p, i)
{
    row = '<tr onclick="get_info(\'' + p.fields.player__pid + '\')">' +
          '<td><button class="btn btn-mini btn-success" type="button" ' +
          'onclick="addToQ(\'' + p.fields.player__pid + '\')">' +
          '<i class="icon-plus icon-black"></i></button></td>' +
    '<td>' + (i+1) + '</td>' +
    '<td>' + field(p.fields.player__name) + '</td>' +
    '<td>' + field(p.fields.player__position) + '</td>' +
    '<td>' + field(p.fields.player__team) + '</td>' +
    '<td>' + 0 + '</td>' +
    '<td>' + field(p.fields.pass_att) + '</td>' +
    '<td>' + field(p.fields.pass_comp) + '</td>' +
    '<td>' + field(p.fields.pass_td) + '</td>' +
    '<td>' + field(p.fields.run_yds) + '</td>' +
    '<td>' + field(p.fields.run_att) + '</td>' +
    '<td>' + field(p.fields.run_td) + '</td>' +
    '</tr>';
    return row;
}

function RefreshPlayers(data)
{
    $("#player-list").find("tr:gt(0)").remove();
    for (i = 0; i < data.length; i++) {
        $('#player-list tr:last').after(table_row(data[i], (player_page-1)*20 + i));
    }
}

function RefreshPages(data)
{
    cur = player_page;
    total = Math.ceil(player_size/20);
    $('#player-pages').empty();
    $('#player-pages').append(
            '<li><a href="javascript:void(0)" ' +
            'onclick="LoadPage(' + 1  + ')">&laquo;</a></li>');
    for (i = cur-2; i <= cur+2; i++) {
        if (i > 0) {
            $('#player-pages').append(
                    '<li><a href="javascript:void(0)" ' +
                    'onclick="LoadPage(' + i + ')">' + i + '</a></li>');
        }
    }
    $('#player-pages').append(
            '<li><a href="javascript:void(0)" ' +
        'onclick="LoadPage(' + total + ')">&raquo;</a></li>');
}

function GetPlayers()
{
    url = "/data/proplayer/order?type=" + player_type + "&sort=" + player_sort;
    url += "&start=" + (player_page*20) + "&length=20";
    console.log(url);
    $.ajax({
        type: "GET",
        url: url,
        success: RefreshPlayers,
        dataType: "json",
        timeout: 10000,
    });
}

function GetPlayerSize()
{
    url = "/data/proplayer/order-size?type=" + player_type;
    $.ajax({
        type: "GET",
        url: url,
        success: RefreshPages,
        dataType: "json",
        timeout: 10000,
    });

}

function GetPlayersByType(type)
{
    console.log("Type: " + type);
    player_type = type;
    player_page = 1;
    GetPlayerSize();
    GetPlayers();
}

function GetPlayersBySort(sort)
{
    console.log("Sort: " + sort);
    player_sort = sort;
    GetPlayers();
}

function LoadPage(p)
{
    console.log("Load-page: "+p);
    player_page = p;
    GetPlayers();
    RefreshPages();
}
