<template>
  <div class="landscape" aria-hidden="true">
    <svg viewBox="0 0 900 650" fill="none" class="landscape-svg">
      <defs>
        <linearGradient id="ink-far" x1="470" y1="130" x2="470" y2="530" gradientUnits="userSpaceOnUse"><stop stop-color="#9ba49a" stop-opacity=".5"/><stop offset="1" stop-color="#c3c9bd" stop-opacity=".04"/></linearGradient>
        <linearGradient id="ink-mid" x1="500" y1="180" x2="500" y2="580" gradientUnits="userSpaceOnUse"><stop stop-color="#747f74" stop-opacity=".69"/><stop offset=".7" stop-color="#a2ad9e" stop-opacity=".27"/><stop offset="1" stop-color="#d7d9ca" stop-opacity="0"/></linearGradient>
        <linearGradient id="ink-near" x1="590" y1="260" x2="590" y2="650" gradientUnits="userSpaceOnUse"><stop stop-color="#4e5c50" stop-opacity=".84"/><stop offset="1" stop-color="#87937d" stop-opacity=".16"/></linearGradient>
        <linearGradient id="ink-left" x1="150" y1="370" x2="230" y2="620" gradientUnits="userSpaceOnUse"><stop stop-color="#6e7b6c" stop-opacity=".55"/><stop offset="1" stop-color="#b3bca8" stop-opacity="0"/></linearGradient>
        <radialGradient id="sun-wash"><stop stop-color="#d3cfb6" stop-opacity=".75"/><stop offset=".9" stop-color="#d3cfb6" stop-opacity=".25"/><stop offset="1" stop-color="#d3cfb6" stop-opacity="0"/></radialGradient>
        <filter id="paper-ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".025 .13" numOctaves="3" seed="8" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>
      </defs>
      <circle cx="644" cy="144" r="57" fill="url(#sun-wash)" class="landscape-sun"/>
      <g class="mountain mountain-far" filter="url(#paper-ink)">
        <path d="M92 437 134 390 163 359 187 368 214 313 234 307 255 272 267 276 290 217 309 244 321 230 346 286 368 297 390 337 414 317 435 355 458 306 485 282 499 248 524 276 548 267 563 314 590 330 615 380 660 372 712 428 783 455 856 535H80Z" fill="url(#ink-far)"/>
        <path d="m430 409 43-80 21-10 33-71 18 9 36-87 15 5 24-55 17 30 16-9 32 74 21 11 28 62 31 12 23 64 31 28 63 91 50 57H420Z" fill="url(#ink-far)" opacity=".66"/>
      </g>
      <g class="mountain mountain-mid" filter="url(#paper-ink)">
        <path d="m261 559 24-100 25-27 31-85 23-7 30-78 16 7 24-56 16 8 21 72 16 8 28 83 25 17 32 68 43 24 30 77 35 34-35 66H260Z" fill="url(#ink-mid)"/>
        <path d="m453 542 38-90 28-20 35-68 26-11 27-74 18 7 26-72 17 20 13-8 28 82 20 10 29 66 25 17 22 66 31 28 35 112 53 51H440Z" fill="url(#ink-mid)"/>
        <g stroke="#5b6a5b" stroke-width="1" opacity=".22"><path d="m434 234-10 92-37 65-9 60m56-197 8 89 25 62 2 51m162-211-19 83-37 66-9 53m65-123 16 55 37 57 16 71m-284-70-16 31-4 45m207-70-20 53-8 39"/></g>
      </g>
      <g class="mountain mountain-front" filter="url(#paper-ink)">
        <path d="m-20 575 44-30 24-48 26-6 27-42 18 9 23-56 18 16 27 57 28 13 32 47 26 13 31 53 51 42-12 36H-20Z" fill="url(#ink-left)"/>
        <path d="m555 650 40-58 25-63 22-5 30-74 18-5 25-78 17 9 23-57 19 39 18-6 31 73 23 12 26 65 28 16 29 84 42 103Z" fill="url(#ink-near)"/>
        <g stroke="#415042" stroke-width="1.2" opacity=".3"><path d="m755 344-14 93-37 54-17 61m69-167 18 59 29 39 7 59m-102-62-12 43-26 35m121-102 21 52 2 43"/></g>
      </g>
      <g class="landscape-water" stroke="#7c8977" stroke-width=".7" opacity=".23"><path d="M126 548h205m-163 17h254m-118 18h192m-249 20h314m-95-63h105m-195 79h196m-326-27h87m327-49h59"/></g>
      <g class="landscape-boat" stroke="#65715f" stroke-linecap="round"><path d="M409 526q18 9 38 0l-6 7h-25Z" fill="#65715f" stroke-width=".8"/><path d="m433 526-1-16m-6 15 6-8 5 9m-2-14 11 21" stroke-width="1.3"/><circle cx="432" cy="508" r="2" fill="#65715f"/></g>
      <g class="landscape-birds" stroke="#687463" stroke-width="1.3" stroke-linecap="round" opacity=".65"><path d="m392 163 8-3 6 4m22-25 6-2 4 3m-21 40 5-1 4 2"/></g>
      <g class="landscape-pine" stroke="#52614f" stroke-linecap="round" opacity=".72"><path d="m766 447 5-67m-1 25-16-14m17 3 17-18m-16 10-6-18m8 54 19-14" stroke-width="2"/><path d="m746 391 12-5 12 6m-10-23 7-4 7 5m4 7 12-5 10 4m-20 35 13-7 13 5" stroke-width="4"/></g>
    </svg>
    <span class="landscape-caption">一山一水，皆是序章</span>
  </div>
</template>
