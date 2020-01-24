const CLIENT_ID = "948161134799-eustqueraeda8tc089es52rd7ju7dc20.apps.googleusercontent.com";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';
const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const context = document.getElementById('context');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');
const defaultChannel = 'hiteshitube';

//Form Submit and get data
channelForm.addEventListener('submit', e=>{
    e.preventDefault();

    const channel = channelInput.value;
    getChannel(channel);
});


//Load Auth2 Library
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        content.style.display = 'block';
        videoContainer.style.display = 'block';
        getChannel(defaultChannel);
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        content.style.display = 'none';
        videoContainer.style.display = 'none';
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}
//Display Channel Data
function showChannelData(data){
    const channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
}
//Get Channel Details from API
function getChannel(channel) {
    // console.log(channel);
    gapi.client.youtube.channels.list({
        part: 'snippet,contentDetails,statistics',
        forUsername: channel
    }).then(response => {
        console.log(response);
        const channel = response.result.items[0];
        const output = `
            <ul class="collection">
                <li>Title: ${channel.snippet.title}</li>
                <li>ID: ${channel.id}</li>
                <li>Subscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
                <li>Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
                <li>Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
                <li>Country: ${channel.snippet.country}</li>
            </ul>
            <p>${channel.snippet.description}</p>
            <hr>
            <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
        `;
        showChannelData(output);
        const playlistId = channel.contentDetails.relatedPlaylists.uploads;
        requestVideoPlaylist(playlistId);
    }).catch(err => alert("No Channel with this name"));

}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
//Load Latest Videos down here
function requestVideoPlaylist(playlistId){
    const requestOptions = {
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 10
    }
    const request = gapi.client.youtube.playlistItems.list(requestOptions);
    //execution
    request.execute(response =>{
        console.log(response);
        const playlistItems = response.result.items;
        if(playlistItems){
            let output = '<br><h4 class="center-align">Latest Videos</h4>';
            //Looping through videos and append output
            playlistItems.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;
                output += `
                <div class="col s3">
                <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; 
                picture-in-picture" allowfullscreen></iframe>
                </div>
                `
            });
            //Output videos
            videoContainer.innerHTML = output;
        } else{
            videoContainer.innerHTML = 'No Uploaded Videos'
        }
    });
}