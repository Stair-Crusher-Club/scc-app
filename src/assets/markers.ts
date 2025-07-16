import {MarkerIcon, MarkerLevel} from '@/components/maps/MarkerItem';

export const MarkerOn: Record<MarkerIcon, string> = {
  cafe: `<svg width="49" height="55" viewBox="0 0 49 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_8458_88297)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.5 7C15.1112 7 7.5 14.6112 7.5 24C7.5 31.9114 12.9043 38.5607 20.2226 40.4573L24 47L27.6301 40.7124C35.5238 39.2433 41.5 32.3195 41.5 24C41.5 14.6112 33.8888 7 24.5 7Z" fill="#9A9B9F"/>
<path d="M20.2226 40.4573L20.8524 40.0937L20.7001 39.8298L20.4051 39.7533L20.2226 40.4573ZM24 47L23.3702 47.3636L24 48.4545L24.6298 47.3636L24 47ZM27.6301 40.7124L27.497 39.9974L27.1678 40.0587L27.0003 40.3488L27.6301 40.7124ZM8.22727 24C8.22727 15.0128 15.5128 7.72727 24.5 7.72727V6.27273C14.7095 6.27273 6.77273 14.2095 6.77273 24H8.22727ZM20.4051 39.7533C13.3997 37.9377 8.22727 31.572 8.22727 24H6.77273C6.77273 32.2509 12.4089 39.1836 20.0401 41.1614L20.4051 39.7533ZM24.6298 46.6364L20.8524 40.0937L19.5928 40.821L23.3702 47.3636L24.6298 46.6364ZM27.0003 40.3488L23.3702 46.6364L24.6298 47.3636L28.26 41.0761L27.0003 40.3488ZM40.7727 24C40.7727 31.9628 35.0526 38.5912 27.497 39.9974L27.7632 41.4274C35.995 39.8953 42.2273 32.6762 42.2273 24H40.7727ZM24.5 7.72727C33.4872 7.72727 40.7727 15.0128 40.7727 24H42.2273C42.2273 14.2095 34.2905 6.27273 24.5 6.27273V7.72727Z" fill="white"/>
</g>
<path d="M16.5078 22.2V18H29.5078V22.2C29.5078 25.8 28.4245 30 23.0078 30C17.5911 30 16.5078 25.8 16.5078 22.2Z" fill="white" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M29.9523 20C32.6189 20 33.5078 21.0909 33.5078 22.7273C33.5078 24.3636 32.1745 26 29.5078 26" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<defs>
<filter id="filter0_d_8458_88297" x="0.955256" y="0.454768" width="47.0895" height="53.818" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="2.90909"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0.2 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_8458_88297"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_8458_88297" result="shape"/>
</filter>
</defs>
</svg>
`,
  conv: `<svg width="48" height="55" viewBox="0 0 48 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_8458_88312)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M24 7C14.6112 7 7 14.6112 7 24C7 31.9114 12.4043 38.5607 19.7226 40.4573L23.5 47L27.1301 40.7124C35.0238 39.2433 41 32.3195 41 24C41 14.6112 33.3888 7 24 7Z" fill="#9A9B9F"/>
<path d="M19.7226 40.4573L20.3524 40.0937L20.2001 39.8298L19.9051 39.7533L19.7226 40.4573ZM23.5 47L22.8702 47.3636L23.5 48.4545L24.1298 47.3636L23.5 47ZM27.1301 40.7124L26.997 39.9974L26.6678 40.0587L26.5003 40.3488L27.1301 40.7124ZM7.72727 24C7.72727 15.0128 15.0128 7.72727 24 7.72727V6.27273C14.2095 6.27273 6.27273 14.2095 6.27273 24H7.72727ZM19.9051 39.7533C12.8997 37.9377 7.72727 31.572 7.72727 24H6.27273C6.27273 32.2509 11.9089 39.1836 19.5401 41.1614L19.9051 39.7533ZM24.1298 46.6364L20.3524 40.0937L19.0928 40.821L22.8702 47.3636L24.1298 46.6364ZM26.5003 40.3488L22.8702 46.6364L24.1298 47.3636L27.76 41.0761L26.5003 40.3488ZM40.2727 24C40.2727 31.9628 34.5526 38.5912 26.997 39.9974L27.2632 41.4274C35.495 39.8953 41.7273 32.6762 41.7273 24H40.2727ZM24 7.72727C32.9872 7.72727 40.2727 15.0128 40.2727 24H41.7273C41.7273 14.2095 33.7905 6.27273 24 6.27273V7.72727Z" fill="white"/>
</g>
<rect x="15" y="16" width="18" height="5" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.5 22V32H31.5V22" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 25.6667C20 24.8333 20.375 24 21.5 24C22.625 24 23 24.8333 23 25.6667C23 26.5 20.75 27.6667 20 28.5H23" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M26.6 24L25 27.3333H29M27.8 25.6667V28.5" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15 18.5H33" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<defs>
<filter id="filter0_d_8458_88312" x="0.455256" y="0.454768" width="47.0895" height="53.818" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="2.90909"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0.2 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_8458_88312"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_8458_88312" result="shape"/>
</filter>
</defs>
</svg>
`,
  phar: `<svg width="48" height="55" viewBox="0 0 48 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_9040_96549)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.25 7C14.8612 7 7.25 14.6112 7.25 24C7.25 31.9114 12.6543 38.5607 19.9726 40.4573L23.75 47L27.3801 40.7124C35.2738 39.2433 41.25 32.3195 41.25 24C41.25 14.6112 33.6388 7 24.25 7Z" fill="#9A9B9F"/>
<path d="M19.9726 40.4573L20.6024 40.0937L20.4501 39.8298L20.1551 39.7533L19.9726 40.4573ZM23.75 47L23.1202 47.3636L23.75 48.4545L24.3798 47.3636L23.75 47ZM27.3801 40.7124L27.247 39.9974L26.9178 40.0587L26.7503 40.3488L27.3801 40.7124ZM7.97727 24C7.97727 15.0128 15.2628 7.72727 24.25 7.72727V6.27273C14.4595 6.27273 6.52273 14.2095 6.52273 24H7.97727ZM20.1551 39.7533C13.1497 37.9377 7.97727 31.572 7.97727 24H6.52273C6.52273 32.2509 12.1589 39.1836 19.7901 41.1614L20.1551 39.7533ZM24.3798 46.6364L20.6024 40.0937L19.3428 40.821L23.1202 47.3636L24.3798 46.6364ZM26.7503 40.3488L23.1202 46.6364L24.3798 47.3636L28.01 41.0761L26.7503 40.3488ZM40.5227 24C40.5227 31.9628 34.8026 38.5912 27.247 39.9974L27.5132 41.4274C35.745 39.8953 41.9773 32.6762 41.9773 24H40.5227ZM24.25 7.72727C33.2372 7.72727 40.5227 15.0128 40.5227 24H41.9773C41.9773 14.2095 34.0405 6.27273 24.25 6.27273V7.72727Z" fill="white"/>
</g>
<rect x="27.7266" y="14.4082" width="8.18195" height="18.6916" rx="4.09098" transform="rotate(43.5625 27.7266 14.4082)" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<mask id="mask0_9040_96549" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="15" y="15" width="18" height="18">
<rect x="27.6797" y="14.4468" width="7.85047" height="18.6379" rx="3.92524" transform="rotate(43.5625 27.6797 14.4468)" fill="white" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
</mask>
<g mask="url(#mask0_9040_96549)">
<rect x="19.9219" y="19.2554" width="13.278" height="11.0619" transform="rotate(43.56 19.9219 19.2554)" fill="white"/>
</g>
<defs>
<filter id="filter0_d_9040_96549" x="0.705256" y="0.454768" width="47.0895" height="53.818" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="2.90909"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0.2 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_9040_96549"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_9040_96549" result="shape"/>
</filter>
</defs>
</svg>
`,
  rest: `<svg width="49" height="55" viewBox="0 0 49 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_8458_88302)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.5 7C15.1112 7 7.5 14.6112 7.5 24C7.5 31.9114 12.9043 38.5607 20.2226 40.4573L24 47L27.6301 40.7124C35.5238 39.2433 41.5 32.3195 41.5 24C41.5 14.6112 33.8888 7 24.5 7Z" fill="#9A9B9F"/>
<path d="M20.2226 40.4573L20.8524 40.0937L20.7001 39.8298L20.4051 39.7533L20.2226 40.4573ZM24 47L23.3702 47.3636L24 48.4545L24.6298 47.3636L24 47ZM27.6301 40.7124L27.497 39.9974L27.1678 40.0587L27.0003 40.3488L27.6301 40.7124ZM8.22727 24C8.22727 15.0128 15.5128 7.72727 24.5 7.72727V6.27273C14.7095 6.27273 6.77273 14.2095 6.77273 24H8.22727ZM20.4051 39.7533C13.3997 37.9377 8.22727 31.572 8.22727 24H6.77273C6.77273 32.2509 12.4089 39.1836 20.0401 41.1614L20.4051 39.7533ZM24.6298 46.6364L20.8524 40.0937L19.5928 40.821L23.3702 47.3636L24.6298 46.6364ZM27.0003 40.3488L23.3702 46.6364L24.6298 47.3636L28.26 41.0761L27.0003 40.3488ZM40.7727 24C40.7727 31.9628 35.0526 38.5912 27.497 39.9974L27.7632 41.4274C35.995 39.8953 42.2273 32.6762 42.2273 24H40.7727ZM24.5 7.72727C33.4872 7.72727 40.7727 15.0128 40.7727 24H42.2273C42.2273 14.2095 34.2905 6.27273 24.5 6.27273V7.72727Z" fill="white"/>
</g>
<path d="M20.5 16L20.5 33" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M30.5 22C30.5 20.4 29.1667 17.6667 28.5 16L28.5 25C29.1667 25 30.5 23.6 30.5 22Z" fill="white"/>
<path d="M28.5 33L28.5 25M28.5 25L28.5 16C29.1667 17.6667 30.5 20.4 30.5 22C30.5 23.6 29.1667 25 28.5 25Z" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 16C18 19 17.5003 23 20.5001 23C23.5 23 23 19 23 16" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<defs>
<filter id="filter0_d_8458_88302" x="0.955256" y="0.454768" width="47.0895" height="53.818" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="2.90909"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0.2 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_8458_88302"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_8458_88302" result="shape"/>
</filter>
</defs>
</svg>
`,
  hos: `<svg width="49" height="55" viewBox="0 0 49 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_8458_88307)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.5 7C15.1112 7 7.5 14.6112 7.5 24C7.5 31.9114 12.9043 38.5607 20.2226 40.4573L24 47L27.6301 40.7124C35.5238 39.2433 41.5 32.3195 41.5 24C41.5 14.6112 33.8888 7 24.5 7Z" fill="#9A9B9F"/>
<path d="M20.2226 40.4573L20.8524 40.0937L20.7001 39.8298L20.4051 39.7533L20.2226 40.4573ZM24 47L23.3702 47.3636L24 48.4545L24.6298 47.3636L24 47ZM27.6301 40.7124L27.497 39.9974L27.1678 40.0587L27.0003 40.3488L27.6301 40.7124ZM8.22727 24C8.22727 15.0128 15.5128 7.72727 24.5 7.72727V6.27273C14.7095 6.27273 6.77273 14.2095 6.77273 24H8.22727ZM20.4051 39.7533C13.3997 37.9377 8.22727 31.572 8.22727 24H6.77273C6.77273 32.2509 12.4089 39.1836 20.0401 41.1614L20.4051 39.7533ZM24.6298 46.6364L20.8524 40.0937L19.5928 40.821L23.3702 47.3636L24.6298 46.6364ZM27.0003 40.3488L23.3702 46.6364L24.6298 47.3636L28.26 41.0761L27.0003 40.3488ZM40.7727 24C40.7727 31.9628 35.0526 38.5912 27.497 39.9974L27.7632 41.4274C35.995 39.8953 42.2273 32.6762 42.2273 24H40.7727ZM24.5 7.72727C33.4872 7.72727 40.7727 15.0128 40.7727 24H42.2273C42.2273 14.2095 34.2905 6.27273 24.5 6.27273V7.72727Z" fill="white"/>
</g>
<rect x="16.5" y="16" width="16" height="16" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="16.5" y="16" width="16" height="16" stroke="white" stroke-width="1.5014" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M26.0033 19.0005H23.0033V22.5002L19.5 22.5002L19.5 25.5002H23.0033V29.0005H26.0033V25.5002H29.5V22.5002L26.0033 22.5002V19.0005Z" fill="white"/>
<defs>
<filter id="filter0_d_8458_88307" x="0.955256" y="0.454768" width="47.0895" height="53.818" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="2.90909"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0.2 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_8458_88307"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_8458_88307" result="shape"/>
</filter>
</defs>
</svg>
`,
  default: `<svg width="48" height="55" viewBox="0 0 48 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_8458_88317)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M24 7C14.6112 7 7 14.6112 7 24C7 31.9114 12.4043 38.5607 19.7226 40.4573L23.5 47L27.1301 40.7124C35.0238 39.2433 41 32.3195 41 24C41 14.6112 33.3888 7 24 7Z" fill="#9A9B9F"/>
<path d="M19.7226 40.4573L20.3524 40.0937L20.2001 39.8298L19.9051 39.7533L19.7226 40.4573ZM23.5 47L22.8702 47.3636L23.5 48.4545L24.1298 47.3636L23.5 47ZM27.1301 40.7124L26.997 39.9974L26.6678 40.0587L26.5003 40.3488L27.1301 40.7124ZM7.72727 24C7.72727 15.0128 15.0128 7.72727 24 7.72727V6.27273C14.2095 6.27273 6.27273 14.2095 6.27273 24H7.72727ZM19.9051 39.7533C12.8997 37.9377 7.72727 31.572 7.72727 24H6.27273C6.27273 32.2509 11.9089 39.1836 19.5401 41.1614L19.9051 39.7533ZM24.1298 46.6364L20.3524 40.0937L19.0928 40.821L22.8702 47.3636L24.1298 46.6364ZM26.5003 40.3488L22.8702 46.6364L24.1298 47.3636L27.76 41.0761L26.5003 40.3488ZM40.2727 24C40.2727 31.9628 34.5526 38.5912 26.997 39.9974L27.2632 41.4274C35.495 39.8953 41.7273 32.6762 41.7273 24H40.2727ZM24 7.72727C32.9872 7.72727 40.2727 15.0128 40.2727 24H41.7273C41.7273 14.2095 33.7905 6.27273 24 6.27273V7.72727Z" fill="white"/>
</g>
<circle cx="24" cy="24" r="6" fill="white"/>
<defs>
<filter id="filter0_d_8458_88317" x="0.455256" y="0.454768" width="47.0895" height="53.818" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="2.90909"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0.2 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_8458_88317"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_8458_88317" result="shape"/>
</filter>
</defs>
</svg>
`,
  toilet: `<svg width="48" height="55" viewBox="0 0 48 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_8458_88317)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M24 7C14.6112 7 7 14.6112 7 24C7 31.9114 12.4043 38.5607 19.7226 40.4573L23.5 47L27.1301 40.7124C35.0238 39.2433 41 32.3195 41 24C41 14.6112 33.3888 7 24 7Z" fill="#9A9B9F"/>
<path d="M19.7226 40.4573L20.3524 40.0937L20.2001 39.8298L19.9051 39.7533L19.7226 40.4573ZM23.5 47L22.8702 47.3636L23.5 48.4545L24.1298 47.3636L23.5 47ZM27.1301 40.7124L26.997 39.9974L26.6678 40.0587L26.5003 40.3488L27.1301 40.7124ZM7.72727 24C7.72727 15.0128 15.0128 7.72727 24 7.72727V6.27273C14.2095 6.27273 6.27273 14.2095 6.27273 24H7.72727ZM19.9051 39.7533C12.8997 37.9377 7.72727 31.572 7.72727 24H6.27273C6.27273 32.2509 11.9089 39.1836 19.5401 41.1614L19.9051 39.7533ZM24.1298 46.6364L20.3524 40.0937L19.0928 40.821L22.8702 47.3636L24.1298 46.6364ZM26.5003 40.3488L22.8702 46.6364L24.1298 47.3636L27.76 41.0761L26.5003 40.3488ZM40.2727 24C40.2727 31.9628 34.5526 38.5912 26.997 39.9974L27.2632 41.4274C35.495 39.8953 41.7273 32.6762 41.7273 24H40.2727ZM24 7.72727C32.9872 7.72727 40.2727 15.0128 40.2727 24H41.7273C41.7273 14.2095 33.7905 6.27273 24 6.27273V7.72727Z" fill="white"/>
</g>
<circle cx="24" cy="24" r="6" fill="white"/>
<defs>
<filter id="filter0_d_8458_88317" x="0.455256" y="0.454768" width="47.0895" height="53.818" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="2.90909"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0 0.43136 0 0 0 0.2 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_8458_88317"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_8458_88317" result="shape"/>
</filter>
</defs>
</svg>
`,
} as const;

