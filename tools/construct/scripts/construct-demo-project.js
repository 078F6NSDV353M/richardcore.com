export async function createDemoProjectSnapshot() {
  const response =
    await fetch("./demo.construct");

  if (!response.ok) {
    throw new Error(
      "Failed to load demo project."
    );
  }

  return await response.json();
}