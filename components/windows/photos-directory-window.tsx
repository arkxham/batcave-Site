"use client"

import DraggableWindow from "@/components/windows/draggable-window"

interface PhotosDirectoryWindowProps {
  onClose: () => void
  onPhotoSelect: (photoUrl: string, photoName: string) => void
}

export default function PhotosDirectoryWindow({ onClose, onPhotoSelect }: PhotosDirectoryWindowProps) {
  const photoCategories = [
    {
      name: "Backgrounds",
      photos: [
        { url: "/Photos/Default-Batman.jpg", name: "Batman" },
        { url: "/Photos/badbih.png", name: "Joker" },
        { url: "/Photos/Forest.png", name: "Forest" },
        { url: "/Photos/batman4.jpg", name: "Gotham" },
      ],
    },
    {
      name: "Portraits",
      photos: [
        { url: "/Photos/randal.jpg", name: "Randal" },
        { url: "/Photos/fynshi.jpg", name: "Batmobile" },
        { url: "/Photos/N333MO.jpg", name: "N333MO" },
        { url: "/Photos/Blattt.jpg", name: "Blatt" },
      ],
    },
    {
      name: "Artwork",
      photos: [
        { url: "/Photos/n333mo-tripout.gif", name: "Tripout" },
        { url: "/Photos/zebra.png", name: "Zebra" },
        { url: "/Photos/LOSSAVEUS.png", name: "Los Save Us" },
        { url: "/Photos/BadBihBeat.jpg", name: "Bad Bih Beat" },
      ],
    },
  ]

  return (
    <DraggableWindow
      title="Photos Directory"
      onClose={onClose}
      className="window bg-[rgba(51,51,51,0.95)] rounded-lg shadow-lg w-[600px] min-h-[400px] backdrop-blur-[10px] text-white z-100"
      defaultPosition={{ x: 200, y: 100 }}
    >
      <div className="window-content p-4 max-h-[500px] overflow-y-auto">
        {photoCategories.map((category) => (
          <div key={category.name} className="mb-6">
            <h3 className="text-lg font-medium mb-3 border-b border-white/20 pb-2">{category.name}</h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
              {category.photos.map((photo) => (
                <div
                  key={photo.name}
                  className="photo-item flex flex-col items-center cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-all"
                  onClick={() => onPhotoSelect(photo.url, photo.name)}
                >
                  <div className="photo-thumbnail w-full aspect-square mb-2 overflow-hidden rounded-md border border-white/20">
                    <img
                      src={photo.url || "/placeholder.svg"}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="photo-name text-sm text-center">{photo.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DraggableWindow>
  )
}
