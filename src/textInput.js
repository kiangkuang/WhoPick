import Machina from "machina";

export default new Machina.BehavioralFsm({
    namespace: "textInput",
    initialState: "none",

    states: {
        none: {
            "/start": function(client) {
                client.isNew = true;
                this.transition(client, "addQuestion");
            },
            "/addQuestion": function(client) {
                client.isNew = false;
                this.transition(client, "addQuestion");
            },
            "/addChoice": function(client) {
                this.transition(client, "addChoice");
            },
            "/editQuestion": function(client) {
                this.transition(client, "editQuestion");
            },
            "/editChoice": function(client) {
                this.transition(client, "editChoice");
            },
            "*": function(client, msg) {
                console.log(msg);
            }
        },
        addQuestion: {
            _onEnter: function(client) {
                console.log("send add qn instruction");
            },
            "*": function(client, msg) {
                console.log(msg);
                console.log("qn added\n");
                if (client.isNew) {
                    client.isNew = false;
                    this.transition(client, "addChoice");
                } else {
                    this.transition(client, "showPoll");
                }
            }
        },
        addChoice: {
            _onEnter: function(client) {
                console.log("send add choice instruction");
            },
            "/done": function(client) {
                console.log("send poll created msg");
                this.transition(client, "showPoll");
            },
            "*": function(client, msg) {
                console.log(msg);
                console.log("choice added\n");
                this.transition(client, "addChoice");
            }
        },
        editQuestion: {
            _onEnter: function(client) {
                console.log("send edit qn instruction");
            },
            "*": function(client, msg) {
                console.log(msg);
                console.log("qn edited\n");
                this.transition(client, "showPoll");
            }
        },
        editChoice: {
            _onEnter: function(client) {
                console.log("send edit choice instruction");
            },
            "*": function(client, msg) {
                console.log(msg);
                console.log("choice edited\n");
                this.transition(client, "showPoll");
            }
        },
        showPoll: {
            _onEnter: function(client) {
                console.log("show poll");
                this.transition(client, "none");
            }
        }
    }
});
