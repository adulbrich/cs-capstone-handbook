// The partner tools pages' table previews, as `{ header, rows }`
// (table-view.mjs). Pure: no DOM, no I/O.

/**
 * The roster's teams in file order, from parseRoster's students: `table`
 * gives each team its size and members, and `noGroup` counts the students
 * in no group. A team of one is a team: its partner still rates it.
 */
export function rosterTeams(students) {
  const teams = new Map();
  let noGroup = 0;
  for (const student of students) {
    if (student.team === "") {
      noGroup += 1;
      continue;
    }
    const members = teams.get(student.team) ?? [];
    members.push(student.name || student.email);
    teams.set(student.team, members);
  }
  return {
    noGroup,
    table: {
      header: ["Team", "Size", "Members"],
      rows: [...teams].map(([team, members]) => [
        team,
        String(members.length),
        members.join("; "),
      ]),
    },
    teams: teams.size,
  };
}

/**
 * The contact rows (buildPartnerContacts) as one line per team: the team
 * and every partner address it sends the survey to.
 */
export function partnersTable(rows) {
  const teams = new Map();
  for (const row of rows) {
    teams.set(row.Team, [...(teams.get(row.Team) ?? []), row.Email]);
  }
  return {
    header: ["Team", "Partners"],
    rows: [...teams].map(([team, emails]) => [team, emails.join("; ")]),
  };
}

/** The roster teams with no survey (buildPartnerContacts' `noPartner`). */
export const noPartnerTable = (noPartner) => ({
  header: ["Team", "Why"],
  rows: noPartner.map(({ reason, team }) => [team, reason]),
});

/** The partners with more than one team (buildPartnerContacts' `shared`). */
export const sharedTable = (shared) => ({
  header: ["Partner", "Teams"],
  rows: shared.map(({ email, teams }) => [email, teams.join("; ")]),
});