export const MarkerOff: Record<MarkerIcon, string> = {
  cafe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="22" height="22" rx="11" fill="#9A9B9F"/>
<rect x="1" y="1" width="22" height="22" rx="11" stroke="white"/>
<path d="M6.67188 10.8V8H15.3385V10.8C15.3385 13.2 14.6163 16 11.0052 16C7.3941 16 6.67188 13.2 6.67188 10.8Z" fill="white" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.6322 9.3335C17.41 9.3335 18.0026 10.0608 18.0026 11.1517C18.0026 12.2426 17.1137 13.3335 15.3359 13.3335" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  conv: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.33594" y="1" width="22" height="22" rx="11" fill="#9A9B9F"/>
<rect x="1.33594" y="1" width="22" height="22" rx="11" stroke="white"/>
<rect x="6.33594" y="6.6665" width="12" height="3.33333" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.33594 10.6665V17.3332H17.3359V10.6665" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.67188 13.1111C9.67188 12.5556 9.92188 12 10.6719 12C11.4219 12 11.6719 12.5556 11.6719 13.1111C11.6719 13.6667 10.1719 14.4444 9.67187 15H11.6719" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14.0667 12L13 14.2222H15.6667M14.8667 13.1111V15" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.33594 8.3335H18.3359" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  phar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="22" height="22" rx="11" fill="#9A9B9F"/>
<rect x="1" y="1" width="22" height="22" rx="11" stroke="white"/>
<rect x="14.3203" y="5.60547" width="5.45463" height="12.4611" rx="2.72732" transform="rotate(43.5625 14.3203 5.60547)" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<mask id="mask0_9040_96276" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="6" y="6" width="12" height="12">
<rect x="14.2969" y="5.63135" width="5.23365" height="12.4253" rx="2.61682" transform="rotate(43.5625 14.2969 5.63135)" fill="white" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
</mask>
<g mask="url(#mask0_9040_96276)">
<rect x="9.11719" y="8.83252" width="8.84375" height="7.36768" transform="rotate(43.56 9.11719 8.83252)" fill="white"/>
</g>
</svg>
`,
  rest: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="22" height="22" rx="11" fill="#9A9B9F"/>
<rect x="1" y="1" width="22" height="22" rx="11" stroke="white"/>
<path d="M9.33594 6.6665L9.33594 17.9998" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.9974 10.6665C15.9974 9.59984 15.1085 7.77762 14.6641 6.6665L14.6641 12.6665C15.1085 12.6665 15.9974 11.7332 15.9974 10.6665Z" fill="white"/>
<path d="M14.6641 17.9998L14.6641 12.6665M14.6641 12.6665L14.6641 6.6665C15.1085 7.77762 15.9974 9.59984 15.9974 10.6665C15.9974 11.7332 15.1085 12.6665 14.6641 12.6665Z" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.66925 6.6665C7.66925 8.6665 7.33611 11.3332 9.336 11.3332C11.3359 11.3332 11.0026 8.6665 11.0026 6.66652" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  hos: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="22" height="22" rx="11" fill="#9A9B9F"/>
<rect x="1" y="1" width="22" height="22" rx="11" stroke="white"/>
<rect x="6.66406" y="6.6665" width="10.6667" height="10.6667" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="6.66406" y="6.6665" width="10.6667" height="10.6667" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.0052 8.66699H11.0052V11.0003H8.67188L8.67188 13.0003H11.0052V15.3337H13.0052V13.0003H15.3385L15.3385 11.0003H13.0052V8.66699Z" fill="white"/>
</svg>
`,
  default: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.33594" y="1" width="22" height="22" rx="11" fill="#9A9B9F"/>
<rect x="1.33594" y="1" width="22" height="22" rx="11" stroke="white"/>
<circle cx="12.3359" cy="12" r="4" fill="white"/>
</svg>
`,
  toilet: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.33594" y="1" width="22" height="22" rx="11" fill="#9A9B9F"/>
<rect x="1.33594" y="1" width="22" height="22" rx="11" stroke="white"/>
<circle cx="12.3359" cy="12" r="4" fill="white"/>
</svg>
`,
} as const;

export const MarkerColors: Record<MarkerLevel, string> = {
  '0': '#06903A',
  '1': '#85CF3A',
  '2': '#FFC109',
  '3': '#FF9202',
  '4': '#FF5722',
  '5': '#E52123',
  none: '#9A9B9F',
  progress: '#FFC109',
};
