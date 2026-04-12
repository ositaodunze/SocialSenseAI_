const ASSEMBLYAI_KEY = import.meta.env.VITE_ASSEMBLYAI_KEY

export const analyzeSentiment = async (audioBlob, transcript) => {
  try {
    // Convert blob to buffer so it can be read multiple times
    const arrayBuffer = await audioBlob.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload audio
    const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: { authorization: ASSEMBLYAI_KEY },
      body: buffer,
    })
    const uploadData = await uploadRes.json()
    console.log("Upload response:", uploadData)
    const { upload_url } = uploadData

    // Request transcription with speaker diarization
    const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        speech_models: ["universal-2"],
        speaker_labels: true,
        speakers_expected: 2,
        sentiment_analysis: true,
        }),
    })
    const transcriptData = await transcriptRes.json()
    console.log("Transcript response:", transcriptData)
    const { id } = transcriptData

    // Poll for results
    let result
    while (true) {
      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: { authorization: ASSEMBLYAI_KEY },
      })
      result = await pollRes.json()
      if (result.status === 'completed' || result.status === 'error') break
      await new Promise(r => setTimeout(r, 2000))
    }

    if (result.status === 'error') throw new Error(result.error)
    console.log("Status:", result.status)
    console.log("Utterances:", result.utterances)

    // Build speaker turns from utterances
    const utterances = result.utterances || []
    const speakers = [...new Set(utterances.map(u => u.speaker))]

    const speakerMap = {
      [speakers[0]]: "Me",
      [speakers[1]]: "Aaliyah",
    }

    const turns = utterances.map(u => ({
      who: speakerMap[u.speaker] || u.speaker,
      text: u.text,
      time: formatTime(u.start),
      confidence: u.confidence,
    }))

    // Sentiment score
    const sentiments = result.sentiment_analysis_results || []
    const score = sentiments.length
      ? sentiments.reduce((sum, s) => {
          const val = s.sentiment === 'POSITIVE' ? 1 : s.sentiment === 'NEGATIVE' ? -1 : 0
          return sum + val * s.confidence
        }, 0) / sentiments.length
      : 0

    return {
      transcript: result.text || transcript,
      turns,
      sentiment_score: score,
    }
  } catch (err) {
    console.error('Analysis failed:', err)
    return {
      transcript,
      turns: [],
      sentiment_score: 0,
    }
  }
}

const formatTime = (ms) => {
  const totalSecs = Math.floor(ms / 1000)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${mins}:${String(secs).padStart(2, "0")}`
}