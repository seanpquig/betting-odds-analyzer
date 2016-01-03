if (window.console) {
    console.log("Welcome to your Play application's JavaScript!");
}

// Functions to support drag and drop functionality
function allowDrop(ev) {
    ev.preventDefault();
}
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var nodeCopy = document.getElementById(data).cloneNode(true);
    nodeCopy.id = "newId";
    ev.target.appendChild(nodeCopy);
}

// Function for duplicating nodes
function multiplyNode(node, count, deep) {
    for (var i = 0, copy; i < count - 1; i++) {
        copy = node.cloneNode(deep);
        node.parentNode.insertBefore(copy, node);
    }
}
multiplyNode(document.querySelector('.bet'), 5, true);

// object to map event_name => event_id
var eventNameIdMap = {};

// On page-load => populate events drop down
$(document).ready(function() {
    var getEventsCall = jsRoutes.controllers.StatsDatabase.getEvents(1);
    $.getJSON(
        getEventsCall.url,
        function(data, textStatus, xhr) {
            if(textStatus == "success") {
                $.each(data, function(index, value) {
                    // Create datalist option
                    $("#events").append("<option value='" + value["name"] + "'></option>");
                    // Add item to event name to ID map
                    eventNameIdMap[value["name"]] = value["id"];
                });
            }
            if(textStatus == "error") {
                alert("Error getting events: " + xhr.status + ": " + xhr.statusText);
            }
        }
    );
});

// On event-selection => populate fights drop down
function populateFights(fightName) {
    var eventId = eventNameIdMap[fightName];
    console.log("in populateFights! " + eventId);
    var getFightsCall = jsRoutes.controllers.StatsDatabase.getFights(eventId);
    $.getJSON(
        getFightsCall.url,
        function(data, textStatus, xhr) {
            if(textStatus == "success") {
                // Clear original list
                $("#fights").empty();
                $.each(data, function(index, value) {
                     console.log("fight data: " + JSON.stringify(value));
                     createFightOption(value["id"]);
                });
            }
            if(textStatus == "error") {
                alert("Error getting fights: " + xhr.status + ": " + xhr.statusText);
            }
        }
    );
}
function createFightOption(fightId) {
    var getAthleteNamesCall = jsRoutes.controllers.StatsDatabase.getAthleteNames(fightId);
    $.getJSON(
        getAthleteNamesCall.url,
        function(data, textStatus, xhr) {
            if(textStatus == "success") {
                // Create datalist option
                $("#fights").append(
                    "<option value='" + data["athlete1"]+ " vs. " + data["athlete2"] + "'></option>"
                );
            }
            if(textStatus == "error") {
                alert("Error getting fights: " + xhr.status + ": " + xhr.statusText);
            }
        }
    );
}
