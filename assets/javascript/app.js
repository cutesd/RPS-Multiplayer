$(document).ready(function () {

    var RPSMultiPlayer = function () {

        var database, connectionsRef, connectedRef;
        var win_arr = new Array(2);
        var loss_arr = new Array(2);
        var playerNum = -1;
        var screenName = "";
        var winCnt = 0;
        var lossCnt = 0;

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
            console.log(snap.val());
            if (playerNum === -1) {
                playerNum = snap.numChildren();
                $("#myData").text("Player" + playerNum);
            }
            console.log("num:", playerNum);
            // playerName = "player"+playerNum;
        });

        /* ====================  Player Setup  ======================== */
        $("#submitName").on("click", setScreenName);
        $("#submitWin").on("click", setWin);
        $("#submitLoss").on("click", setLoss);

        function setScreenName(e) {
            e.preventDefault();
            screenName = $("#input-name").val();
            $("#input-name").val('');
        }


        /* ====================  WINS & LOSSES  ======================== */

        function setWin(e) {
            e.preventDefault();
            winCnt++;
            win_arr[playerNum - 1] = winCnt;
            database.ref("/win").set({
                arr: JSON.stringify(win_arr)
            });
        }

        function setLoss(e) {
            e.preventDefault();
            lossCnt++;
            loss_arr[playerNum - 1] = lossCnt;
            database.ref("/loss").set({
                arr: JSON.stringify(loss_arr)
            });
        }

        database.ref("/win").on("value", function (snapshot) {

            // Print the local data to the console.
            console.log(snapshot.val());
            if (snapshot.child('arr').exists()) {
                win_arr = JSON.parse(snapshot.val().arr);
            }


            // If any errors are experienced, log them to console.
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

        database.ref("/loss").on("value", function (snapshot) {

            // Print the local data to the console.
            console.log(snapshot.val());
            if (snapshot.child('arr').exists()) {
                loss_arr = JSON.parse(snapshot.val().arr);
            }

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
                name: screenName,
                msg: $("#input-msg").val()
            };

            database.ref("/chat").push(obj);
        }
        $("#input-msg").val('')
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