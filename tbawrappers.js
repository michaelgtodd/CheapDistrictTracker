// JavaScript source code

var TBABaseURL = "https://www.thebluealliance.com/api/v3";
var APIKey = "hz6ZmXLIT0HRbox8r4GkQCZ0q1SpDGYcVnwlXpeG5fqkkdKd4LpCHt4WWRJ8MCP0";
var detroiteventlist = [
    { name: "Curie", id: "cur" },
    { name: "Carson", id: "cars" },
    { name: "Archimedes", id: "arc" },
    { name: "Daly", id: "dal" },
    { name: "Darwin", id: "dar" },
    { name: "Tesla", id: "tes" }];

function test(p1) {
    console.log(p1);
}

function getDistricts(callback) {
    var APICall = TBABaseURL + "/districts/2018";
    var data = $.getJSON
        (APICall,
        {
            "X-TBA-Auth-Key": APIKey
        },
        callback);
}

function getDistrictTeams(districtkey, callback) {
    var APICall = TBABaseURL + "/district/" + year + districtkey + "/teams/simple";
    var data = $.getJSON
        (APICall,
        {
            "X-TBA-Auth-Key": APIKey
        },
        callback);
}

function getTeamsAtEvent(eventkey, callback) {
    var APICall = TBABaseURL + "/event/" + eventkey + "/teams/simple";
    var data = $.getJSON
        (APICall,
        {
            "X-TBA-Auth-Key": APIKey
        },
        callback);
}

function getEventRankings(eventkey, callback) {
    var APICall = TBABaseURL + "/event/" + eventkey + "/rankings";
    var data = $.getJSON
        (APICall,
        {
            "X-TBA-Auth-Key": APIKey
        },
        callback);
}

function getEventOPRs(eventkey, callback) {
    var APICall = TBABaseURL + "/event/" + eventkey + "/oprs";
    var data = $.getJSON
        (APICall,
        {
            "X-TBA-Auth-Key": APIKey
        },
        callback);
}

function filterteamlist(teamlist1, teamlist2, eventname) {
    var matchingteams = [];
    $.each(teamlist1, function (index, element) {
        $.each(teamlist2, function (index2, element2) {
            if (element.key == element2.key) {
                var newteam = element2;
                newteam.division = eventname
                matchingteams.push(element2);
            }
        });
    });
    return matchingteams;
}

function processFilterTeamsAttendingEvents(matchingteams, eventlist, teamlist, year, callback) {
    if (eventlist[0]) {
        var activeevent = eventlist[0];
        eventlist.splice(0, 1);
        console.log("Processing event: " + year + activeevent.id);
        getTeamsAtEvent(year + activeevent.id, function (data) {
            matchingteams = matchingteams.concat(filterteamlist(teamlist, data, activeevent.name));
            processFilterTeamsAttendingEvents(matchingteams, eventlist, teamlist, year, callback);
        });
    }
    else {
        console.log("Done processing events.");
        callback(matchingteams);
    }
}

function filterteamsattendingevents(eventlist, teamlist, year, callback) {
    processFilterTeamsAttendingEvents([], eventlist, teamlist, year, callback);
}

function AddRankingToTeamObjects(rankingdata, teamlist) {
    if (rankingdata.rankings != null) {
        $.each(teamlist, function (index, element) {
            $.each(rankingdata.rankings, function (index2, element2) {
                if (element.key == element2.team_key) {
                    element.ranking = element2.rank;
                    element.averagerp = element2.sort_orders[0];
                }
            });
        });
    }
    return teamlist;
}

function processAddRankingToTeam(eventlist, teamlist, year, callback) {
    if (eventlist[0]) {
        var activeevent = eventlist[0];
        eventlist.splice(0, 1);
        console.log("Processing event rankings: " + year + activeevent.id);
        getEventRankings(year + activeevent.id, function (data) {
            augmentedteamlist = AddRankingToTeamObjects(data, teamlist);
            processAddRankingToTeam(eventlist, augmentedteamlist, year, callback);
        });
    }
    else {
        console.log("Done processing event rankings.");
        callback(teamlist);
    }
}

function addRankingToTeam(eventlist, teamlist, year, callback) {
    processAddRankingToTeam(eventlist, teamlist, year, callback);
}

function AddOPRToTeamObjects(rankingdata, teamlist) {
    if (rankingdata != null) {
        if (rankingdata.oprs != null) {
            $.each(teamlist, function (index, element) {
                var attr = $(rankingdata.oprs).attr(element.key);
                if (typeof attr !== typeof undefined && attr !== false) {
                    element.opr = attr;
                }
            });
        }
    }
    return teamlist;
}

function processAddOPRToTeam(eventlist, teamlist, year, callback) {
    if (eventlist[0]) {
        var activeevent = eventlist[0];
        eventlist.splice(0, 1);
        console.log("Processing event OPRS: " + year + activeevent.id);
        getEventOPRs(year + activeevent.id, function (data) {
            augmentedteamlist = AddOPRToTeamObjects(data, teamlist);
            processAddOPRToTeam(eventlist, augmentedteamlist, year, callback);
        });
    }
    else {
        console.log("Done processing event OPRs.");
        callback(teamlist);
    }
}

function addOPRToTeam(eventlist, teamlist, year, callback) {
    processAddOPRToTeam(eventlist, teamlist, year, callback);
}

function DistrictTeamsAtDetroitStage3(districtteamdata, year, callback) {
    var eventlist = detroiteventlist.slice(0);
    addOPRToTeam(eventlist, districtteamdata, year, function (data) {
        callback(data);
    });
}

function DistrictTeamsAtDetroitStage2(districtteamdata, year, callback) {
    var eventlist = detroiteventlist.slice(0);
    addRankingToTeam(eventlist, districtteamdata, year, function (data) {
        DistrictTeamsAtDetroitStage3(data, year, callback);
    });
}

function DistrictTeamsAtDetroitStage1(districtteamdata, year, callback) {
    var eventlist = detroiteventlist.slice(0);
    filterteamsattendingevents(eventlist, districtteamdata, year, function (data) {
        DistrictTeamsAtDetroitStage2(data, year, callback);
    });
}

function getDistrictTeamsAtDetroit(districtkey, year, callback) {
    getDistrictTeams(districtkey, function (data) { DistrictTeamsAtDetroitStage1(data, year, callback);});
}
