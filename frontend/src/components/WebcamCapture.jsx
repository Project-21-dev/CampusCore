import React, { useEffect, useRef, useState } from 'react'

const WebcamCapture = ({ onCapture, buttonText = 'Capture', disabled = false }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        })
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch (err) {
        console.error('Camera error:', err)
        setError('Camera access failed. Allow camera permission and use localhost or HTTPS.')
      }
    }

    startCamera()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const capture = () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `face-${Date.now()}.jpg`, { type: 'image/jpeg' })
      onCapture(file)
    }, 'image/jpeg', 0.9)
  }

  return (
    <div>
      {error ? (
        <div className="alert alert-danger mb-0">{error}</div>
      ) : (
        <>
          <div className="ratio ratio-4x3 bg-dark rounded overflow-hidden mb-3" style={{ maxWidth: 520 }}>
            <video ref={videoRef} muted playsInline className="w-100 h-100 object-fit-cover" />
          </div>
          <canvas ref={canvasRef} className="d-none" />
          <button
            type="button"
            className="btn btn-primary"
            onClick={capture}
            disabled={!cameraReady || disabled}
          >
            <i className="bi bi-camera-fill me-2"></i>{buttonText}
          </button>
        </>
      )}
    </div>
  )
}

export default WebcamCapture
