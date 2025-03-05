export const generateUID = () => {
  const characters = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const timestamp = Date.now().toString(36).slice(-4);
  let id = timestamp;

  while (id.length < 8) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters[randomIndex];
  }

  return "#" + id.toUpperCase();
};
