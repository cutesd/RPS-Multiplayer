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
        var oL = 0;

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
            if (oL === 1) disObj = {};
            console.log(oL, disObj);
            if (snap.numChildren() === 2) {

            }

        });

        /* ====================  Player Setup  ======================== */
        $("#submitName").on("click", setScreenName);
        $("#submitWin").on("click", setWin);
        $("#submitLoss").on("click", setLoss);

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


        function setPlayerDisplay() {
            (screenName.length > 0) ? $("#player").text(screenName) : $("#player").text('');
            (challengeName.length > 0) ? $("#challenger").text(challengeName) : $("#challenger").text('');
            $("#pWin").text(obj[uid].win);
            $("#pLoss").text(obj[uid].loss);
            if (challengeName.length > 0) $("#cWin").text(obj[cid].win);
            if (challengeName.length > 0) $("#cLoss").text(obj[cid].loss);
        }


        /* ====================  WINS & LOSSES  ======================== */



        function setWin(e) {
            e.preventDefault();
            winCnt++;
            obj[uid].win = winCnt;
            database.ref("/players").set(obj);
            setPlayerDisplay();
        }

        function setLoss(e) {
            e.preventDefault();
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