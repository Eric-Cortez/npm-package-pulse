// Utility functions for random number and date generation
export function randomNumberBetween(min = 0, max = 1000) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
// Generate a random date before the given starting date
export function getRandomDateBefore(startingDate = new Date()) {
  const randomNumberOfDays = randomNumberBetween(20, 80);
  const randomDate = new Date(
    startingDate - randomNumberOfDays * 24 * 60 * 60 * 1000
  );
  return randomDate;
}
// Generate a random date after the given starting date
export function getRandomDateAfter(startingDate = new Date()) {
  const randomNumberOfDays = randomNumberBetween(1, 19);
  const randomDate = new Date(
    startingDate.getTime() + randomNumberOfDays * 24 * 60 * 60 * 1000
  );
  return randomDate;
}
