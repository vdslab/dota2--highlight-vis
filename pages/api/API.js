export default async function handler(req, res) {
  const { id } = req.query;
  const apiKey = process.env.API_KEY;

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
      Authorization: `Bearer ${apiKey}`,
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
    res.status(200).json(result);
  } else {
    res.status(response.status);
  }
}
