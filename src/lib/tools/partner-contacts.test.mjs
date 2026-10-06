import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePartnerSheet } from "../partner-sheet.mjs";
import { parseCsv } from "./csv.mjs";
import {
  buildPartnerContacts,
  partnerContactsCsv,
} from "./partner-contacts.mjs";
import { parseRoster } from "./roster.mjs";

const ROSTER = [
  "name,canvas_user_id,user_id,login_id,sections,group_name,canvas_group_id,group_id",
  '"Lovelace, Ada",101,0,ada@example.edu,CS 461 001,Analytical  Engine,0,0',
  '"Babbage, Charles",102,0,charles@example.edu,CS 461 001,Analytical  Engine,0,0',
  '"Hopper, Grace",201,0,grace@example.edu,CS 461 001,Compilers,0,0',
  '"Noether, Emmy",401,0,emmy@example.edu,CS 461 001,Rings,0,0',
  '"Turing, Alan",301,0,alan@example.edu,CS 461 001,,0,0',
  '"Shannon, Claude",501,0,claude@example.edu,CS 461 001,Channels,0,0',
].join("\r\n");

const SHEET = [
  "Canvas Group Name,Team Size,Student Proposer,Project Partner / Mentor Email,Project Partner / Mentor Name,Additional Contact Details,Notes",
  'analytical engine,2,,"countess@example.org; menabrea@example.org",Two partners,,',
  "Compilers,1,,countess@example.org,The Countess,,",
  "Rings,1,Emmy Noether,mentor@example.edu,A Mentor,,",
  "Compilers,1,,other@example.org,Someone Else,,",
  "Channels,1,,,,,",
  "Cryptography,3,,bletchley@example.org,Not placed,,",
  ",,,,,,",
].join("\r\n");

const build = () =>
  buildPartnerContacts(parseRoster(ROSTER), parsePartnerSheet(SHEET), {
    MidtermCloseDate: "Friday of week 6",
  });

test("the sheet reads the staff columns, splits addresses, and skips rows with no team", () => {
  const sheet = parsePartnerSheet(SHEET);
  assert.equal(sheet.length, 6);
  assert.deepEqual(sheet[0], {
    emails: ["countess@example.org", "menabrea@example.org"],
    team: "analytical engine",
  });
  assert.deepEqual(sheet[4].emails, []);
});

test("a sheet missing a column it reads stops with the column named", () => {
  assert.throws(
    () => parsePartnerSheet("Canvas Group Name,Partner Email\nA,a@example.org"),
    /Project Partner \/ Mentor Email/
  );
  assert.throws(() => parsePartnerSheet(""), /empty/);
});

test("one row per partner, under the roster's spelling of the team", () => {
  const { rows } = build();
  assert.deepEqual(rows, [
    {
      Email: "countess@example.org",
      MidtermCloseDate: "Friday of week 6",
      Team: "Analytical  Engine",
    },
    {
      Email: "menabrea@example.org",
      MidtermCloseDate: "Friday of week 6",
      Team: "Analytical  Engine",
    },
    {
      Email: "countess@example.org",
      MidtermCloseDate: "Friday of week 6",
      Team: "Compilers",
    },
    // The sheet's second Compilers row is a co-partner.
    {
      Email: "other@example.org",
      MidtermCloseDate: "Friday of week 6",
      Team: "Compilers",
    },
    {
      Email: "mentor@example.edu",
      MidtermCloseDate: "Friday of week 6",
      Team: "Rings",
    },
  ]);
});

test("gaps are reported: no partner, not on the roster, listed twice, shared", () => {
  const { noPartner, notOnRoster, repeated, shared } = build();
  assert.deepEqual(noPartner, [
    { reason: "no partner email in the sheet", team: "Channels" },
  ]);
  assert.deepEqual(notOnRoster, ["Cryptography"]);
  assert.deepEqual(repeated, ["Compilers"]);
  assert.deepEqual(shared, [
    {
      email: "countess@example.org",
      teams: ["Analytical  Engine", "Compilers"],
    },
  ]);
});

test("a roster team missing from the sheet gets no row and is reported", () => {
  const { noPartner, rows } = buildPartnerContacts(
    parseRoster(ROSTER),
    parsePartnerSheet(SHEET.split("\r\n").slice(0, 2).join("\r\n"))
  );
  assert.deepEqual(
    noPartner.map((entry) => [entry.team, entry.reason]),
    [
      ["Compilers", "not in the partner sheet"],
      ["Rings", "not in the partner sheet"],
      ["Channels", "not in the partner sheet"],
    ]
  );
  assert.equal(rows.length, 2);
});

test("the contact list's columns are Email, then the survey's fields", () => {
  const { rows } = build();
  const [header, first] = parseCsv(
    partnerContactsCsv(rows, ["Team", "MidtermCloseDate"])
  );
  assert.deepEqual(header, ["Email", "Team", "MidtermCloseDate"]);
  assert.deepEqual(first, [
    "countess@example.org",
    "Analytical  Engine",
    "Friday of week 6",
  ]);
});
