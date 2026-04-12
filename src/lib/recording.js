let mediaRecorder = null
let audioChunks = []
let recognition = null
let fullTranscript = []

export const startRecording = (onTranscriptUpdate) => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // MediaRecorder for audio file
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
      mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      audioChunks = []
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data)
      }
      
      mediaRecorder.start(1000)

      // Web Speech API for live transcript
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        fullTranscript = []

        recognition.onresult = (event) => {
          let interim = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              fullTranscript.push(transcript)
              onTranscriptUpdate(fullTranscript.join(' '))
            } else {
              interim += transcript
            }
          }
        }

        recognition.onerror = (e) => console.log('Speech error:', e.error)
        recognition.start()
      }

      resolve(stream)
    } catch (err) {
      reject(err)
    }
  })
}

export const stopRecording = () => {
  return new Promise((resolve) => {
    if (recognition) {
      recognition.stop()
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const transcript = fullTranscript.join(' ')
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(t => t.stop())
        
        resolve({ audioBlob, transcript })
      }
      mediaRecorder.stop()
    } else {
      resolve({ audioBlob: null, transcript: fullTranscript.join(' ') })
    }
  })
}