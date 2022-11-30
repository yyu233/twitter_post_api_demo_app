console.log("Client side code runninng");

function request_authorize() {
    console.log("post tweet button is clicked");
    fetch('/request_authorize', {method: 'GET'})
    .then(function(res) {
        if (res.ok) {
        console.log('post tweet request sent succesfully');
        return;
    }
    throw new Error('post tweet request failed');
    })
    .catch(function(error) {
        console.log(error);
    });
};

function submit_pin() {
    console.log("submit pin button is clicked");
    const PIN = document.getElementById("pin").value;
    console.log(PIN);
    const pinObj = {pin: PIN};
    fetch('/submit_pin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pinObj)
    })
    .then(function(res) {
        if (res.ok) {
        console.log('POST PIN request is sent succesfully');
        return;
    }
    throw new Error('POST PIN request failed');
    })
    .catch(function(error) {
        console.log(error);
    });
};
