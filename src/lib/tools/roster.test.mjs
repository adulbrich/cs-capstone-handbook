import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCsv, toCsv } from "./csv.mjs";
import {
  buildContacts,
  CONTACT_COLUMNS,
  contactsCsv,
} from "./peer-contacts.mjs";
import { parseRoster, splitName } from "./roster.mjs";

const BOM = String.fromCodePoint(0xfe_ff);

const HEADER =
  "name,canvas_user_id,user_id,login_id,sections,group_name,canvas_group_id,group_id";

/** A roster line for an invented student. */
const line = (name, email, group) =>
  `"${name}",1,2,${email},CS 461 001,${group},3,4`;

/** `size` invented students on `team`, numbered from 1. */
const team = (name, size) =>
  Array.from({ length: size }, (_, i) =>
    line(
      `Tester${i + 1}, ${name}`,
      `${name.toLowerCase()}${i + 1}@example.edu`,
      name
    )
  );

const roster = (lines) => [HEADER, ...lines].join("\r\n");

test("parseCsv handles a BOM, quotes, doubled quotes, and CRLF", () => {
  const rows = parseCsv(`${BOM}a,b\r\n"x, y","say ""hi"""\r\n\r\n`);
  assert.deepEqual(rows, [
    ["a", "b"],
    ["x, y", 'say "hi"'],
  ]);
});

test("toCsv quotes only what needs quoting", () => {
  assert.equal(toCsv([["a", "b,c", 'd"e']]), 'a,"b,c","d""e"\r\n');
});

test("splitName reads Last, First", () => {
  assert.deepEqual(splitName("Lovelace, Ada"), {
    first: "Ada",
    last: "Lovelace",
  });
  assert.deepEqual(splitName("Ada"), { first: "Ada", last: "" });
});

test("parseRoster reads the Canvas group export", () => {
  const students = parseRoster(
    `${BOM}${roster([line("Lovelace, Ada", "ada@example.edu", "Engines")])}`
  );
  assert.equal(students.length, 1);
  assert.equal(students[0].email, "ada@example.edu");
  assert.equal(students[0].first, "Ada");
  assert.equal(students[0].last, "Lovelace");
  assert.equal(students[0].team, "Engines");
});

test("parseRoster names a missing column", () => {
  assert.throws(
    () => parseRoster("name,login_id\nA,a@example.edu"),
    /group_name/
  );
});

test("parseRoster lowercases emails once, for every tool", () => {
  const [student] = parseRoster(
    roster([line("Lovelace, Ada", "Ada@Example.edu", "Engines")])
  );
  assert.equal(student.email, "ada@example.edu");
});

test("parseRoster rejects a duplicate email and a missing one", () => {
  const text = roster([
    line("Lovelace, Ada", "ada@example.edu", "Engines"),
    line("Lovelace, Ada", "ADA@example.edu", "Looms"),
    line("Hopper, Grace", "", "Engines"),
  ]);
  assert.throws(
    () => parseRoster(text),
    (error) => {
      assert.match(
        error.message,
        /ada@example\.edu appears on data rows 1 and 2/
      );
      assert.match(
        error.message,
        /Data row 3 \(Hopper, Grace\) has no login_id/
      );
      return true;
    }
  );
});

test("buildContacts: teams of 1, 2, and 10, and a student in no team", () => {
  const students = parseRoster(
    roster([
      ...team("Solo", 1),
      ...team("Pair", 2),
      ...team("Ten", 10),
      line("Hopper, Grace", "grace@example.edu", ""),
    ])
  );
  const { rows, excluded } = buildContacts(students);

  assert.equal(rows.length, 12);
  assert.deepEqual(
    excluded.map(({ email, reason }) => [email, reason]),
    [
      ["solo1@example.edu", "alone on a team"],
      ["grace@example.edu", "in no team"],
    ]
  );

  const pair = rows.find((row) => row.Email === "pair1@example.edu");
  assert.equal(pair.TeamSize, "2");
  assert.equal(pair.SelfFloor, "0");
  assert.equal(pair["Team Member 1"], "Pair Tester2 (pair2@example.edu)");
  for (let slot = 2; slot <= 9; slot += 1) {
    assert.equal(pair[`Team Member ${slot}`], "", `slot ${slot} is padded`);
  }

  const ten = rows.find((row) => row.Email === "ten5@example.edu");
  assert.equal(ten.TeamSize, "10");
  assert.equal(ten.SelfFloor, "10");
  const slots = Array.from(
    { length: 9 },
    (_, i) => ten[`Team Member ${i + 1}`]
  );
  assert.ok(slots.every(Boolean), "all nine slots are filled");
  assert.ok(!slots.some((slot) => slot.includes("ten5@")), "self is excluded");
});

test("buildContacts: SelfFloor is floor(100 / TeamSize), 0 on a team of two", () => {
  for (const [size, floor] of [
    [2, "0"],
    [3, "33"],
    [4, "25"],
    [6, "16"],
    [7, "14"],
    [10, "10"],
  ]) {
    const { rows } = buildContacts(parseRoster(roster(team("T", size))));
    assert.equal(rows[0].SelfFloor, floor, `team of ${size}`);
  }
});

test("buildContacts stops on a team of 11 and names it", () => {
  const students = parseRoster(
    roster([...team("Big", 11), ...team("Pair", 2)])
  );
  assert.throws(() => buildContacts(students), /Big \(11\)/);
});

test("contactsCsv writes the exact headers Qualtrics maps", () => {
  const { rows } = buildContacts(parseRoster(roster(team("Pair", 2))));
  const [header, first] = parseCsv(contactsCsv(rows));
  assert.deepEqual(header, CONTACT_COLUMNS);
  assert.deepEqual(header.slice(0, 4), [
    "Email",
    "Team",
    "TeamSize",
    "SelfFloor",
  ]);
  assert.equal(header.at(-1), "Team Member 9");
  assert.equal(header.length, 13);
  assert.equal(first.length, 13);
});
