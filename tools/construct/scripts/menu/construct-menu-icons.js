export function getShapeIcon(type) {
  if (type === "bezier") {
    return `
      <svg viewBox="0 0 24 24">
        <path
          d="M3.56 20.44C3.56 7.64 20.44 16.32 20.44 3.56"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    `;
  }

  if (type === "orthogonal") {
    return `
      <svg viewBox="0 0 24 24">
        <path
          d="M20.44 3.56v5.96c0 1.37-1.11 2.47-2.47 2.47H6.04c-1.37 0-2.47 1.11-2.47 2.47v5.96"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24">
      <line
        x1="3.57"
        y1="20.44"
        x2="20.44"
        y2="3.57"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  `;
}

export function getLineIcon(style) {
  if (style === "dashed") {
    return `
      <svg viewBox="0 0 24 24">
        <line
          x1="3.56"
          y1="20.44"
          x2="20.44"
          y2="3.56"
          stroke="currentColor"
          stroke-width="2"
          stroke-dasharray="6 4"
          stroke-linecap="round"
        />
      </svg>
    `;
  }

  if (style === "dotted") {
    return `
      <svg viewBox="0 0 24 24">
        <line
          x1="3.56"
          y1="20.44"
          x2="20.44"
          y2="3.56"
          stroke="currentColor"
          stroke-width="2"
          stroke-dasharray="1 4"
          stroke-linecap="round"
        />
      </svg>
    `;
  }

  if (style === "dashdot") {
    return `
      <svg viewBox="0 0 24 24">
        <line
          x1="3.56"
          y1="20.44"
          x2="20.44"
          y2="3.56"
          stroke="currentColor"
          stroke-width="2"
          stroke-dasharray="8 4 2 4"
          stroke-linecap="round"
        />
      </svg>
    `;
  }

  if (style === "double") {
    return `
      <svg viewBox="0 0 24 24">
        <line
          x1="6.87"
          y1="21.18"
          x2="21.18"
          y2="6.87"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        />
        <line
          x1="2.82"
          y1="17.13"
          x2="17.13"
          y2="2.82"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        />
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24">
      <line
        x1="3.56"
        y1="20.44"
        x2="20.44"
        y2="3.56"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  `;
}
