const fetch = require('node-fetch');
let bloxlink = 0;
let rover = 0;

exports.bloxlink = async (id) => {
    if(bloxlink > 60){
        return {
            msg: 'ratelimited',
        }
    } else {
        bloxlink = bloxlink + 1;
        let bloxlinkresponse = await fetch(`https://api.blox.link/v1/user/${id}`);
        bloxlinkresponse = bloxlinkresponse.json();
        if(bloxlinkresponse.status == 'error') return {
            msg: 'notfound'
        }
        return {
            msg: 'ok',
            id: bloxlinkresponse.primaryAccount
        }
    }
}

exports.rover = async (id) => {
    if(rover > 60){
        return {
            msg: 'ratelimited',
        }
    } else {
        rover = rover + 1;
        let roverresponse = await fetch(`https://verify.eryn.io/api/user/${id}`);
        roverresponse = roverresponse.json();
        if(roverresponse.status == 'error') return {
            msg: 'notfound'
        }
        return {
            msg: 'ok',
            id: roverresponse.robloxId
        }
    }
}

async function refresh(){
    bloxlink = 0;
    rover = 0;
    setTimeout(async () => {
        refresh();
    }, 60000);
}
refresh();
