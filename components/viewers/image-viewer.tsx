"use client"

interface ImageViewerProps {
  fileName: string
  imageUrl: string
  onClose: () => void
}

export default function ImageViewer({ fileName, imageUrl, onClose }: ImageViewerProps) {
  // Map file names to actual image paths
  const imageMap: Record<string, string> = {
    "tripout.gif": "/Photos/n333mo-tripout.gif",
    "family_photo.jpg": "/Photos/randal.jpg",
    "batmobile.png": "/Photos/fynshi.jpg",
    "zebra.png": "/Photos/zebra.png",
    "N333MO.png": "/Photos/N333MO.jpg",
    "LOSSAVE.png": "/Photos/LOSSAVEUS.png",
    "Blat.png": "/Photos/Blattt.jpg",
    "Dawg.png": "/Photos/Dawg.jpg",
    "OneOfDem.png": "/Photos/JustOneOfDem.jpg",
    "DownyTwo.png": "/Photos/Downy.jpg",
    "BadBihBeat.png": "/Photos/BadBihBeat.jpg",
  }

  const src = imageMap[fileName] || imageUrl || "/placeholder.svg"

  return (
    <div className="image-viewer fixed top-0 left-0 w-full h-full bg-black/90 flex justify-center items-center z-[2000] flex-col">
      <button
        className="close-image absolute top-5 right-5 text-white bg-black/50 border-none w-10 h-10 rounded-full text-xl cursor-pointer flex items-center justify-center"
        onClick={onClose}
      >
        &times;
      </button>

      <div className="image-container relative max-w-[90%] max-h-[80%]">
        <img
          src={src || "/placeholder.svg"}
          alt={fileName}
          className="max-w-full max-h-[80vh] object-contain border-2 border-[#444] shadow-lg"
        />
      </div>

      <div className="image-title text-white mt-5 text-lg">{fileName}</div>
    </div>
  )
}
