export async function matchRequest(id) {
  const access_token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTdWJqZWN0IjoiOWJhZWMwOWEtMDU5OC00MjliLTliNmUtZDUwZDIxNGQ5ZTU0IiwiU3RlYW1JZCI6IjgwNzEwNTg4IiwibmJmIjoxNjkwNTcwMjg2LCJleHAiOjE3MjIxMDYyODYsImlhdCI6MTY5MDU3MDI4NiwiaXNzIjoiaHR0cHM6Ly9hcGkuc3RyYXR6LmNvbSJ9.o1ej08QdcZUX_RBhamMo78f_zFZaazLRN-2X7d3A8fE";
  const query = `
    {
      match(id:${id}){
        id
        league{
          displayName
        }
        series{
          matches{
            id
          }
        }
        radiantTeam{
          name
          id
        }
        direTeam{
          name
          id
        }
        didRadiantWin
        winRates
        radiantNetworthLeads
        radiantExperienceLeads
        players{
          isRadiant
          hero{
            displayName
            shortName
          }
          playbackData{
            streakEvents{
              time
              heroId
              type
              value
            }
          }
        }
      }
    }`;

  const response = await fetch("https://api.stratz.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  if (response.status == 200) {
    const result = await response.json();
    const data = result.data.match;
    const game =
      data.series.matches
        .map((e) => e.id)
        .sort((a, b) => a - b)
        .indexOf(data.id) + 1;
    data.game = game;
    return result;
  }
  return null;
}
