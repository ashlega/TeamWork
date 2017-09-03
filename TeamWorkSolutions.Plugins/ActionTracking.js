var TW = TW || {};

TW.ActionTracking = {

    NOTIFICATIONLEVEL: "INFO",
    NOTIFICATIONID: "951723",
    NOTIFICATIONMESSAGE: "There are other users looking at this record",

    ACTION_TYPE: {
        OPEN: 1,
        UPDATE: 2,
        DELETE: 3
    },

    TrackingInterval: 60000,

    Init: function () {
        
        if (typeof Xrm == "undefined" || Xrm == null || typeof Xrm.Page == "undefined" || Xrm.Page == null) {
            setTimeout(function () { TW.ActionTracking.Init(); }, 200);
        }
        else {
            if (Xrm.Page.ui.getFormType() != 1) {
                TW.ActionTracking.Tick();
            }
        }
        
    },

    Tick: function ()
    {
        TW.ActionTracking.RecordAction("OPEN", TW.ActionTracking.ACTION_TYPE.OPEN);
        TW.ActionTracking.CheckIfOpened();
        setTimeout(TW.ActionTracking.Tick, TW.ActionTracking.TrackingInterval);
    },

    RecordAction: function(actionName, actionCode)
    {
        var req = new XMLHttpRequest();
        req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/team_actiontrackers", true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status != 200 && this.status != 204) {
                    Xrm.Utility.alertDialog("Action tracking error: " + this.statusText);
                }
            }
        };
        var action = {};
        action["team_actionname"] = actionName;
        action["team_actioncode"] = actionCode;
        action["team_recordid"] = Xrm.Page.data.entity.getId();
        action["team_User@odata.bind"] = "/systemusers(" + Xrm.Page.context.getUserId().replace("{", "").replace("}", "") + ")";
        req.send(JSON.stringify(action));
    },

    CheckIfOpened: function()
    {
        var req = new XMLHttpRequest();
        var filter = '$filter=contains(team_recordid, (' + Xrm.Page.data.entity.getId() + ')) and _team_user_value ne ' + Xrm.Page.context.getUserId().replace("{", "").replace("}", "");
        debugger;
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/team_actiontrackers?"+filter, true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    debugger;
                    var result = JSON.parse(this.response);
                    if(result.value.length > 0)
                    {
                        Xrm.Page.ui.setFormNotification(TW.ActionTracking.NOTIFICATIONMESSAGE, TW.ActionTracking.NOTIFICATIONLEVEL, TW.ActionTracking.NOTIFICATIONID);
                    }
                    else
                    {
                        Xrm.Page.ui.clearFormNotification(TW.ActionTracking.NOTIFICATIONID);
                    }
                } else {
                    Xrm.Utility.alertDialog("Action tracking error: " + this.statusText);
                }
            }
        };
        req.send();
    }
    
};

TW.ActionTracking.Init();