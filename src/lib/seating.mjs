// The auditorium seating map for the fall week 1 deck: the room, and where
// each team sits in it. Pure data and geometry, no drawing; the slide is
// src/components/deck/SeatingMap.astro, which draws what seatingLayout()
// returns as an SVG at build time.

// The room. Edit this block to match the real auditorium; everything else is
// derived. Units are arbitrary drawing units; only the ratios matter.
export const ROOM = {
  aisle: 44, // width of the two aisles between left, center, and right
  crossAisle: 96, // walkway between the front and back sections
  expectedSeats: 395,
  frontRadius: 2200, // distance from the room's focal point to the front row; larger is flatter
  rowPitch: 32, // row to row
  seatPitch: 24, // seat to seat along a row
  // Seats per row, front row first. Teams are numbered in this order of
  // sections. `color` names the section's palette family in SeatingMap.
  sections: [
    {
      block: "front",
      color: "sky",
      name: "Front left",
      rows: [8, 8, 8, 9, 9, 9],
      side: "left",
    },
    {
      block: "front",
      color: "emerald",
      name: "Front center",
      rows: [12, 12, 13, 13, 14, 14],
      side: "center",
    },
    {
      block: "front",
      color: "yellow",
      name: "Front right",
      rows: [8, 8, 8, 9, 9, 9],
      side: "right",
    },
    {
      block: "back",
      color: "violet",
      name: "Back left",
      rows: [10, 10, 10, 10, 10, 11],
      side: "left",
    },
    {
      block: "back",
      color: "rose",
      name: "Back center",
      rows: [15, 15, 15, 16, 16, 16],
      side: "center",
    },
    {
      block: "back",
      color: "lime",
      name: "Back right",
      rows: [10, 10, 10, 10, 10, 11],
      side: "right",
    },
  ],
};

// Radius of each row, by block.
const frontRows = Math.max(
  ...ROOM.sections.filter((s) => s.block === "front").map((s) => s.rows.length)
);
function rowRadius(block, i) {
  const front = ROOM.frontRadius + i * ROOM.rowPitch;
  if (block === "front") {
    return front;
  }
  return (
    ROOM.frontRadius +
    (frontRows - 1) * ROOM.rowPitch +
    ROOM.crossAisle +
    i * ROOM.rowPitch
  );
}

// One aisle angle for every row, wide enough for the widest center row, so
// both aisles run as straight lines from front to back.
let aisleAngle = 0;
for (const s of ROOM.sections.filter((x) => x.side === "center")) {
  s.rows.forEach((n, i) => {
    const half =
      ((n - 1) / 2) * ROOM.seatPitch + ROOM.seatPitch / 2 + ROOM.aisle / 2;
    aisleAngle = Math.max(aisleAngle, half / rowRadius(s.block, i));
  });
}

// Seat positions: one array per row, front row first, each row left to right.
function rowsOf(section) {
  return section.rows.map((n, i) => {
    const r = rowRadius(section.block, i);
    const arcs = [];
    for (let k = 0; k < n; k += 1) {
      if (section.side === "center") {
        arcs.push((k - (n - 1) / 2) * ROOM.seatPitch);
      } else {
        const fromAisle =
          aisleAngle * r +
          ROOM.aisle / 2 +
          ROOM.seatPitch / 2 +
          k * ROOM.seatPitch;
        arcs.push(section.side === "left" ? -fromAisle : fromAisle);
      }
    }
    arcs.sort((a, b) => a - b);
    return arcs.map((s) => ({
      x: r * Math.sin(s / r),
      y: r * Math.cos(s / r),
    }));
  });
}

// Split a row into k contiguous runs, sizes differing by at most one. The
// spare seats go to the left runs, or to the right runs when fromRight is set.
function split(row, k, fromRight) {
  const out = [];
  let cursor = 0;
  for (let j = 0; j < k; j += 1) {
    const rank = fromRight ? k - 1 - j : j;
    const size = Math.floor(row.length / k) + (rank < row.length % k ? 1 : 0);
    out.push(row.slice(cursor, cursor + size));
    cursor += size;
  }
  return out;
}

// Teams per row pair, proportional to seats (largest remainder).
function allocate(counts, teams) {
  const total = counts.reduce((a, b) => a + b, 0);
  const exact = counts.map((c) => (c * teams) / total);
  const out = exact.map(Math.floor);
  const order = exact
    .map((e, i) => [e - Math.floor(e), i])
    .sort((a, b) => b[0] - a[0]);
  const remaining = teams - out.reduce((a, b) => a + b, 0);
  for (let k = 0; k < remaining; k += 1) {
    out[order[k][1]] += 1;
  }
  return out;
}

const mean = (points, key) =>
  points.reduce((a, p) => a + p[key], 0) / points.length;

/**
 * Lays out `teams` teams in the room. Rows pair up front to back, and teams
 * are allocated across every pair in the room at once, which keeps team sizes
 * close; each pair splits left to right into blocks two rows deep, so a team
 * sits roughly three wide and two deep. `labelSize` is the font size of the
 * section range labels in drawing units, which sets the width of their pills.
 *
 * Returns the stage, the teams (number, section index, tint, seats, the
 * bench outline, and the number's position), the section range labels, the
 * bounding box of everything, and the seat count. Throws when the room's
 * rows do not add up to its expected seats, or when the teams do not fit.
 */
