import React from "react";
const ink = "#314b3a";
export function Goblin({ small = false }) {
  return (
    <svg viewBox="0 0 240 230" fill="none" aria-hidden="true">
      <path
        d="M38 198c14-42 28-61 83-62 57-1 75 24 85 62"
        fill="#b97b4a"
        stroke={ink}
        strokeWidth="3"
      />
      <path
        d="M88 149l28 27 30-29-13 68H98z"
        fill="#f6e9ca"
        stroke={ink}
        strokeWidth="2"
      />
      <path
        d="M58 81L11 65l34 48 25-4M177 81l47-16-35 49-23-5"
        fill="#96b083"
        stroke={ink}
        strokeWidth="3"
      />
      <path
        d="M49 83L25 76l26 25M184 83l25-7-25 26"
        stroke="#66865b"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M63 67c7-39 107-38 115 2l-3 57c-7 22-25 38-56 38-28 0-50-18-55-42z"
        fill="#a8bc8b"
        stroke={ink}
        strokeWidth="3"
      />
      <path
        d="M49 70c3-13 23-20 37-22 5-43 29-55 45-40l30 35c17 3 28 12 31 24-38-8-99-8-143 3z"
        fill="#b16c4c"
        stroke={ink}
        strokeWidth="3"
      />
      <path d="M83 51c23-5 52-6 82-3" stroke="#e0aa74" strokeWidth="8" />
      <path
        d="M81 91c8-7 16-7 24-2m29 0c8-6 17-6 24 1"
        stroke={ink}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="94" cy="101" rx="4" ry="6" fill={ink} />
      <ellipse cx="146" cy="101" rx="4" ry="6" fill={ink} />
      <path
        d="M115 98l-9 21c8 6 18 6 27-1"
        fill="#91a979"
        stroke={ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M91 133c15 14 43 14 59-1"
        stroke={ink}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M103 140l3-10 8 13"
        fill="#fff8dc"
        stroke={ink}
        strokeWidth="1.5"
      />
      <circle cx="80" cy="118" r="8" fill="#c8a186" opacity=".6" />
      <circle cx="160" cy="117" r="8" fill="#c8a186" opacity=".6" />
      <path
        d="M59 175l-14 34m135-34 12 34M75 163l9 29-17 4 16 18m79-50-11 29 17 4-13 17"
        stroke={ink}
        strokeWidth="2"
      />
      <circle cx="125" cy="191" r="3" fill={ink} />
      <path
        d="M11 216h218"
        stroke={ink}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M22 202h27v13H22z" fill="#d4ac66" stroke={ink} strokeWidth="2" />
      <ellipse
        cx="35"
        cy="202"
        rx="13"
        ry="4"
        fill="#e1bc79"
        stroke={ink}
        strokeWidth="2"
      />
      <path d="M188 203v-20h25v20M200 183v20" stroke={ink} strokeWidth="2" />
      <ellipse
        cx="200"
        cy="203"
        rx="18"
        ry="5"
        fill="#d1a36b"
        stroke={ink}
        strokeWidth="2"
      />
    </svg>
  );
}
function Spark({ x, y, s = 1 }) {
  return (
    <path
      d={`M${x} ${y - 7 * s}q0 ${7 * s} ${7 * s} ${7 * s}q-${7 * s} 0 -${7 * s} ${7 * s}q0 -${7 * s} -${7 * s} -${7 * s}q${7 * s} 0 ${7 * s} -${7 * s}`}
      fill="#b29a58"
      opacity=".8"
    />
  );
}
export function ItemArt({ id, className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 180"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="120" cy="153" rx="62" ry="7" fill="#334a32" opacity=".08" />
      <g
        stroke={ink}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {id === "umbrella" && (
          <>
            <path
              d="M120 29v103c0 23 25 23 25 5v-5"
              stroke="#806344"
              strokeWidth="5"
            />
            <path
              d="M43 89c9-73 143-73 154 0-18-10-31-8-39 3-14-13-25-13-38 0-13-13-27-13-40 0-10-11-21-12-37-3z"
              fill="#7a966e"
            />
            <path
              d="M120 33C94 42 82 65 80 91M120 33c24 8 36 35 38 58M120 33v59"
              stroke="#b4c19b"
              strokeWidth="2"
            />
            <path d="M113 32h14" />
            <path
              d="M59 39c0-8 8-11 7-20 15 15 17 28 6 32-9 3-14-3-13-12"
              fill="#d78b55"
              strokeWidth="2"
            />
            <path
              d="M171 120c0-6 6-8 5-14 10 10 12 19 4 22-6 2-10-2-9-8"
              fill="#d78b55"
              strokeWidth="2"
            />
          </>
        )}
        {id === "boots" && (
          <>
            <g transform="rotate(-10 95 100)">
              <path
                d="M64 46h46l-5 63c2 7 32 12 31 27-1 12-23 14-66 12-11-1-14-5-12-16z"
                fill="#a8794f"
              />
              <path d="M61 46h53v15H61z" fill="#ddc79e" />
              <path
                d="M62 140c30 6 54 4 74-3v10c-23 7-50 7-76 2z"
                fill="#6b624a"
              />
              <path
                d="M82 70l-2 44 26 10M77 81h17m-18 9h17m-18 9h17"
                stroke="#e5cea1"
                strokeWidth="2"
              />
            </g>
            <g transform="translate(62 4) rotate(8 90 100)">
              <path
                d="M64 46h39l-5 61c2 7 30 13 29 27-1 11-24 13-60 12-10-1-14-5-12-16z"
                fill="#b68a5c"
              />
              <path d="M61 46h46v15H61z" fill="#e6d5af" />
              <path
                d="M58 138c27 6 51 5 69-2v10c-20 6-45 7-69 1z"
                fill="#6b624a"
              />
              <path
                d="M80 69l-3 45 23 10M75 81h16m-17 9h16m-17 9h16"
                stroke="#ead4ab"
                strokeWidth="2"
              />
            </g>
          </>
        )}
        {id === "potion" && (
          <>
            <path
              d="M103 40h34v35c28 11 45 47 25 68-15 16-69 16-84-1-20-24-3-55 25-67z"
              fill="#f8e9dd"
            />
            <path
              d="M86 103c17 10 47-8 68 1 13 14 12 28 2 37-12 12-60 12-73-1-9-10-9-22 3-37"
              fill="#bf7483"
              stroke="none"
            />
            <path d="M99 39h42v13H99z" fill="#d5b68b" />
            <path d="M107 24h26v15h-26z" fill="#a67c55" />
            <path d="M92 118c1-9 6-16 11-19" stroke="#fff9ee" strokeWidth="5" />
            <path
              d="M112 111c-15-9-24 12 9 27 31-17 19-37 7-27l-8 5z"
              fill="#f2d5c6"
              strokeWidth="1.8"
            />
            <circle cx="151" cy="90" r="3" stroke="none" fill="#dbb79c" />
            <path d="M115 29h12" stroke="#d0ad7f" />
          </>
        )}
        {id === "duck" && (
          <>
            <path
              d="M75 104c-17 1-27-8-30-14 0 30 8 58 58 60 37 2 64-12 65-37 1-17-9-22-9-29 20-12 22-46-4-54-25-8-44 13-37 36l7 22c-21 16-33 17-50 16z"
              fill="#edc873"
            />
            <path d="M163 53l29 12-28 10" fill="#d18b49" />
            <path d="M79 115c12 19 44 22 57-1" stroke="#c39b50" />
            <circle cx="151" cy="49" r="3" fill={ink} stroke="none" />
            <path d="M143 40l13-3" />
            <path
              d="M109 143l-4 14m24-13 2 13m-34 1h16m10 0h16"
              stroke="#c18a43"
            />
            <path
              d="M135 92l8 8 8-8 3 16-13-4-10 5z"
              fill="#719176"
              strokeWidth="2"
            />
          </>
        )}
        {id === "shield" && (
          <>
            <path
              d="M120 26l59 20-5 57c-2 28-27 47-54 57-29-12-51-32-54-58l-5-56z"
              fill="#a9bfc0"
            />
            <path
              d="M120 38l46 16-4 46c-1 22-20 39-42 49-23-11-40-29-42-49l-4-46z"
              fill="#d6ddd1"
            />
            <path d="M120 39v108" stroke="#9cb1ac" strokeWidth="2" />
            <path
              d="M120 67c-16 0-28 13-28 27s12 27 28 27 28-12 28-27-12-27-28-27z"
              fill="#b2c6c0"
              strokeWidth="2"
            />
            <path
              d="M107 87l8-5m11 0 8 5m-25 16c7 5 14 5 21 0"
              strokeWidth="2"
            />
            <path d="M61 46l13 8m105-8-13 8" />
          </>
        )}
        {id === "scroll" && (
          <>
            <g transform="rotate(-18 120 90)">
              <path d="M76 39h93l-12 104H64z" fill="#ebd6aa" />
              <path
                d="M71 38c-15 0-17 25-3 25h17c-13 0-13-25 0-25h84c15 0 15 25 0 25h-5"
                fill="#f5e7c8"
              />
              <path
                d="M65 126c-16 0-16 25 0 25h88c16 0 16-25 0-25h-13c14 0 14 25 0 25"
                fill="#f5e7c8"
              />
              <path
                d="M101 77h39m-40 10h27m-29 10h36"
                stroke="#b8a17b"
                strokeWidth="2"
              />
              <circle cx="133" cy="118" r="12" fill="#b66f5b" />
              <path
                d="M128 118l5-6 5 6-5 6z"
                stroke="#e6baa0"
                strokeWidth="1.5"
              />
            </g>
          </>
        )}
        {id === "flowers" && (
          <>
            <path
              d="M119 151L85 65m34 86 8-95m-8 95 37-80"
              stroke="#748c62"
              strokeWidth="4"
            />
            <path
              d="M94 104c-29-3-35-21-31-26 20-1 34 16 31 26m31 13c32-4 36-21 34-27-21-1-34 17-34 27"
              fill="#8da37a"
            />
            <path d="M93 130l53-4-20 35-14-1z" fill="#e3c194" />
            <path
              d="M97 129l43 15m-35 3 36-19"
              stroke="#c6817b"
              strokeWidth="4"
            />
            {[
              [84, 61],
              [128, 51],
              [158, 71],
            ].map(([x, y]) => (
              <g key={x}>
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <ellipse
                    key={a}
                    cx={x}
                    cy={y - 11}
                    rx="8"
                    ry="12"
                    fill="#cc8f99"
                    strokeWidth="1.5"
                    transform={`rotate(${a} ${x} ${y})`}
                  />
                ))}
                <circle cx={x} cy={y} r="7" fill="#e2c776" strokeWidth="1.5" />
              </g>
            ))}
          </>
        )}
        {id === "chocolates" && (
          <>
            <path d="M62 74l61-22 58 22v59l-59 23-60-23z" fill="#bd7e70" />
            <path d="M62 74l60 22 59-22m-59 22v60" />
            <path d="M57 61l65-24 64 24v18l-64 25-65-25z" fill="#dfb2a1" />
            <path d="M57 61l65 24 64-24m-64 24v19" />
            <path
              d="M97 47l63 26v67m-65 6V92l62-25"
              stroke="#f2d899"
              strokeWidth="11"
            />
            <path d="M122 49c-40-39-57 8-1 8 51 3 36-43 0-8" fill="#d9b97e" />
          </>
        )}
        {id === "bow" && (
          <>
            <path
              d="M110 75C87 61 61 47 58 61l2 67c1 15 33-3 50-13m20-40c25-14 48-28 51-14l-2 67c-1 15-34-3-50-13"
              fill="#7e9a9e"
            />
            <path d="M111 75h19l4 40h-27z" fill="#b2c6bd" />
            <path
              d="M65 76l38 17-36 17m108-34-37 17 35 17"
              stroke="#597f86"
              strokeWidth="2"
            />
          </>
        )}
        {id === "hat" && (
          <>
            <path d="M66 124l43-95c5-11 16-10 25 3l41 92" fill="#a399b4" />
            <ellipse cx="121" cy="128" rx="78" ry="24" fill="#9a90aa" />
            <path
              d="M75 106l-9 18c28 14 75 16 109 0l-9-18c-26 11-65 11-91 0"
              fill="#d7bd85"
            />
            <path
              d="M110 50l-5 14m-9 9-6 12"
              stroke="#d3cbdb"
              strokeWidth="3"
            />
            <path d="M133 111v19l13-1-2-19z" fill="#b89a63" />
          </>
        )}
        {id === "tea" && (
          <>
            <path d="M67 79h93l-9 52c-4 16-69 16-74 0z" fill="#acc0a1" />
            <path d="M160 89c42-13 36 40-5 36" strokeWidth="5" />
            <ellipse cx="113" cy="80" rx="46" ry="10" fill="#a87e54" />
            <ellipse cx="114" cy="148" rx="63" ry="9" fill="#d6ddc2" />
            <path
              d="M100 58c-16-16 14-15-2-34m30 35c-15-16 13-15-2-33"
              stroke="#9ca88c"
              strokeWidth="2"
            />
            <path d="M141 82v29l-10 8 10 10 10-10-10-8" strokeWidth="1.5" />
          </>
        )}
        {id === "lantern" && (
          <>
            <path d="M103 45c-18-36 49-35 33 0" strokeWidth="5" />
            <path d="M84 58h72l-8 74H91z" fill="#f5df9d" />
            <path d="M85 58l16-17h36l20 17zM86 132h67v15H86z" fill="#81917b" />
            <path
              d="M102 61l2 69m31-69-2 69"
              stroke="#9eaa8b"
              strokeWidth="3"
            />
            <path
              d="M114 120c-15-12 3-24 4-40 17 21 27 36 8 43"
              fill="#dbad5f"
              strokeWidth="2"
            />
            <path d="M119 104v28" stroke="#946c43" strokeWidth="2" />
          </>
        )}
      </g>
      <Spark x={43} y={58} s={0.7} />
      <Spark x={194} y={114} s={0.8} />
      <circle cx="187" cy="43" r="2" fill="#b29a58" />
    </svg>
  );
}
export function Coin({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        fill="#e6be68"
        stroke="#a48036"
        strokeWidth="1.2"
      />
      <circle cx="10" cy="10" r="5.5" stroke="#b18c43" strokeWidth=".8" />
      <path
        d="M10 6v8m-2-6h3a2 2 0 010 4H8"
        stroke="#986f28"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
