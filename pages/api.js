export async function matchRequest(id) {
  try {
    const response = await fetch(`/api/API?id=${id}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  return null;
}