export function seatingLayout(teams, { labelSize = 30 } = {}) {
  if (!Number.isInteger(teams) || teams < 1) {
    throw new Error(
      `seating: ${teams} teams; the count must be a whole number, 1 or more.`
    );
  }
  const sections = ROOM.sections.map((s) => {
    const seatRows = rowsOf(s);
    const pairs = [];
    for (let i = 0; i < seatRows.length; i += 2) {
      pairs.push(seatRows.slice(i, i + 2));
    }
    return { ...s, pairs, seatRows };
  });
  const totalSeats = sections.reduce((a, s) => a + s.seatRows.flat().length, 0);
  if (totalSeats !== ROOM.expectedSeats) {
    throw new Error(
      `seating: the rows in ROOM (src/lib/seating.mjs) add up to ${totalSeats} seats, not the expected ${ROOM.expectedSeats}. Check the row counts.`
    );
  }
  if (teams > totalSeats) {
    throw new Error(
      `seating: ${teams} teams do not fit in ${totalSeats} seats.`
    );
  }
  const perPairAll = allocate(
    sections.flatMap((s) => s.pairs).map((p) => p.flat().length),
    teams
  );

  const box = {
    x0: Number.POSITIVE_INFINITY,
    x1: Number.NEGATIVE_INFINITY,
    y0: Number.POSITIVE_INFINITY,
    y1: Number.NEGATIVE_INFINITY,
  };
  function grow(x, y, pad = 0) {
    box.x0 = Math.min(box.x0, x - pad);
    box.y0 = Math.min(box.y0, y - pad);
    box.x1 = Math.max(box.x1, x + pad);
    box.y1 = Math.max(box.y1, y + pad);
  }

  // Stage and screen, above the front row.
  const stageEdge = ROOM.frontRadius - 80;
  const sx = 420;
  const sy = Math.sqrt(stageEdge ** 2 - sx ** 2);
  const wallY = sy - 120;
  const stage = {
    edge: stageEdge,
    path: `M ${-sx} ${wallY} L ${-sx} ${sy} A ${stageEdge} ${stageEdge} 0 0 0 ${sx} ${sy} L ${sx} ${wallY} Z`,
    screen: { height: 12, width: sx * 1.4, x: -sx * 0.7, y: wallY - 4 },
    wallY,
  };
  grow(-sx, wallY - 10, 20);
  grow(sx, stageEdge, 20);

  const placed = [];
  const ranges = [];
  let nextTeam = 1;
  let pairIndex = 0;
  sections.forEach((section, si) => {
    const perPair = perPairAll.slice(
      pairIndex,
      pairIndex + section.pairs.length
    );
    pairIndex += section.pairs.length;
    const first = nextTeam;
    section.pairs.forEach((pair, pi) => {
      const runs = pair.map((row, ri) => split(row, perPair[pi], ri === 1));
      for (let j = 0; j < perPair[pi]; j += 1) {
        const [front, back = []] = runs.map((r) => r[j]);
        const seats = [...front, ...back];
        for (const p of seats) {
          grow(p.x, p.y, 14);
        }
        placed.push({
          outline: [...front, ...back.slice().reverse()],
          seats,
          section: si,
          team: nextTeam,
          tint: (j + pi) % 2 ? "b" : "a",
          x: mean(seats, "x"),
          y: mean(seats, "y"),
        });
        nextTeam += 1;
      }
    });
    ranges.push({ first, last: nextTeam - 1, section: si });
  });

  const seated = placed.reduce((a, t) => a + t.seats.length, 0);
  if (seated !== totalSeats) {
    throw new Error(
      `seating: ${teams} teams leave ${totalSeats - seated} of ${totalSeats} seats without a team. Check the team count.`
    );
  }

  // Section range labels: front sections in the cross aisle, back sections
  // behind the last row.
  const labelHeight = Math.round(labelSize * 1.45);
  const labels = ranges.map(({ first, last, section: si }) => {
    const section = sections[si];
    const lastRow = section.rows.length - 1;
    const rowSeats = section.seatRows[lastRow];
    const r = rowRadius(section.block, lastRow);
    const mid =
      rowSeats.reduce((a, p) => a + Math.atan2(p.x, p.y), 0) / rowSeats.length;
    const rl =
      section.block === "front"
        ? r + ROOM.crossAisle / 2
        : r + 32 + labelHeight / 2;
    const x = rl * Math.sin(mid);
    const y = rl * Math.cos(mid);
    const text = first === last ? `Team ${first}` : `Teams ${first} to ${last}`;
    const width = Math.round(text.length * labelSize * 0.58 + labelSize * 1.2);
    grow(x - width / 2, y, labelHeight / 2);
    grow(x + width / 2, y, labelHeight / 2);
    return { first, height: labelHeight, last, section: si, text, width, x, y };
  });

  return {
    box: {
      height: box.y1 - box.y0,
      width: box.x1 - box.x0,
      x: box.x0,
      y: box.y0,
    },
    labels,
    sections: sections.map(({ color, name }) => ({ color, name })),
    stage,
    teams: placed,
    totalSeats,
  };
}
