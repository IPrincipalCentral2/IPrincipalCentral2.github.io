let pc;
let dataChannel;

// الطرف المرسل ينشئ الاتصال ويعرض الـ Offer
async function startSender() {
  pc = new RTCPeerConnection();
  dataChannel = pc.createDataChannel("fileChannel");

  dataChannel.onopen = () => {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        dataChannel.send(reader.result);
        alert("✅ تم إرسال الملف!");
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  document.getElementById("textArea1").value = JSON.stringify(pc.localDescription);
}

// الطرف المستقبل ينتظر الاتصال ويستلم الملف
async function startReceiver() {
  pc = new RTCPeerConnection();
  pc.ondatachannel = (event) => {
    dataChannel = event.channel;
    dataChannel.onmessage = (event) => {
      const blob = new Blob([event.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "received_file";
      a.textContent = "📥 تحميل الملف";
      document.getElementById("download").appendChild(a);
    };
  };

  const offer = JSON.parse(document.getElementById("textArea1").value);
  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  document.getElementById("textArea2").value = JSON.stringify(pc.localDescription);
}

// بعد توليد الـ Answer من المستقبل، يضعه المرسل هنا لإكمال الاتصال
async function setRemote() {
  const answer = JSON.parse(document.getElementById("textArea2").value);
  await pc.setRemoteDescription(answer);
}
