const fileInput = document.getElementById("file-input");
const generateLinkButton = document.getElementById("generate-link");
const shareLink = document.getElementById("share-link");

let peerConnection;
let dataChannel;
let uploadedFile;

generateLinkButton.addEventListener("click", async () => {
    if (!fileInput.files.length) {
        alert("Please select a file first!");
        return;
    }

    // Store the uploaded file
    uploadedFile = fileInput.files[0];

    // Create a peer connection
    peerConnection = new RTCPeerConnection();
    dataChannel = peerConnection.createDataChannel("fileTransfer");

    dataChannel.onopen = () => console.log("Data channel open!");
    dataChannel.onclose = () => console.log("Data channel closed!");

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            shareLink.value = `${window.location.origin}/share.html?offer=${btoa(JSON.stringify(peerConnection.localDescription))}`;
        }
    };

    // Create and set the offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    console.log("Offer created:", offer);
});

if (window.location.pathname.includes("share.html")) {
    const params = new URLSearchParams(window.location.search);
    const offer = params.get("offer");

    if (offer) {
        (async () => {
            // Create peer connection
            peerConnection = new RTCPeerConnection();

            // Handle incoming data channel
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

            // Set remote description and create answer
            await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(offer))));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            console.log("Answer sent:", answer);
        })();
    }
}

// Send the file
if (dataChannel) {
    const reader = new FileReader();
    reader.onload = () => dataChannel.send(reader.result);
    reader.readAsArrayBuffer(uploadedFile);
}