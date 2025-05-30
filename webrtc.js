let pc;
let dataChannel;

// إعدادات الاتصال مع خادم STUN
const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

// الطرف المرسل ينشئ الاتصال ويعرض الـ Offer
async function startSender() {
  pc = new RTCPeerConnection(configuration);

  dataChannel = pc.createDataChannel("fileChannel");

  dataChannel.onopen = () => {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        console.log("⏳ جاري إرسال الملف...");
        dataChannel.send(reader.result);
        alert("✅ تم إرسال الملف!");
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("⚠️ لم تختر أي ملف!");
    }
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("مرشح ICE جديد:", event.candidate);
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  document.getElementById("textArea1").value = JSON.stringify(pc.localDescription);
  console.log("✅ تم إنشاء الـ Offer");
}

// الطرف المستقبل ينتظر الاتصال ويستلم الملف
async function startReceiver() {
  pc = new RTCPeerConnection(configuration);

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

      alert("✅ تم استلام الملف بنجاح! يمكنك تحميله بالضغط على الرابط.");
      console.log("✅ تم استلام الملف بنجاح");
    };
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("مرشح ICE جديد:", event.candidate);
    }
  };

  try {
    const offer = JSON.parse(document.getElementById("textArea1").value);
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    document.getElementById("textArea2").value = JSON.stringify(pc.localDescription);
    console.log("✅ تم إنشاء الـ Answer");
  } catch (e) {
    alert("❌ حدث خطأ في قراءة الـ Offer أو إنشائه: " + e);
    console.error(e);
  }
}

// بعد توليد الـ Answer من المستقبل، يضعه المرسل هنا لإكمال الاتصال
async function setRemote() {
  try {
    const answer = JSON.parse(document.getElementById("textArea2").value);
    await pc.setRemoteDescription(answer);
    alert("✅ تم ضبط الوصف البعيد (Answer) بنجاح. الاتصال الآن جاهز.");
    console.log("✅ تم ضبط الوصف البعيد (Answer) بنجاح.");
  } catch (e) {
    alert("❌ حدث خطأ في ضبط الوصف البعيد: " + e);
    console.error("خطأ في ضبط الوصف البعيد:", e);
  }
}




// i_hello_0





