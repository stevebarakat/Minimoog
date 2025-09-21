export const getFilterTypeLabel = (type: string) => {
  switch (type) {
    case "huovilainen":
      return "Huovilainen";
    case "stilson":
      return "Stilson";
    case "improved":
      return "Improved";
    case "microtracker":
      return "Microtracker";
    case "simplified":
      return "Simplified";
    case "oberheim":
      return "Oberheim";
    case "musicdsp":
      return "MusicDSP";
    case "krajeski":
      return "Krajeski";
    default:
      return type;
  }
};
