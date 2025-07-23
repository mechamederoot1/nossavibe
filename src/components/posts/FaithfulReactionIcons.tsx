import React from "react";

// Ícones de reação fiéis ao Facebook original
export const faithfulReactionIcons = {
  like: ({ size = 20, className = "" }: { size?: number; className?: string }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"
        fill="#4F46E5"
      />
    </svg>
  ),

  love: ({ size = 20, className = "" }: { size?: number; className?: string }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
        fill="#EF4444"
      />
    </svg>
  ),

  haha: ({ size = 20, className = "" }: { size?: number; className?: string }) => (
    <div
      className={`${className} flex items-center justify-center rounded-full bg-yellow-500 text-white`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      😂
    </div>
  ),

  wow: ({ size = 20, className = "" }: { size?: number; className?: string }) => (
    <div
      className={`${className} flex items-center justify-center rounded-full bg-yellow-500 text-white`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      😮
    </div>
  ),

  sad: ({ size = 20, className = "" }: { size?: number; className?: string }) => (
    <div
      className={`${className} flex items-center justify-center rounded-full bg-yellow-500 text-white`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      😢
    </div>
  ),

  angry: ({ size = 20, className = "" }: { size?: number; className?: string }) => (
    <div
      className={`${className} flex items-center justify-center rounded-full bg-red-500 text-white`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      😡
    </div>
  ),

  care: ({ size = 20, className = "" }: { size?: number; className?: string }) => (
    <div
      className={`${className} flex items-center justify-center rounded-full bg-yellow-500 text-white`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      ��
    </div>
  ),

  pride: ({ size = 20, className = "" }: { size?: number; className?: string }) => (
    <div
      className={`${className} flex items-center justify-center rounded-full bg-purple-500 text-white`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      🏳️‍🌈
    </div>
  ),

  grateful: ({ size = 20, className = "" }: { size?: number; className?: string }) => (
    <div
      className={`${className} flex items-center justify-center rounded-full bg-green-500 text-white`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      🙏
    </div>
  ),

  celebrating: ({ size = 20, className = "" }: { size?: number; className?: string }) => (
    <div
      className={`${className} flex items-center justify-center rounded-full bg-yellow-500 text-white`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      🎉
    </div>
  ),
};
