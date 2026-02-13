import React from 'react'

const UserAvatarSvg = () => {
  return (
    <div className='crowdSvg'>
        <svg
  viewBox="0 0 36 36"
  xmlns="http://www.w3.org/2000/svg"
  className='avatarSVG'
>
  <path
    d="M30.61,24.52a17.16,17.16,0,0,0-25.22,0,1.51,1.51,0,0,0-.39,1v6A1.5,1.5,0,0,0,6.5,33h23A1.5,1.5,0,0,0,31,31.5v-6A1.51,1.51,0,0,0,30.61,24.52Z"
    fill="black"
    stroke="var(--solid-secondary)"
    strokeWidth="1.5"
    strokeLinejoin="round"
  />

  <circle
    cx="18"
    cy="10"
    r="7"
    fill="black"
    stroke="var(--solid-secondary)"
    strokeWidth="1.5"
  />
</svg>
    </div>
  )
}

export default UserAvatarSvg