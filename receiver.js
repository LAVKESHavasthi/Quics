const offerTextArea = document.getElementById("offer");
const generateAnswerButton = document.getElementById("generate-answer");
const answerTextArea = document.getElementById("answer");

let peerConnection;

generateAnswerButton.addEventListener("click", async () => {
    if (!offerTextArea.value) {
        alert("Please paste the offer!");
        return;
    }

    const offer = JSON.parse(offerTextArea.value);
    peerConnection = new RTCPeerConnection();

    peerConnection.ondatachannel = (event) => {
        const receiveChannel = event.channel;
        receiveChannel.onmessage = (event) => {
            const blob = new Blob([event.data]);
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = "received_file";
            downloadLink.textContent = "Click to Download File";
            document.body.appendChild(downloadLink);
        };
    };

    peerConnection.onicecandidate = (event) => {
        if (peerConnection.localDescription) {
            answerTextArea.value = JSON.stringify(peerConnection.localDescription);
        }
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
});