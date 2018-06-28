$(document).ready(function () {

    var RPSMultiPlayer = function () {

        var database, connectionsRef, connectedRef;
        var uid, cid;
        var win_arr = new Array(2);
        var loss_arr = new Array(2);
        var numPlayers = 0;
        var setUp = true;
        var screenName = "";
        var challengeName = "";
        var winCnt = 0;
        var lossCnt = 0;
        var gameNum = -1;
        var obj = {};
        var disObj = {};
        var game_arr = [];
        var oL = 0;
        var timer;

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
        // userRef = database.ref('/presence/' + userid);

        // userRef.on("value", function (snapshot) {
        //     console.log("user:", snapshot.val);
        // });

        // When the client's connection state changes...
        connectedRef.on("value", function (snap) {

            // If they are connected..
            if (snap.val()) {
                // Add user to the connections list.    
                var con = connectionsRef.push(true);
                // Remove user from the connection list when they disconnect.
                con.onDisconnect().remove();
                //lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
                database.ref("/players").onDisconnect().set(disObj);
                database.ref("/chat").onDisconnect().set({});
            }
        });

        connectionsRef.limitToLast(1).once("value", function (snap) {
            $.each(snap.val(), function (key, val) {
                console.log(key, ":", val);
                uid = key;
                return false;
            });
        });

        // When first loaded or when the connections list changes...
        connectionsRef.on("value", function (snap) {

            // Set playerNum to numChildren
            console.log("connections:", snap.val());
            oL = Object.keys(obj).length;
            if (oL !== snap.numChildren()) {

                if (oL > snap.numChildren()) {
                    $.each(obj, function (key, val) {
                        if (!snap.child(key).exists()) {
                            delete obj[key];
                            disObj = {};
                            challengeName = "";
                            database.ref("/players").set(obj);
                            return false;
                        }
                    });
                }
            }
            $.each(snap.val(), function (key, val) {
                disObj[key] = obj[key];
            });
            oL = Object.keys(obj).length;
            //
            if (snap.numChildren() === 2) {

            }

        });

        /* ====================  Player Setup  ======================== */
        $("#submitName").on("click", setScreenName);

        database.ref("/players").limitToLast(2).on("value", function (snapshot) {

            console.log("players:", snapshot.val());

            if (setUp) {
                setUp = false;
                if (snapshot.val() !== null) {
                    obj = snapshot.val();
                }
                setObj(uid);
                oL = Object.keys(obj).length;
                if (oL > 1) {
                    setChallenger();
                }
            } else {
                obj = snapshot.val();
                if (oL > 1 && challengeName.length < 1) {
                    setChallenger();
                }
            }
            oL = Object.keys(obj).length;
            setPlayerDisplay();

        });

        function setObj(key) {
            obj[key] = {
                name: '',
                win: 0,
                loss: 0,
                uid: key
            };
            // console.log("obj:", obj);
            database.ref("/players").set(obj);
        }

        function setScreenName(e) {
            e.preventDefault();
            screenName = $("#input-name").val();
            obj[uid].name = screenName;
            $("#input-name").val('');
            // console.log("setScreenName:", obj);
            database.ref("/players").set(obj);
            setPlayerDisplay();
        }

        function setChallenger() {
            $.each(obj, function (key, val) {
                if (key !== uid) {
                    cid = key;
                    console.log("challenger:", cid);
                    return false;
                }
            });
            challengeName = obj[cid].name;
            console.log("Challenger:", challengeName, obj[cid]);
            setPlayerDisplay();
        }

        function setPlayerDisplay() {
            (screenName.length > 0) ? $("#player").text(screenName) : $("#player").text('');
            (challengeName.length > 0) ? $("#challenger").text(challengeName) : $("#challenger").text('');
            $("#pWin").text(winCnt);
            $("#pLoss").text(lossCnt);
            if (challengeName.length > 0) $("#cWin").text(obj[cid].win);
            if (challengeName.length > 0) $("#cLoss").text(obj[cid].loss);
        }




        /* ====================  PLAY GAME  ======================== */
        $("#submitRock").on("click", rock);
        $("#submitPaper").on("click", paper);
        $("#submitScissors").on("click", scissors);

        database.ref("/game").on("child_added", function (snap) {
            console.log("game", snap.val());
            if (snap.val() !== null) game_arr.push(snap.val());
            if (game_arr.length === 2) gamePlay();

        });

        function rock(e) {
            e.preventDefault();
            database.ref("/game").push({ id: uid, choice: "r" });
        }

        function paper(e) {
            e.preventDefault();
            database.ref("/game").push({ id: uid, choice: "p" });
        }

        function scissors(e) {
            e.preventDefault();
            database.ref("/game").push({ id: uid, choice: "s" });
        }

        function gamePlay() {
            pl = (game_arr[0].id === uid) ? game_arr[0].choice : game_arr[1].choice;
            ch = (game_arr[0].id !== uid) ? game_arr[0].choice : game_arr[1].choice;
            game_arr = [];
            database.ref("/game").set({});

            if (ch === pl) {
                tie();

            } else if (ch === 'r') {
                if (pl === 'p') {
                    win();
                } else {
                    var timer = setTimeout(loss, 500);
                }
            } else if (ch === 'p') {
                if (pl === 's') {
                    win();
                } else {
                    var timer = setTimeout(loss, 500);
                }
            } else if (ch === 's') {
                if (pl === 'r') {
                    win();
                } else {
                    var timer = setTimeout(loss, 500);
                }
            }

        }



        /* ====================  WINS & LOSSES  ======================== */

        function tie() {
            console.log("-----------------")
            console.log("IT'S A TIE")
            console.log("-----------------")

        }

        function win() {
            console.log("-----------------")
            console.log("YOU WIN")
            console.log("-----------------")
            winCnt++;
            obj[uid].win = winCnt;
            database.ref("/players").set(obj);
            setPlayerDisplay();
        }

        function loss() {
            console.log("-----------------")
            console.log("YOU LOSE")
            console.log("-----------------")
            clearTimeout(timer);
            lossCnt++;
            obj[uid].loss = lossCnt;
            database.ref("/players").set(obj);
            setPlayerDisplay();
        }


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
            $("#input-msg").val('');
            database.ref("/chat").push(obj);
        }

        //
        function updateChat(val) {

            //     var card = $("<div>").addClass("card w-100");
            //     card.append(`<div class="card-body">
            //     <h5 class="card-title">`+ val.name + ` says:</h5>
            //     <p class="card-text">`+ val.msg + `</p>
            //   </div>`);
            // Create an element
            var nameElement = $('<strong>').text(val.name);
            var messageElement = $('<li>').text(val.msg).prepend(nameElement);

            // Add the message to the DOM
            $("#msg-window").append(messageElement);

            // Scroll to the bottom of the message list
            messageList[0].scrollTop = messageList[0].scrollHeight;

            // $("#msg-window").append(card);
        }



        //
        //
        //end
    }


    var myGame = new RPSMultiPlayer();
    myGame.play();


});