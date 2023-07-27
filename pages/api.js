export async function matchRequest(id) {
  const access_token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJodHRwczovL3N0ZWFtY29tbXVuaXR5LmNvbS9vcGVuaWQvaWQvNzY1NjExOTgwNDA5NzYzMTYiLCJ1bmlxdWVfbmFtZSI6IkJsdWVrb29wYSIsIlN1YmplY3QiOiI5YmFlYzA5YS0wNTk4LTQyOWItOWI2ZS1kNTBkMjE0ZDllNTQiLCJTdGVhbUlkIjoiODA3MTA1ODgiLCJuYmYiOjE2NjAxOTA0MTcsImV4cCI6MTY5MTcyNjQxNywiaWF0IjoxNjYwMTkwNDE3LCJpc3MiOiJodHRwczovL2FwaS5zdHJhdHouY29tIn0.24rFe6QiDLahL6qP-uZvXUs-OEE2GbooWFJXZyOXRCE";
  const query = `
    {
      match(id:${id}){
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
          logo
        }
        direTeam{
          name
          logo
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
    return result;
  }
  return null;
}

export async function youtubeRequest(findText) {
  const params = new URLSearchParams({
    key: "AIzaSyBDqOadbmZbbHJ42OMv7wNmKsXT9uAE9AQ",
    q: findText,
    part: "snippet",
    type: "video",
    maxResults: 3
  });
  const url = `https://www.googleapis.com/youtube/v3/search?${params}`;
  const response = await fetch(url);
  console.log(response);
  if (response.status == 200) {
    const result = await response.json();
    return result;
  }
  return null;
}