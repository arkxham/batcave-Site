"use client"
import { useAudio } from "@/context/audio-context"

export default function NotificationCenter() {
  const { notifications, removeNotification } = useAudio()

  return (
    <div className="notification-center absolute top-0 right-0 w-[300px] max-h-screen overflow-y-auto flex flex-col gap-2.5 p-2.5 z-[1000] pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="notification bg-[rgba(40,40,40,0.9)] rounded-lg p-4 text-white shadow-lg backdrop-blur animate-[slideIn_0.3s_ease-out] pointer-events-auto border-l-[3px] border-[#0078d7] relative origin-top-right"
        >
          <div className="notification-icon absolute top-4 left-4 text-xl">{notification.icon}</div>
          <div className="notification-content ml-8">
            <div className="notification-title font-bold mb-1 flex justify-between items-center">
              {notification.title}
              <button
                className="notification-close bg-none border-none text-[#ccc] cursor-pointer text-base p-0 w-auto"
                onClick={() => removeNotification(notification.id)}
              >
                &times;
              </button>
            </div>
            <div className="notification-message text-sm">{notification.message}</div>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
