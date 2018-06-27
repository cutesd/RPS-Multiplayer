$(document).ready(function () {

    var RPSMultiPlayer = function () {

        var database, connectionsRef, connectedRef;
        var playerNum = 0;
        var playerName = "default2";

        this.play = init;

        function init() {
            console.log('ready');


        }

        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyCn0_vTEcyCAreJ-BIMvJpb5aKOs6ac1fo",
            authDomain: "rps-multiplayer-d90f9.firebaseapp.com",
            databaseURL: "https://rps-multiplayer-d90f9.firebaseio.com",
            projectId: "rps-multiplayer-d90f9",
            storageBucket: "rps-multiplayer-d90f9.appspot.com",
            messagingSenderId: "403284751521"
        };

        firebase.initializeApp(config);

        database = firebase.database();
        connectionsRef = database.ref("/connections");
        connectedRef = database.ref(".info/connected");

        // When the client's connection state changes...
        connectedRef.on("value", function (snap) {

            // If they are connected..
            if (snap.val()) {

                // Add user to the connections list.
                var con = connectionsRef.push(true);

                // Remove user from the connection list when they disconnect.
                con.onDisconnect().remove();
            }
        });

        // When first loaded or when the connections list changes...
        connectionsRef.on("value", function (snap) {

            // Set playerNum to numChildren
            playerNum = snap.numChildren();
        });



        /* ====================  WINS & LOSSES  ======================== */

        database.ref("/player" + playerNum).on("value", function (snapshot) {

            // Print the local data to the console.
            console.log(snapshot.val());


            // If any errors are experienced, log them to console.
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

        /* ====================  CHAT  ======================== */

        $("#sendBtn").on("click", addMessage)

        database.ref("/chat").limitToLast(5).on("child_added", function (snapshot) {
            //messagesRef.limitToLast(10).on('child_added', function (snapshot) {
            console.log(snapshot.val());
            updateChat(snapshot.val());

            // If any errors are experienced, log them to console.
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

        function addMessage(e) {
            e.preventDefault();
            var obj = {
                name: playerName,
                msg: $("#input-msg").val()
            };
            database.ref("/chat").push(obj);
        }

        function updateChat(val) {

            var card = $("<div>").addClass("card w-100");
            card.append(`<div class="card-body">
            <h5 class="card-title">`+ val.name + ` says:</h5>
            <p class="card-text">`+ val.msg + `</p>
          </div>`);
            $("#msg-window").append(card);
        }

        function gamePlay() {
            if (computerGuess === userGuess) {
                ties++;

            } else if (computerGuess === 'r') {
                if (userGuess === 'p') {
                    wins++;
                } else {
                    losses++;
                }
            } else if (computerGuess === 'p') {
                if (userGuess === 's') {
                    wins++;
                } else {
                    losses++;
                }
            } else if (computerGuess === 's') {
                if (userGuess === 'r') {
                    wins++;
                } else {
                    losses++;
                }
            }

        }

        //
        //
        //end
    }


    var myGame = new RPSMultiPlayer();
    myGame.play();


});