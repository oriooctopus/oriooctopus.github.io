var OBJECTIDS = {};
var FRIENDS = {};
var ALLROOMS = {};
var ROOM;

$(document).ready(function (){
  app.init();
  setInterval(app.fetch, 60000);

  $('#roomSelect').on('change', function() {
    if (this.value === 'new room') {
      var newRoom = prompt('What is the name of the new room?');
      app.renderRoom(newRoom);
      $('#roomSelect').val(newRoom);
    }
    ROOM = this.value;
    app.init();
  });

  $(this).on('click', '.username', function() {
    app.handleUsernameClick($(this).val()); 
  })

  $(this).on('submit', '#chatbox', function(event) {
    event.preventDefault();
    app.handleSubmit($('input').val());
    $('input').val('')
  })

  $(this).on('click', '.username', function () {
    var name = $(this).text();
    app.handleUsernameClick(name);
    FRIENDS[name] = name;
  });

  $(this).on('click', '.delete', function () {
    var name = $(this).closest('.chat').find('.username').text();
    console.log(name)
    app.deleteUserMsgs(name);
    setTimeout(app.init, 500);
    setTimeout(function() {
      OBJECTIDS = {};}, 500);
    });  
});

var app = {

};

app.server = 'https://evening-reef-99317.herokuapp.com/classes/messages';

app.init = function() {
  $('#chats').empty();
  $.ajax({
    url: app.server,
    type: 'GET',
    data: {order: '-createdAt'},
    contentType: 'application/json',
    success: function (data) {

      JSON.parse(data).results.forEach(function(element) {
        if (element.roomname === ROOM) {
          app.renderMessage(element);
          OBJECTIDS[element.objectId] = element.objectId;
        }
        if (!(element.roomname in ALLROOMS)) {
          ALLROOMS[element.roomname] = element.roomname;
        }
      });
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.send = function(message) {
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function() {
  $.ajax({
    url: app.server,
    type: 'GET',
    // data: {order: '-createdAt'},
    contentType: 'application/json',
    success: function (data) {
      console.log(data)
      JSON.parse(data).results.forEach(function(element) {
        if (element.roomname === ROOM && (element.objectId in OBJECTIDS) !== true) {
          app.renderMessage(element, 'fetchReverse');
          OBJECTIDS[element.objectId] = element.objectId;
        }
        if (!(element.roomname in ALLROOMS)) {
          ALLROOMS[element.roomname] = element.roomname;
        }
      });
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });

  app.updateRoomSelection();
};

app.clearMessages = function() {
  $('#chats').empty();
}

app.renderMessage = function(message, onFetch) {
  var $user = $('<div class="username"></div>');
  var $deleteButton = $('<button class="delete">Kill User</button>');
  var $msg = $('<div class="msg"></div>');
  var $chat = $('<div class="chat"></div>');
  $user.text(message.username);

  if (message.username in FRIENDS) {
    $user.addClass("friend");
  }

  $msg.text(escapeRegExp(message.text));
  $chat.append($user);
  $chat.append($deleteButton);
  $chat.append($msg);

  if (onFetch !== undefined) {
    $('#chats').prepend($chat);
  } else {
    $('#chats').append($chat);
  }
  audio.play();
} 

app.renderRoom = function(name) {
  var $room = $('<option value ="' + name + '">' + name + '</option>');
  $('#roomSelect').append($room);
}

app.handleUsernameClick = function(name) {
  $('.username').each(function(index, value) {
    if ($(value).text() === name) {
      $(value).addClass("friend");
    }
  });
}

app.handleSubmit = function(userMessage) {
  var user = parseQueryString(window.location.search).username;
  app.send({
    username: user,
    text: userMessage,
    roomname: ROOM
  });
}

app.updateRoomSelection = function() {
  var currentRooms = [];

  $('#roomSelect').children().each(function(i, val) {
    currentRooms.push($(val).val());
  });

  currentRooms.sort();

  for (var prop in ALLROOMS) {

    if (!(currentRooms.includes(ALLROOMS[prop])) && ALLROOMS[prop]) {
      var $newRoom = $('<option value="' + prop + '">' + prop + '</option>');
      $('#roomSelect').prepend($newRoom);
    }
  }
}

app.deleteUserMsgs = function(name) {
  var messages = [];
  fetch();

  setTimeout(function() {
    messages.forEach(function(objID) {
    deleteDB(objID);
    })
  }, 200);

  function fetch() {
    $.ajax({
      url: app.server,
      type: 'GET',
      // data: {order: '-createdAt', limit: 100},
      contentType: 'application/json',
      success: function (data) {
        data.results.forEach(function(element) {
          if (element.username === name || element.username === undefined) {
            messages.push(element.objectId);
          }
        });
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message', data);
      }
    });
  };

  function deleteDB(contentKey) {
    $.ajax({
        url: app.server + contentKey,
        type: 'DELETE',
        success: function(){console.log('Deleted')},
        error: function(){console.log('Failed')}
    });
  }
}


function escapeRegExp(str) {
  if (str === undefined) {
    return undefined;
  } else {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "");
  }
}

var parseQueryString = function() {
  var str = window.location.search;
  var objURL = {};
  str.replace(
      new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
      function( $0, $1, $2, $3 ){
          objURL[ $1 ] = $3;
      }
  );
  return objURL;
};

var audio = new Audio('tone.mp3');

// Deleter 
function deleter () {
  var messages = [];
  app.server2 = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';

  var fetch = function() {
    $.ajax({
      url: app.server2,
      type: 'GET',
      // data: {order: '-createdAt', limit: 1000},
      contentType: 'application/json',
      success: function (data) {
        data.results.forEach(function(element) {
          messages.push(element.objectId)
        });
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message', data);
      }
    });
  };

  fetch();

  var deleteDB = function(contentKey) {
    $.ajax({
        url: app.server2 + contentKey,
        type: 'DELETE',
        success: function(){console.log('Deleted')},
        error: function(){console.log('Failed')}
    });
  }

  messages.forEach(function(objID) {
    deleteDB(objID);
  });
}