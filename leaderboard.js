// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  Template.player_add;

  Template.leaderboard.players = function() {
    var order = Session.equals("sortOrder","byName") ? {name : -1} : {score: -1, name: 1};
    return Players.find({}, {sort: order});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.leaderboard.edit_mode = function() {
    return Session.get("addForm");
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };



  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },

    'click input.sortByName': function() {
      Session.set("sortOrder", 'byName');
    },
    'click input.sortByPoints': function() {
      Session.set("sortOrder", 'byPoints');
    },
    'click input.addPlayer':function() {
      Session.set("addForm", "true");
    },
    'click input.shufflePoints': function() {
      var players = Players.find({});
      players.forEach(function(player){
          Players.update(
            {_id: player._id},
            {
              $set: {
                score: Math.floor(Random.fraction()*10)*5}
              }
          );
      });
    },

  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    },

    'click input.delete_player': function() {
      Players.remove({_id: Session.get("selected_player")});
    }
  });

  Template.new_player_form.events({
    'click input.insert_player': function() {
      var player_name = document.getElementById('newname').value;
      var initial_score = parseInt(document.getElementById('newpoints').value);
      Players.insert({name: player_name, score: initial_score});
      document.getElementById('scientistform').reset();
    }
  });

}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}
