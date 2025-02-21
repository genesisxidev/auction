export const formatAddress = (address) => {
  if (!address) return;
  return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
};

export const isNotEmptyString = (value) => {
  return value !== "" && value !== null && value !== undefined;
};

export const convertUnixTimestampToLocalDate = (timestamp) => {
  if (!timestamp) {
    return 0;
  }
  // Convert BigInt or number to milliseconds
  const numericTimestamp =
    typeof timestamp === "bigint" ? Number(timestamp) : Number(timestamp);

  // Create a Date object (convert seconds to milliseconds)
  const date = new Date(numericTimestamp * 1000);

  // Format the date as "YYYY-MM-DDTHH:mm:ss" in the local time zone
  const localDateString = date.toLocaleString("sv-SE").replace(" ", "T");

  return localDateString;
};