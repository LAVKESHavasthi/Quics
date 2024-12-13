const fileInput = document.getElementById("file-input");
const generateOfferButton = document.getElementById("generate-offer");
const offerTextArea = document.getElementById("offer");
const answerTextArea = document.getElementById("answer");
const acceptAnswerButton = document.getElementById("accept-answer");

let peerConnection;
let dataChannel;
let uploadedFile;

generateOfferButton.addEventListener("click", async () => {
    if (!fileInput.files.length) {
        alert("Please select a file first!");
        return;
    }

    uploadedFile = fileInput.files[0];
    peerConnection = new RTCPeerConnection();

    dataChannel = peerConnection.createDataChannel("fileTransfer");
    dataChannel.onopen = () => console.log("Data channel open!");
    dataChannel.onmessage = (event) => console.log("Message received:", event.data);

    peerConnection.onicecandidate = (event) => {
        if (peerConnection.localDescription) {
            offerTextArea.value = JSON.stringify(peerConnection.localDescription);
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
});

acceptAnswerButton.addEventListener("click", async () => {
    if (!answerTextArea.value) {
        alert("Please paste the answer!");
        return;
    }

    const answer = JSON.parse(answerTextArea.value);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

    dataChannel.onopen = () => {
        const reader = new FileReader();
        reader.onload = () => dataChannel.send(reader.result);
        reader.readAsArrayBuffer(uploadedFile);
    };
});