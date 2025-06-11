// src/assets/logoMap.js

// Import all your SVG logos (adjust paths/names as needed)
import broncos from './logos/broncos.svg';
import bulldogs from './logos/bulldogs.svg';
import cowboys from './logos/cowboys.svg';
import dolphins from './logos/dolphins.svg';
import dragons from './logos/dragons.svg';
import eels from './logos/eels.svg';
import knights from './logos/knights.svg';
import panthers from './logos/panthers.svg';
import rabbitohs from './logos/rabbitohs.svg';
import raiders from './logos/raiders.svg';
import roosters from './logos/roosters.svg';
import seaeagles from './logos/seaeagles.svg';
import sharks from './logos/sharks.svg';
import storm from './logos/storm.svg';
import tigers from './logos/tigers.svg';
import titans from './logos/titans.svg';
import warriors from './logos/warriors.svg';

const logoMap = {
    "Broncos": broncos,
    "Bulldogs": bulldogs,
    "Cowboys": cowboys,
    "Dolphins": dolphins,
    "Dragons": dragons,
    "Eels": eels,
    "Knights": knights,
    "Panthers": panthers,
    "Rabbitohs": rabbitohs,
    "Raiders": raiders,
    "Roosters": roosters,
    "Sea Eagles": seaeagles,
    "Sharks": sharks,
    "Storm": storm,
    "Wests Tigers": tigers,
    "Titans": titans,
    "Warriors": warriors,
  };

// Function to get logo, provides a default if not found
export const getTeamLogo = (teamName) => {
    // You might need to normalize teamName if it varies slightly
    return logoMap[teamName] || null; // Return null or a default logo path if not found
};