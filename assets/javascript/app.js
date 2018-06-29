$(document).ready(function () {

    var RPSMultiPlayer = function () {

        var database, connectionsRef, connectedRef;
        var uid, cid;
        var setUp = true;
        var screenName = "";
        var challengeName = "";
        var winCnt = 0;
        var lossCnt = 0;
        var obj = {};
        var disObj = {};
        var game_arr = [];
        var oL = 0;
        var timer;
        var timer2;
        var wait = false;
        //
        var pOut = "";
        var cOut = "";

        var gameContainer = $("#game-container");

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
                            database.ref("/chat").set({});
                            $("#messages").empty();
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
            if (snap.numChildren() === 2 && wait) {
                checkIfGameReady();
            }

        });


        /* ============================================================ */
        /* =======================  VIEW  ============================= */
        /* ============================================================ */


        function setPlayerDisplay() {
            (screenName.length > 0) ? $("#playerName").text(screenName) : $("#playerName").text('');
            (challengeName.length > 0) ? $("#challengerName").text(challengeName) : $("#challengerName").text('');
            $("#pWin").text(winCnt);
            $("#pLoss").text(lossCnt);
            if (challengeName.length > 0) $("#cWin").text(obj[cid].win);
            if (challengeName.length > 0) $("#cLoss").text(obj[cid].loss);
            if (challengeName.length > 0) $("#cName").text(challengeName);
        }

        function checkIfGameReady() {
            if (screenName.length > 0 && challengeName.length > 0) {
                makeVis('wait', false);
                $("#welcome-msg").text("Sorry " + screenName);
                $("#wait").find('h4').text(challengeName + " has left the game.")
                makeVis('welcome', false);
                gameContainer.removeClass("justify-content-center");
                gameContainer.addClass("justify-content-between");
                consoleOut('gamestart');
                makeVis('game-play', true);

            } else if (screenName.length > 0) {
                makeVis('welcome', false);
                gameContainer.removeClass("justify-content-between");
                gameContainer.addClass("justify-content-center");
                $("#wait").find("img").attr("src", "https://media.giphy.com/media/" + getRndGif() + "/giphy.gif")
                makeVis('wait', true);
                makeVis('game-play', false);
            }
        }

        function consoleOut(val, out) {
            $("#console").empty();
            clearTimeout(timer);
            var div = $("<div>")

            //
            switch (val) {
                case 'gamestart':
                    div.append(`<h3>Welcome players</h3><p>Please make your selections</p>`);
                    break;
                case 'choicemade':
                    div.append(`<h3>Choice Made:</h3><p>` + out + ` has made their choice</p>`);
                    break;
                case 'allselected':
                    div.append(`<h3>Choices have been selected</h3>`);
                    timer = setTimeout(function () { consoleOut('ready') }, 1000);
                    break;
                case 'ready':
                    div.append(`<h3>Ready?</h3>`);
                    timer = setTimeout(function () { consoleOut('count1') }, 1000);
                    break;
                case 'count1':
                    div.append(`<h3>1</h3>`);
                    timer = setTimeout(function () { consoleOut('count2') }, 1000);
                    break;
                case 'count2':
                    div.append(`<h3>2</h3>`);
                    timer = setTimeout(function () { consoleOut('count3') }, 1000);
                    break;
                case 'count3':
                    div.append(`<h3>3</h3>`);
                    timer = setTimeout(function () { consoleOut('roch') }, 1000);
                    break;
                case 'roch':
                    div.append(`<h3>ROCHAMBEAU!!</h3>`);
                    timer = setTimeout(gamePlay, 1000);
                    break;
                case 'results':
                    div.append(`<h2>` + out + `</h2>`);

                    $("#cchoice-img").attr("src", "assets/images/" + cOut + ".png");
                    $("#cchoice-out").text(cOut);

                    setPlayerDisplay();
                    timer = setTimeout(function () { consoleOut('restart') }, 4000);
                    break;
                case 'restart':
                    pOut = cOut = "";
                    $("#pchoice-out").text('')
                    $("#cchoice-out").text('');
                    $("#pchoice-img").attr("src", "assets/images/q.jpg");
                    $("#cchoice-img").attr("src", "assets/images/q.jpg");

                    makeVis("btnContainer", true);
                    consoleOut('gamestart');
            }

            $("#console").append(div);
        }

        function getRPSval(choice) {
            switch (choice) {
                case "r":
                    return "rock";
                case "p":
                    return "paper";
                case "s":
                    return "scissors";
            }
        }

        function getRndGif() {
            var gif_arr = ["DfSLII45H40RW", "3rgXBvnbXtxwaWmhr2", "l0HUqsz2jdQYElRm0", "l0MYt5jPR6QX5pnqM", "6fScAIQR0P0xW"];
            var rnd = Math.floor(Math.random() * gif_arr.length);
            return gif_arr[rnd];
        }

        function makeVis(id, val) {
            if (val)
                $("#" + id).removeClass("d-none");
            else
                $("#" + id).addClass("d-none");
        }


        /* ============================================================ */
        /* ====================  PLAYER SETUP  ======================== */
        /* ============================================================ */


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
                console.log("challengeName:", challengeName);
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
            // 
            database.ref("/players").set(obj);
            $("#welcome-msg").text("Welcome " + screenName);
            $(".chat-icon").removeClass("d-none");
            setPlayerDisplay();
            checkIfGameReady();
        }

        function setChallenger() {
            $.each(obj, function (key, val) {
                if (key !== uid) {
                    cid = key;
                    console.log("challenger:", cid);
                    return false;
                }
            });
            if (obj[cid]) challengeName = obj[cid].name;
            console.log("Challenger:", challengeName, obj[cid]);
            setPlayerDisplay();
            checkIfGameReady();
        }


        /* ============================================================ */
        /* =======================  PLAY GAME  ======================== */
        /* ============================================================ */


        $("#submitRock").on("click", rock);
        $("#submitPaper").on("click", paper);
        $("#submitScissors").on("click", scissors);

        database.ref("/game").on("child_added", function (snap) {
            console.log("game", snap.val());
            if (snap.val() !== null) {
                game_arr.push(snap.val());
                consoleOut("choicemade", game_arr[0].name);
            };
            if (game_arr.length === 2) consoleOut("allselected");

        });

        function rock(e) {
            e.preventDefault();
            makeVis("btnContainer", false);
            //
            $("#pchoice-img").attr('src', "assets/images/rock.png");
            $("#pchoice-out").text("rock");

            database.ref("/game").push({ name: screenName, id: uid, choice: "r" });
        }

        function paper(e) {
            e.preventDefault();
            makeVis("btnContainer", false);
            //
            $("#pchoice-img").attr('src', "assets/images/paper.png");
            $("#pchoice-out").text("paper");

            database.ref("/game").push({ name: screenName, id: uid, choice: "p" });
        }

        function scissors(e) {
            e.preventDefault();
            makeVis("btnContainer", false);
            $("#pchoice-img").attr('src', "assets/images/scissors.png");
            $("#pchoice-out").text("scissors");

            database.ref("/game").push({ name: screenName, id: uid, choice: "s" });
        }

        function gamePlay() {
            pl = (game_arr[0].id === uid) ? game_arr[0].choice : game_arr[1].choice;
            ch = (game_arr[0].id !== uid) ? game_arr[0].choice : game_arr[1].choice;
            pOut = (game_arr[0].id === uid) ? getRPSval(game_arr[0].choice) : getRPSval(game_arr[1].choice);
            cOut = (game_arr[0].id !== uid) ? getRPSval(game_arr[0].choice) : getRPSval(game_arr[1].choice);

            game_arr = [];
            database.ref("/game").set({});

            if (ch === pl) {
                tie();

            } else if (ch === 'r') {
                if (pl === 'p') {
                    win();
                } else {
                    timer2 = setTimeout(loss, 500);
                }
            } else if (ch === 'p') {
                if (pl === 's') {
                    win();
                } else {
                    timer2 = setTimeout(loss, 500);
                }
            } else if (ch === 's') {
                if (pl === 'r') {
                    win();
                } else {
                    timer2 = setTimeout(loss, 500);
                }
            }

        }


        /* ============================================================ */
        /* ====================  WINS & LOSSES  ======================= */
        /* ============================================================ */

        function tie() {
            console.log("-----------------")
            console.log("IT'S A TIE")
            console.log("-----------------")
            timer = setTimeout(function () {
                consoleOut('results', "TIE GAME")
            }, 500)
        }

        function win() {
            console.log("-----------------")
            console.log("YOU WIN")
            console.log("-----------------")
            winCnt++;
            obj[uid].win = winCnt;
            database.ref("/players").set(obj);
            timer = setTimeout(function () {
                consoleOut('results', "YOU WON!!")
            }, 750)
        }

        function loss() {
            clearTimeout(timer2);
            console.log("-----------------")
            console.log("YOU LOSE")
            console.log("-----------------")
            clearTimeout(timer);
            lossCnt++;
            obj[uid].loss = lossCnt;
            database.ref("/players").set(obj);

            timer = setTimeout(function () {
                consoleOut('results', "YOU LOST.")
            }, 750)
        }

        /* ============================================================ */
        /* ========================  CHAT  ============================ */
        /* ============================================================ */

        $(".chat-icon").on("click", showMessageWindow);
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

        function showMessageWindow(e) {
            e.preventDefault();
            if ($("#msg-window").hasClass("d-none")) {
                makeVis("msg-window", true);
            } else {
                makeVis("msg-window", false);
            }
        }

        //
        function updateChat(val) {

            // Create an element
            var messageList = $('#messages');
            var nameElement = $('<strong>').text(val.name);
            var messageElement = $('<li>').text(val.msg).prepend(nameElement);

            // Add the message to the DOM
            $("#messages").append(messageElement);

            // Scroll to the bottom of the message list
            messageList[0].scrollTop = messageList[0].scrollHeight;

        }



        //
        //
        //end
    }


    var myGame = new RPSMultiPlayer();
    myGame.play();


});