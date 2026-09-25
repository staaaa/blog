const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../public/data/history');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 19 landmark eras with descriptions and context
const ERAS = [
  {
    year: -500,
    filename: 'world_bc500.geojson',
    title: '500 p.n.e. – Starożytność klasyczna',
    epoch: 'Starożytność',
    desc: 'Złoty wiek Aten, powstanie Republiki Rzymskiej, Imperium Achemenidów (Persja) panuje od Egiptu po Indus, w Chinach epoka Stu Szkół Myśli (Konfucjusz).'
  },
  {
    year: -1,
    filename: 'world_bc1.geojson',
    title: '1 p.n.e. – Pax Romana & Dynastia Han',
    epoch: 'Starożytność',
    desc: 'Oktawian August włada Cesarstwem Rzymskim otaczającym Morze Śródziemne. Na Wschodzie chińska Dynastia Han przeżywa szczyt potęgi Jedwabnego Szlaku.'
  },
  {
    year: 500,
    filename: 'world_500.geojson',
    title: '500 n.e. – Upadek Zachodniego Rzymu',
    epoch: 'Wczesne Średniowiecze',
    desc: 'Po upadku Cesarstwa Zachodniorzymskiego rodzą się królestwa barbarzyńskie (Ostrogoci, Wizygoci, Frankowie). Konstantynopol (Bizancjum) trwa jako potęga.'
  },
  {
    year: 1000,
    filename: 'world_1000.geojson',
    title: '1000 n.e. – Milenium & Chrobry',
    epoch: 'Średniowiecze',
    desc: 'Zjazd Gnieźnieński – Polska Bolesława Chrobrego rośnie w siłę. Cesarstwo Ottonów w Europie, kalifaty muzułmańskie, rozkwit Rusi Kijowskiej i Songów w Chinach.'
  },
  {
    year: 1279,
    filename: 'world_1279.geojson',
    title: '1279 n.e. – Imperium Mongolskie',
    epoch: 'Pełne Średniowiecze',
    desc: 'Koblaj-chan zakłada dynastię Yuan. Pax Mongolica łączy Azję i Europę Wschodnią. Polska w rozbiciu dzielnicowym odpiera najazdy tatarskie.'
  },
  {
    year: 1400,
    filename: 'world_1400.geojson',
    title: '1400 n.e. – Unia Polsko-Litewska & Przeddzień Grunwaldu',
    epoch: 'Późne Średniowiecze',
    desc: 'Panowanie Władysława Jagiełły i Jadwigi. Konfrontacja z Zakonem Krzyżackim, Imperium Osmańskie rośnie na Bałkanach, upadek Bizancjum wisi w powietrzu.'
  },
  {
    year: 1492,
    filename: 'world_1492.geojson',
    title: '1492 n.e. – Odkrycie Ameryki & Renesans',
    epoch: 'Wczesna Nowożytność',
    desc: 'Krzysztof Kolumb dociera do Nowego Świata. Koniec Rekonkwisty w Hiszpanii. Rzeczpospolita Jagiellonów staje się mocarstwem Europy Środkowo-Wschodniej.'
  },
  {
    year: 1530,
    filename: 'world_1530.geojson',
    title: '1530 n.e. – Reformacja & Sulejman Wspaniały',
    epoch: 'Nowożytność',
    desc: 'Rozłam w Kościele zachodnim (Luter), Karol V rządzi imperium, w którym słońce nie zachodzi. Złoty wiek Zygmunta I Starego w Polsce. Osmanowie pod Wiedniem (1529).'
  },
  {
    year: 1600,
    filename: 'world_1600.geojson',
    title: '1600 n.e. – Złoty Wiek Rzeczypospolitej',
    epoch: 'Nowożytność',
    desc: 'Rzeczpospolita Obojga Narodów u szczytu potęgi (husaria, dymitriady, wkrótce zdobycie Moskwy). Szogunat Tokugawa w Japonii, Elżbieta I w Anglii.'
  },
  {
    year: 1650,
    filename: 'world_1650.geojson',
    title: '1650 n.e. – Pokój Westfalski & Czas Wojen',
    epoch: 'Nowożytność',
    desc: 'Koniec Wojny Trzydziestoletniej, powstanie Chmielnickiego na Ukrainie, w przededniu szwedzkiego Potopu. Rozkwit monarchii absolutnej we Francji.'
  },
  {
    year: 1700,
    filename: 'world_1700.geojson',
    title: '1700 n.e. – Wielka Wojna Północna',
    epoch: 'Oświecenie',
    desc: 'Piotr I Wielki buduje potęgę Rosji, wojna ze Szwecją Karola XII. Wojna o sukcesję hiszpańską wstrząsa Europą Zachodnią. Słabnąca Rzeczpospolita saska.'
  },
  {
    year: 1783,
    filename: 'world_1783.geojson',
    title: '1783 n.e. – Niepodległość USA & Epoka Rozbiorów',
    epoch: 'Oświecenie',
    desc: 'Traktat paryski uznaje niepodległość Stanów Zjednoczonych. Polska po I rozbiorze (1772) dąży do reform, które zakończą się Konstytucją 3 Maja.'
  },
  {
    year: 1815,
    filename: 'world_1815.geojson',
    title: '1815 n.e. – Kongres Wiedeński & Upadek Napoleona',
    epoch: 'Wiek XIX',
    desc: 'Bitwa pod Waterloo i upadek cesarstwa Napoleona. Święte Przymierze ustala ład w Europie, powstaje zależne od Rosji Królestwo Polskie (Kongresowe).'
  },
  {
    year: 1880,
    filename: 'world_1880.geojson',
    title: '1880 n.e. – Epoka Wiktoriańska & Kolonializm',
    epoch: 'Wiek XIX',
    desc: 'Rewolucja przemysłowa w pełni, zjednoczone Niemcy pod Bismarckiem, Imperium Brytyjskie włada morzami, rozpoczyna się wyścig o Afrykę (Scramble for Africa).'
  },
  {
    year: 1914,
    filename: 'world_1914.geojson',
    title: '1914 n.e. – Wybuch I Wojny Światowej',
    epoch: 'Wiek XX',
    desc: 'Zamach w Sarajewie rozpala Wielką Wojnę. Państwa Ententy (Francja, UK, Rosja) walczą z Państwami Centralnymi (Niemcy, Austro-Węgry, Imperium Osmańskie).'
  },
  {
    year: 1920,
    filename: 'world_1920.geojson',
    title: '1920 n.e. – Odrodzona Polska & Traktat Wersalski',
    epoch: 'Dwudziestolecie',
    desc: 'Polska odzyskuje niepodległość i powstrzymuje Armię Czerwoną w Bitwie Warszawskiej (Cud nad Wisłą). Nowa mapa Europy z republikami narodowymi.'
  },
  {
    year: 1938,
    filename: 'world_1938.geojson',
    title: '1938 n.e. – Przededniu II Wojny Światowej',
    epoch: 'Dwudziestolecie',
    desc: 'Anschluss Austrii, Układ monachijski i rozbiór Czechosłowacji. III Rzesza i militarystyczna Japonia szykują się do globalnego konfliktu.'
  },
  {
    year: 1945,
    filename: 'world_1945.geojson',
    title: '1945 n.e. – Koniec II Wojny Światowej & Początek Zimnej Wojny',
    epoch: 'Współczesność',
    desc: 'Kapitulacja Niemiec i Japonii, konferencja jałtańska i poczdamska, powstanie ONZ. Nowe granice Polski (przesunięcie na zachód), podział Europy żelazną kurtyną.'
  },
  {
    year: 2000,
    filename: 'world_2000.geojson',
    title: '2000 n.e. – Nowe Milenium & Globalizacja',
    epoch: 'Współczesność',
    desc: 'Świat po upadku ZSRR, rozszerzenie NATO, integracja w ramach Unii Europejskiej, rewolucja internetowa i początek XXI wieku.'
  }
];

// EU4 Authentic Country Colors
const EU4_COLORS = {
  // Poland & Lithuania
  'Poland': '#dc4b64',
  'Poland-Lithuania': '#dc4b64',
  'Crown of Poland': '#dc4b64',
  'Polish–Lithuanian Commonwealth': '#dc4b64',
  'Duchy of Warsaw': '#dc4b64',
  'Kingdom of Poland': '#dc4b64',
  'Congress Poland': '#dc4b64',
  'Lithuania': '#524050',
  'Grand Duchy of Lithuania': '#524050',
  'Ruthenia': '#2a52be',
  'Ukraine': '#0057b7',
  'Zaporozhian Cossacks': '#b83b3b',

  // Russia & East
  'Muscovy': '#529452',
  'Russia': '#529452',
  'Russian Empire': '#529452',
  'Novgorod': '#41924b',
  'Kazan': '#a0522d',
  'Crimean Khanate': '#4ea05d', // Vassal of Ottomans, or Tartar yellow-green
  'Golden Horde': '#b07d2b',
  'Mongol Empire': '#b07d2b',
  'Yuan': '#b07d2b',
  'Soviet Union': '#cc1111',
  'Russian SFSR': '#cc1111',

  // Western Europe
  'France': '#27419e',
  'Kingdom of France': '#27419e',
  'French Empire': '#27419e',
  'England': '#b82222',
  'Great Britain': '#b82222',
  'United Kingdom': '#b82222',
  'United Kingdom of Great Britain and Ireland': '#b82222',
  'Scotland': '#f0ee67',
  'Ireland': '#008751',
  'Castile': '#f0c832',
  'Spain': '#f0c832',
  'Kingdom of Spain': '#f0c832',
  'Crown of Aragon': '#9a2020',
  'Aragon': '#9a2020',
  'Portugal': '#007f50',
  'Kingdom of Portugal': '#007f50',
  'Netherlands': '#f28500',
  'Dutch Republic': '#f28500',
  'Belgium': '#e8a938',
  'Burgundy': '#781d42',

  // Central Europe
  'Holy Roman Empire': '#8b8589',
  'Austria': '#f5f5f5',
  'Austrian Empire': '#f5f5f5',
  'Austria-Hungary': '#f5f5f5',
  'Archduchy of Austria': '#f5f5f5',
  'Prussia': '#394a59',
  'Kingdom of Prussia': '#394a59',
  'Brandenburg': '#394a59',
  'German Empire': '#333b40',
  'Germany': '#333b40',
  'Weimar Republic': '#333b40',
  'Bohemia': '#a36735',
  'Kingdom of Bohemia': '#a36735',
  'Hungary': '#753835',
  'Kingdom of Hungary': '#753835',
  'Bavaria': '#4585c5',
  'Saxony': '#638b58',
  'Switzerland': '#bd4747',

  // Scandinavia
  'Sweden': '#325ea8',
  'Denmark': '#8b263e',
  'Denmark-Norway': '#8b263e',
  'Norway': '#8f3030',
  'Finland': '#5b92e5',

  // South Europe & Mediterranean
  'Ottoman Empire': '#4ea05d',
  'Ottoman Emp.': '#4ea05d',
  'Ottomans': '#4ea05d',
  'Turkey': '#ba2b2b',
  'Venice': '#3cb4b4',
  'Republic of Venice': '#3cb4b4',
  'Genoa': '#87afc7',
  'Papal States': '#f7f4d0',
  'Naples': '#a0522d',
  'Two Sicilies': '#a0522d',
  'Kingdom of Italy': '#2e8b57',
  'Italy': '#2e8b57',
  'Piedmont-Sardinia': '#4169e1',
  'Sardinia-Piedmont': '#4169e1',
  'Byzantine Empire': '#8a1844',
  'Roman Empire': '#9b2335',
  'Greece': '#2980b9',
  'Serbia': '#bd3a42',
  'Bulgaria': '#388e3c',
  'Romania': '#d4ac0d',

  // Middle East & North Africa
  'Mamluk Sultanate': '#bba020',
  'Mamluks': '#bba020',
  'Egypt': '#e0ab34',
  'Safavid Empire': '#208060',
  'Persia': '#208060',
  'Iran': '#208060',
  'Achaemenid Empire': '#9b59b6',
  'Arabian Caliphate': '#196f3d',
  'Abbasid Caliphate': '#196f3d',
  'Umayyad Caliphate': '#27ae60',
  'Morocco': '#c28b38',
  'Algeria': '#229954',
  'Tunisia': '#d98880',
  'Libya': '#52be80',

  // Asia
  'Ming': '#e26a2c',
  'Ming Dynasty': '#e26a2c',
  'Qing': '#328ca8',
  'Qing Dynasty': '#328ca8',
  'China': '#de2910',
  'Han Dynasty': '#d4ac0d',
  'Tang Dynasty': '#b8860b',
  'Song Dynasty': '#c0392b',
  'Japan': '#a82b2b',
  'Tokugawa Shogunate': '#a82b2b',
  'Korea': '#4477aa',
  'Joseon': '#4477aa',
  'Mughal Empire': '#397839',
  'Mughals': '#397839',
  'Delhi Sultanate': '#7b68ee',
  'Vijayanagar': '#e67e22',
  'British Raj': '#b82222',
  'India': '#ff9933',

  // Americas & Colonies
  'United States': '#3465a4',
  'United States of America': '#3465a4',
  'Canada': '#cf3030',
  'Mexico': '#2d7f36',
  'Brazil': '#2e7d32',
  'Argentina': '#75aadb',
  'Inca Empire': '#d48817',
  'Aztec Empire': '#b83928',
  'Australia': '#1b3b6f',
  'Belgian Congo': '#e8a938'
};

// EU4 Religion Colors
const RELIGION_COLORS = {
  'Katolicyzm': '#e6ca65',
  'Protestantyzm': '#2f70af',
  'Kalwinizm / Reformacja': '#45b3e0',
  'Prawosławie': '#b87333',
  'Koptyzm': '#1abc9c',
  'Sunnizm': '#27ae60',
  'Szyizm': '#c0392b',
  'Ibadyzm': '#8e44ad',
  'Hinduizm': '#9b59b6',
  'Buddyzm': '#e67e22',
  'Szintoizm': '#e84393',
  'Konfucjanizm / Taoizm': '#d4ac0d',
  'Tengryzm': '#5dade2',
  'Zaratusztrianizm': '#e74c3c',
  'Judaizm': '#2471a3',
  'Pogaństwo / Szamanizm': '#7f8c8d'
};

// Hash fallback for consistent pleasing EU4 colors
function generateEU4HashColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  const s = 45 + (Math.abs(hash >> 3) % 35); // 45-80% saturation
  const l = 40 + (Math.abs(hash >> 6) % 25); // 40-65% lightness
  return hslToHex(h, s, l);
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function getEU4CountryColor(name) {
  if (!name) return '#7f8c8d';
  if (EU4_COLORS[name]) return EU4_COLORS[name];
  for (const [key, color] of Object.entries(EU4_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
      return color;
    }
  }
  return generateEU4HashColor(name);
}

// Major historical facts, rulers, religion, population estimation per country/region and era
function enrichFeature(name, subjecto, year) {
  const normName = (name || '').trim();
  const normSubject = (subjecto || '').trim();

  let isSubject = false;
  let overlord = null;
  let status = 'Niepodległe państwo';

  // Check subject/vassal relationship
  if (normSubject && normSubject !== normName && !normSubject.includes('Terra Incognita')) {
    isSubject = true;
    overlord = normSubject;
    status = `Podległe (Senior: ${normSubject})`;
  }

  // Common historic subjects not always explicitly tagged in raw GIS
  if (year >= 1517 && year < 1867 && (normName.includes('Mamluk') || normName.includes('Egypt'))) {
    isSubject = true;
    overlord = 'Ottoman Empire';
    status = 'Ejalet Imperium Osmańskiego';
  } else if (year >= 1882 && year < 1922 && normName.includes('Egypt')) {
    isSubject = true;
    overlord = 'United Kingdom of Great Britain and Ireland';
    status = 'Protektorat brytyjski';
  } else if (year >= 1475 && year < 1774 && normName.includes('Crimean')) {
    isSubject = true;
    overlord = 'Ottoman Empire';
    status = 'Wasal Imperium Osmańskiego';
  } else if (year === 1914 && (normName.includes('Poland') || normName.includes('Kingdom of Poland') || normName.includes('Warsaw'))) {
    isSubject = true;
    overlord = 'Russian Empire';
    status = 'Zabór rosyjski (Kraj Przywiślański)';
  } else if (year === 1815 && normName.includes('Kingdom of Poland')) {
    isSubject = true;
    overlord = 'Russian Empire';
    status = 'Królestwo Polskie w unii z Rosją';
  } else if (year >= 1858 && year < 1947 && (normName.includes('India') || normName.includes('Bengal') || normName.includes('Mughal') && year >= 1857)) {
    isSubject = true;
    overlord = 'United Kingdom of Great Britain and Ireland';
    status = 'Brytyjski Raj (Korona Brytyjska)';
  } else if (year >= 1908 && year < 1960 && normName.includes('Congo')) {
    isSubject = true;
    overlord = 'Belgium';
    status = 'Kolonia Belgijska';
  } else if (year >= 1884 && year <= 1918 && (normName.includes('German') && (normName.includes('Africa') || normName.includes('Guinea') || normName.includes('Togo') || normName.includes('Kamerun')))) {
    isSubject = true;
    overlord = 'German Empire';
    status = 'Kolonia Cesarstwa Niemieckiego';
  } else if (normName.includes('Virgin Islands') || normName.includes('Puerto Rico') && year >= 1898) {
    isSubject = true;
    overlord = 'United States';
    status = 'Terytorium zależne USA';
  } else if (normName.includes('Dutch East Indies') || (normName.includes('Indonesia') && year < 1945)) {
    isSubject = true;
    overlord = 'Netherlands';
    status = 'Holenderskie Indie Wschodnie';
  }

  // EU4 colors
  const countryColor = getEU4CountryColor(normName);
  const overlordColor = overlord ? getEU4CountryColor(overlord) : countryColor;

  // Key requirement:
  // "jeżeli państwo istniało ale było pod czyims władaniem (np mamelucy pod osmanami, egipt pod UK)
  // to niech granica tego panstwa i nazwa się wyswietla, ale niech mają kolor swojego overlorda"
  const fillColor = isSubject ? overlordColor : countryColor;

  // Ruler & Religion & Population estimation
  const meta = getHistoricalMeta(normName, overlord, year);

  return {
    name: normName,
    overlord: overlord,
    isSubject: isSubject,
    status: status,
    countryColor: countryColor,
    overlordColor: overlordColor,
    fillColor: fillColor,
    ruler: meta.ruler,
    religion: meta.religion,
    religionColor: RELIGION_COLORS[meta.religion] || '#7f8c8d',
    population: meta.population,
    populationFormatted: meta.populationFormatted,
    capital: meta.capital,
    allies: meta.allies,
    enemies: meta.enemies
  };
}

function getHistoricalMeta(name, overlord, year) {
  const ln = name.toLowerCase();
  let ruler = 'Władca lokalny';
  let religion = 'Katolicyzm';
  let popK = 1500; // in thousands
  let capital = 'Stolica';
  let allies = [];
  let enemies = [];

  // Religion detection
  if (ln.includes('poland') || ln.includes('lithuania') || ln.includes('polska') || ln.includes('spain') || ln.includes('castile') || ln.includes('france') || ln.includes('austria') || ln.includes('portugal') || ln.includes('italy') || ln.includes('papal') || ln.includes('venice') || ln.includes('hungary') || ln.includes('bohemia') && year < 1415 || ln.includes('bavaria') || ln.includes('ireland') || ln.includes('belgium')) {
    religion = 'Katolicyzm';
  } else if (ln.includes('england') && year > 1534 || ln.includes('great britain') || ln.includes('prussia') && year > 1525 || ln.includes('sweden') && year > 1527 || ln.includes('denmark') && year > 1536 || ln.includes('saxony') && year > 1530 || ln.includes('norway') && year > 1536 || ln.includes('united states')) {
    religion = 'Protestantyzm';
  } else if (ln.includes('netherlands') && year > 1570 || ln.includes('scotland') && year > 1560 || ln.includes('switzerland') && year > 1530) {
    religion = 'Kalwinizm / Reformacja';
  } else if (ln.includes('russia') || ln.includes('muscovy') || ln.includes('novgorod') || ln.includes('byzant') || ln.includes('greece') || ln.includes('serbia') || ln.includes('bulgaria') || ln.includes('romania') || ln.includes('ruthenia') || ln.includes('kiev')) {
    religion = 'Prawosławie';
  } else if (ln.includes('ottoman') || ln.includes('turk') || ln.includes('mamluk') || ln.includes('egypt') || ln.includes('morocco') || ln.includes('algeria') || ln.includes('tunis') || ln.includes('arab') || ln.includes('caliphate') || ln.includes('songhai') || ln.includes('mali') || ln.includes('kazan') || ln.includes('crimea') || ln.includes('mughal') || ln.includes('delhi')) {
    religion = 'Sunnizm';
  } else if (ln.includes('safavid') || ln.includes('persia') && year > 1501 || ln.includes('iran')) {
    religion = 'Szyizm';
  } else if (ln.includes('oman')) {
    religion = 'Ibadyzm';
  } else if (ln.includes('india') || ln.includes('vijayanagar') || ln.includes('maratha') || ln.includes('rajput')) {
    religion = 'Hinduizm';
  } else if (ln.includes('china') || ln.includes('ming') || ln.includes('qing') || ln.includes('han') || ln.includes('tang') || ln.includes('song') || ln.includes('korea') || ln.includes('joseon')) {
    religion = 'Konfucjanizm / Taoizm';
  } else if (ln.includes('japan') || ln.includes('tokugawa') || ln.includes('ashikaga')) {
    religion = 'Szintoizm';
  } else if (ln.includes('mongol') || ln.includes('tibet') || ln.includes('burma') || ln.includes('siam') || ln.includes('thailand') || ln.includes('ceylon') || ln.includes('sri lanka')) {
    religion = 'Buddyzm';
  } else if (ln.includes('ethiopia') || ln.includes('abyssinia') || ln.includes('armenia')) {
    religion = 'Koptyzm';
  } else if (year < 300 || ln.includes('pagan') || ln.includes('trib') || ln.includes('inca') || ln.includes('aztec') || ln.includes('aboriginal') || ln.includes('iroquois') || ln.includes('sioux')) {
    religion = 'Pogaństwo / Szamanizm';
  }

  // Country details by year
  if (ln.includes('poland') || ln.includes('lithuania') || ln.includes('polska')) {
    capital = year >= 1596 ? 'Warszawa' : 'Kraków';
    if (year === -500 || year === -1) {
      ruler = 'Kultury łużyckie / plemiona germańskie i słowiańskie';
      popK = 350;
    } else if (year === 500) {
      ruler = 'Wczesnosłowiańskie związki plemienne';
      popK = 500;
    } else if (year === 1000) {
      ruler = 'Bolesław I Chrobry (Piast)';
      popK = 1200;
      allies = ['Holy Roman Empire', 'Hungary'];
    } else if (year === 1279) {
      ruler = 'Bolesław V Wstydliwy / Leszek Czarny';
      popK = 2100;
    } else if (year === 1400) {
      ruler = 'Władysław II Jagiełło & św. Jadwiga Andegaweńska';
      popK = 3800;
      allies = ['Lithuania'];
      enemies = ['Teutonic Order'];
    } else if (year === 1492) {
      ruler = 'Jan I Olbracht (Jagiellon)';
      popK = 6500;
      allies = ['Lithuania', 'Hungary', 'Bohemia'];
      enemies = ['Ottoman Empire', 'Crimean Khanate'];
    } else if (year === 1530) {
      ruler = 'Zygmunt I Stary & Bona Sforza';
      popK = 7500;
      allies = ['Lithuania'];
    } else if (year === 1600) {
      ruler = 'Zygmunt III Waza';
      popK = 10500;
      allies = ['Holy Roman Empire', 'Austria'];
      enemies = ['Sweden', 'Ottoman Empire', 'Russia'];
    } else if (year === 1650) {
      ruler = 'Jan II Kazimierz Waza';
      popK = 11000;
      enemies = ['Zaporozhian Cossacks', 'Russia', 'Sweden'];
    } else if (year === 1700) {
      ruler = 'August II Mocny (Wettyn)';
      popK = 9000;
      allies = ['Russia', 'Denmark'];
      enemies = ['Sweden'];
    } else if (year === 1783) {
      ruler = 'Stanisław August Poniatowski';
      popK = 7800;
      enemies = ['Russian Empire', 'Prussia', 'Austria'];
    } else if (year === 1815) {
      ruler = 'Aleksander I Romanow (Król Polski)';
      popK = 3300;
    } else if (year === 1914) {
      ruler = 'Mikołaj II Romanow (zabór rosyjski)';
      popK = 12500;
    } else if (year === 1920) {
      ruler = 'Józef Piłsudski (Naczelnik Państwa)';
      popK = 27000;
      allies = ['France', 'United Kingdom', 'Romania'];
      enemies = ['Soviet Union'];
    } else if (year === 1938) {
      ruler = 'Ignacy Mościcki (Prezydent RP) / Edward Rydz-Śmigły';
      popK = 34800;
      allies = ['France', 'Romania', 'United Kingdom'];
      enemies = ['Germany', 'Soviet Union'];
    } else if (year === 1945) {
      ruler = 'Bolesław Bierut (KRN)';
      popK = 23900;
      allies = ['Soviet Union'];
    } else if (year === 2000) {
      ruler = 'Aleksander Kwaśniewski (Prezydent)';
      popK = 38250;
      allies = ['United States', 'Germany', 'France', 'United Kingdom'];
    }
  } else if (ln.includes('france')) {
    capital = 'Paryż';
    if (year === 1400) { ruler = 'Karol VI Szalony'; popK = 16000; enemies = ['England', 'Burgundy']; }
    else if (year === 1492) { ruler = 'Karol VIII Walezjusz'; popK = 15000; }
    else if (year === 1530) { ruler = 'Franciszek I'; popK = 16500; allies = ['Ottoman Empire']; enemies = ['Austria', 'Spain']; }
    else if (year === 1600) { ruler = 'Henryk IV Burbon'; popK = 18500; }
    else if (year === 1650) { ruler = 'Ludwik XIV (Kardynał Mazarin)'; popK = 19000; enemies = ['Spain']; }
    else if (year === 1700) { ruler = 'Ludwik XIV (Król Słońce)'; popK = 21500; allies = ['Spain']; enemies = ['Great Britain', 'Austria', 'Netherlands']; }
    else if (year === 1783) { ruler = 'Ludwik XVI'; popK = 25000; allies = ['United States', 'Spain']; enemies = ['Great Britain']; }
    else if (year === 1815) { ruler = 'Napoleon Bonaparte / Ludwik XVIII'; popK = 30000; enemies = ['United Kingdom', 'Prussia', 'Austria', 'Russia']; }
    else if (year === 1914) { ruler = 'Raymond Poincaré'; popK = 39600; allies = ['United Kingdom', 'Russian Empire', 'Serbia', 'Belgium']; enemies = ['German Empire', 'Austria-Hungary', 'Ottoman Empire']; }
    else if (year === 1938) { ruler = 'Albert Lebrun / Édouard Daladier'; popK = 41500; allies = ['United Kingdom', 'Poland']; enemies = ['Germany']; }
    else if (year === 1945) { ruler = 'Charles de Gaulle'; popK = 40500; allies = ['United States', 'United Kingdom', 'Soviet Union']; enemies = ['Germany', 'Japan']; }
    else if (year === 2000) { ruler = 'Jacques Chirac'; popK = 60900; allies = ['United States', 'Germany', 'United Kingdom', 'Poland']; }
    else { ruler = 'Monarchia Francuska'; popK = 12000; }
  } else if (ln.includes('england') || ln.includes('great britain') || ln.includes('united kingdom')) {
    capital = 'Londyn';
    if (year === 1492) { ruler = 'Henryk VII Tudor'; popK = 3800; }
    else if (year === 1530) { ruler = 'Henryk VIII Tudor'; popK = 4200; }
    else if (year === 1600) { ruler = 'Elżbieta I Tudor'; popK = 5500; enemies = ['Spain']; }
    else if (year === 1650) { ruler = 'Oliver Cromwell (Protektorat)'; popK = 6000; }
    else if (year === 1700) { ruler = 'Wilhelm III Orański'; popK = 7200; allies = ['Austria', 'Netherlands']; enemies = ['France', 'Spain']; }
    else if (year === 1783) { ruler = 'Jerzy III Hanowerski'; popK = 12500; enemies = ['United States', 'France', 'Spain']; }
    else if (year === 1815) { ruler = 'Jerzy III (Książę Regent)'; popK = 18000; allies = ['Prussia', 'Austria', 'Russia']; enemies = ['France']; }
    else if (year === 1880) { ruler = 'Królowa Wiktoria'; popK = 35000; }
    else if (year === 1914) { ruler = 'Jerzy V Windsor'; popK = 46000; allies = ['France', 'Russian Empire', 'Serbia', 'Belgium']; enemies = ['German Empire', 'Austria-Hungary', 'Ottoman Empire']; }
    else if (year === 1938) { ruler = 'Jerzy VI Windsor / Neville Chamberlain'; popK = 47500; allies = ['France', 'Poland']; enemies = ['Germany']; }
    else if (year === 1945) { ruler = 'Winston Churchill / Clement Attlee'; popK = 49000; allies = ['United States', 'Soviet Union', 'France', 'Poland']; enemies = ['Germany', 'Japan']; }
    else if (year === 2000) { ruler = 'Elżbieta II Windsor / Tony Blair'; popK = 58900; allies = ['United States', 'France', 'Germany', 'Poland']; }
    else { ruler = 'Korona Angielska'; popK = 4000; }
  } else if (ln.includes('ottoman') || (ln.includes('turk') && !ln.includes('caicos'))) {
    capital = 'Stambuł (Konstantynopol)';
    if (year === 1492) { ruler = 'Bajazyd II'; popK = 12000; enemies = ['Mamluks', 'Venice', 'Hungary']; }
    else if (year === 1530) { ruler = 'Sulejman I Wspaniały'; popK = 16000; allies = ['France']; enemies = ['Austria', 'Spain', 'Holy Roman Empire', 'Safavid Empire']; }
    else if (year === 1600) { ruler = 'Mehmed III'; popK = 22000; enemies = ['Austria', 'Poland-Lithuania', 'Safavid Empire']; }
    else if (year === 1650) { ruler = 'Mehmed IV (Sułtanat Kobiet)'; popK = 24000; enemies = ['Venice', 'Poland-Lithuania']; }
    else if (year === 1700) { ruler = 'Mustafa II'; popK = 23000; enemies = ['Austria', 'Russia', 'Venice', 'Poland-Lithuania']; }
    else if (year === 1815) { ruler = 'Mahmud II'; popK = 25000; }
    else if (year === 1914) { ruler = 'Mehmed V (Młodoturcy)'; popK = 18500; allies = ['German Empire', 'Austria-Hungary']; enemies = ['United Kingdom', 'France', 'Russian Empire']; }
    else { ruler = 'Sułtan Osmański'; popK = 15000; }
  } else if ((ln.includes('russia') || ln.includes('muscovy')) && !ln.includes('prussia')) {
    capital = year >= 1712 && year < 1918 ? 'Petersburg' : 'Moskwa';
    if (year === 1492) { ruler = 'Iwan III Srogi'; popK = 6000; enemies = ['Lithuania', 'Golden Horde']; }
    else if (year === 1530) { ruler = 'Wasyl III Rurykowicz'; popK = 7500; enemies = ['Poland-Lithuania', 'Crimean Khanate']; }
    else if (year === 1600) { ruler = 'Borys Godunow'; popK = 9500; enemies = ['Poland-Lithuania', 'Sweden']; }
    else if (year === 1650) { ruler = 'Aleksy I Michajłowicz'; popK = 11000; enemies = ['Poland-Lithuania']; }
    else if (year === 1700) { ruler = 'Piotr I Wielki'; popK = 14500; allies = ['Poland-Lithuania', 'Denmark']; enemies = ['Sweden', 'Ottoman Empire']; }
    else if (year === 1783) { ruler = 'Katarzyna II Wielka'; popK = 27000; allies = ['Austria']; enemies = ['Ottoman Empire']; }
    else if (year === 1815) { ruler = 'Aleksander I Pawłowicz'; popK = 43000; allies = ['United Kingdom', 'Prussia', 'Austria']; enemies = ['France']; }
    else if (year === 1914) { ruler = 'Mikołaj II Romanow'; popK = 166000; allies = ['France', 'United Kingdom', 'Serbia']; enemies = ['German Empire', 'Austria-Hungary', 'Ottoman Empire']; }
    else if (year === 1920) { ruler = 'Włodzimierz Lenin'; popK = 135000; enemies = ['Poland']; }
    else if (year === 1938 || year === 1945) { ruler = 'Józef Stalin'; popK = 170000; allies = year === 1945 ? ['United States', 'United Kingdom', 'France'] : []; enemies = ['Germany', 'Japan']; }
    else if (year === 2000) { ruler = 'Władimir Putin'; popK = 146000; }
    else { ruler = 'Car Wszechrusi'; popK = 10000; }
  } else if (ln.includes('austria') || ln.includes('habsburg')) {
    capital = 'Wiedeń';
    if (year === 1492) { ruler = 'Maksymilian I Habsburg'; popK = 3500; }
    else if (year === 1530) { ruler = 'Ferdynand I Habsburg'; popK = 4500; enemies = ['Ottoman Empire']; }
    else if (year === 1600) { ruler = 'Rudolf II Habsburg'; popK = 6500; enemies = ['Ottoman Empire']; }
    else if (year === 1700) { ruler = 'Leopold I Habsburg'; popK = 8500; allies = ['Great Britain', 'Netherlands']; enemies = ['France', 'Spain']; }
    else if (year === 1783) { ruler = 'Józef II Habsburg'; popK = 22000; enemies = ['Ottoman Empire']; }
    else if (year === 1815) { ruler = 'Franciszek I Habsburg / Klemens von Metternich'; popK = 28000; allies = ['United Kingdom', 'Prussia', 'Russia']; enemies = ['France']; }
    else if (year === 1914) { ruler = 'Franciszek Józef I Habsburg'; popK = 52000; allies = ['German Empire', 'Ottoman Empire', 'Bulgaria']; enemies = ['Russian Empire', 'Serbia', 'France', 'United Kingdom', 'Italy']; }
    else { ruler = 'Cesarz Austriacki'; popK = 7000; }
  } else if (ln.includes('prussia') || ln.includes('brandenburg') || ln.includes('german')) {
    capital = 'Berlin';
    if (year === 1600) { ruler = 'Joachim Fryderyk Hohenzollern'; popK = 1200; }
    else if (year === 1700) { ruler = 'Fryderyk I Hohenzollern (Król w Prusach)'; popK = 2500; }
    else if (year === 1783) { ruler = 'Fryderyk II Wielki'; popK = 5800; }
    else if (year === 1815) { ruler = 'Fryderyk Wilhelm III'; popK = 10500; allies = ['United Kingdom', 'Austria', 'Russia']; enemies = ['France']; }
    else if (year === 1880) { ruler = 'Wilhelm I Hohenzollern / Otto von Bismarck'; popK = 45000; }
    else if (year === 1914) { ruler = 'Wilhelm II Hohenzollern'; popK = 67000; allies = ['Austria-Hungary', 'Ottoman Empire', 'Bulgaria']; enemies = ['France', 'United Kingdom', 'Russian Empire', 'Belgium']; }
    else if (year === 1938) { ruler = 'Adolf Hitler'; popK = 79000; allies = ['Italy', 'Japan']; enemies = ['United Kingdom', 'France', 'Poland', 'Soviet Union', 'United States']; }
    else if (year === 2000) { ruler = 'Gerhard Schröder'; popK = 82200; allies = ['United States', 'France', 'United Kingdom', 'Poland']; }
    else { ruler = 'Władca Niemiecki'; popK = 5000; }
  } else if (ln.includes('spain') || ln.includes('castile')) {
    capital = 'Madryt';
    if (year === 1492) { ruler = 'Izabela I Kastylijska & Ferdynand II Aragoński (Królowie Katoliccy)'; popK = 6500; enemies = ['Granada']; }
    else if (year === 1530) { ruler = 'Karol I Habsburg (Cesarz Karol V)'; popK = 8000; enemies = ['France', 'Ottoman Empire']; }
    else if (year === 1600) { ruler = 'Filip III Habsburg'; popK = 8500; enemies = ['England', 'Dutch Republic']; }
    else if (year === 1700) { ruler = 'Karol II Habsburg (Ostatni z dynastii)'; popK = 7500; }
    else if (year === 1938) { ruler = 'II Republika / gen. Francisco Franco'; popK = 25500; }
    else if (year === 2000) { ruler = 'Jan Karol I Burbon / José María Aznar'; popK = 40500; }
    else { ruler = 'Monarchia Hiszpańska'; popK = 7000; }
  } else if (ln.includes('egypt') || ln.includes('mamluk')) {
    capital = 'Kair';
    if (year === 1492) { ruler = 'Kaitbaj (Sułtan Mameluków)'; popK = 4500; enemies = ['Ottoman Empire']; }
    else if (year === 1530 || year === 1600 || year === 1650) { ruler = 'Pasza osmański (pod zwierzchnictwem Stambułu)'; popK = 5000; }
    else if (year === 1815 || year === 1880) { ruler = 'Muhammad Ali (Kedyw Egiptu)'; popK = 6800; }
    else if (year === 1914) { ruler = 'Husajn Kamil (Sułtan pod protektoratem brytyjskim)'; popK = 12700; allies = ['United Kingdom']; }
    else if (year === 2000) { ruler = 'Hosni Mubarak'; popK = 67000; }
    else { ruler = 'Władca Egiptu'; popK = 4000; }
  } else if (/\b(united states|u\.s\.a)\b/i.test(ln) || (/\busa\b/i.test(ln) && !ln.includes('hausa') && !ln.includes('calusa'))) {
    capital = 'Waszyngton';
    if (year === 1783) { ruler = 'George Washington / Kongres Kontynentalny'; popK = 3200; allies = ['France', 'Spain']; enemies = ['Great Britain']; }
    else if (year === 1815) { ruler = 'James Madison'; popK = 8400; enemies = ['United Kingdom']; }
    else if (year === 1880) { ruler = 'Rutherford B. Hayes'; popK = 50100; }
    else if (year === 1914) { ruler = 'Woodrow Wilson'; popK = 99100; }
    else if (year === 1938) { ruler = 'Franklin D. Roosevelt'; popK = 129800; }
    else if (year === 1945) { ruler = 'Harry S. Truman'; popK = 139900; allies = ['United Kingdom', 'Soviet Union', 'France']; enemies = ['Germany', 'Japan']; }
    else if (year === 2000) { ruler = 'Bill Clinton'; popK = 282000; allies = ['United Kingdom', 'France', 'Germany', 'Poland', 'Japan']; }
    else { ruler = 'Rząd USA'; popK = 50000; }
  } else if (/\b(china|chinese|ming|qing)\b/i.test(ln) && !ln.includes('chinantla') && !ln.includes('mingin') && !ln.includes('cochin')) {
    capital = 'Pekin';
    if (year === 1492) { ruler = 'Cesarz Hongzhi (Dynastia Ming)'; popK = 110000; }
    else if (year === 1600) { ruler = 'Cesarz Wanli (Dynastia Ming)'; popK = 150000; }
    else if (year === 1700) { ruler = 'Cesarz Kangxi (Dynastia Qing)'; popK = 200000; }
    else if (year === 1783) { ruler = 'Cesarz Qianlong (Dynastia Qing)'; popK = 300000; }
    else if (year === 1914) { ruler = 'Yuan Shikai (Republika Chińska)'; popK = 430000; }
    else if (year === 1945) { ruler = 'Czang Kaj-szek / Mao Zedong'; popK = 500000; }
    else if (year === 2000) { ruler = 'Jiang Zemin'; popK = 1260000; }
    else { ruler = 'Syn Niebios (Cesarz Chin)'; popK = 80000; }
  } else if (ln.includes('holy roman')) {
    capital = 'Frankfurt / Wiedeń';
    if (year === 1492) { ruler = 'Maksymilian I Habsburg'; popK = 15000; }
    else if (year === 1600) { ruler = 'Rudolf II Habsburg'; popK = 20000; }
    else { ruler = 'Cesarz Rzymsko-Niemiecki'; popK = 16000; }
  } else if (ln.includes('japan')) {
    capital = year >= 1868 ? 'Tokio' : 'Kioto';
    if (year === 1600) { ruler = 'Tokugawa Ieyasu (Szogunat Edo)'; popK = 18000; }
    else if (year === 1914) { ruler = 'Cesarz Taishō'; popK = 52000; allies = ['United Kingdom', 'France', 'Russian Empire']; enemies = ['German Empire']; }
    else if (year === 1938 || year === 1945) { ruler = 'Cesarz Hirohito (Shōwa) / gen. Hideki Tōjō'; popK = 72000; allies = ['Germany', 'Italy']; enemies = ['United States', 'United Kingdom', 'China', 'Soviet Union']; }
    else if (year === 2000) { ruler = 'Cesarz Akihito / Keizō Obuchi'; popK = 126800; allies = ['United States']; }
    else { ruler = 'Cesarz / Szogun'; popK = 12000; }
  } else if (/\b(mughal|delhi sultanate)\b/i.test(ln)) {
    capital = 'Delhi / Agra';
    if (year === 1600) { ruler = 'Akbar Wielki'; popK = 110000; }
    else if (year === 1700) { ruler = 'Aurangzeb'; popK = 150000; }
    else { ruler = 'Wielki Mogoł'; popK = 80000; }
  } else if (/\b(safavid|persia|iran)\b/i.test(ln)) {
    capital = 'Isfahan';
    if (year === 1600) { ruler = 'Abbas I Wielki'; popK = 10000; enemies = ['Ottoman Empire']; }
    else if (year === 1700) { ruler = 'Sultan Husajn'; popK = 11000; }
    else { ruler = 'Szach Perski'; popK = 8000; }
  } else if (/\b(mongol|golden horde|yuan)\b/i.test(ln)) {
    capital = 'Karakorum / Dadu (Pekin)';
    if (year === 1279) { ruler = 'Kubłaj-chan (Wielki Chan)'; popK = 70000; }
    else { ruler = 'Wielki Chan'; popK = 25000; }
  } else if (/\b(caliphate|abbasid|umayyad|fatimid)\b/i.test(ln) && !ln.includes('hafsid') && !ln.includes('zayyanid') && !ln.includes('wattasid')) {
    capital = 'Bagdad / Damaszek';
    ruler = 'Kalif (Wódz Wiernych)'; popK = 35000;
  } else if (/\b(byzant|eastern roman)\b/i.test(ln)) {
    capital = 'Konstantynopol';
    if (year === 500) { ruler = 'Anastazjusz I'; popK = 22000; }
    else if (year === 1000) { ruler = 'Bazyli II Bułgarobójca'; popK = 18000; }
    else if (year === 1400) { ruler = 'Manuel II Paleolog'; popK = 4000; enemies = ['Ottoman Empire']; }
    else { ruler = 'Bazyleus (Cesarz Rzymian)'; popK = 15000; }
  } else if (/\b(portugal)\b/i.test(ln)) {
    capital = 'Lizbona';
    if (year === 1492) { ruler = 'Jan II Doskonały'; popK = 1500; }
    else if (year === 1530) { ruler = 'Jan III Pobożny'; popK = 1800; }
    else if (year === 1700) { ruler = 'Piotr II Spokojny'; popK = 2200; }
    else if (year === 1914) { ruler = 'Manuel II / I Republika'; popK = 5900; }
    else { ruler = 'Monarchia Portugalska'; popK = 2000; }
  } else if (/\b(sweden)\b/i.test(ln)) {
    capital = 'Sztokholm';
    if (year === 1600) { ruler = 'Karol IX Waza'; popK = 1200; enemies = ['Poland-Lithuania']; }
    else if (year === 1650) { ruler = 'Królowa Krystyna Waza'; popK = 1500; }
    else if (year === 1700) { ruler = 'Karol XII Waza'; popK = 1800; enemies = ['Russia', 'Poland-Lithuania', 'Denmark']; }
    else if (year === 1914) { ruler = 'Gustaw V'; popK = 5600; }
    else { ruler = 'Król Szwecji'; popK = 1500; }
  } else if (/\b(netherlands|dutch)\b/i.test(ln) && !ln.includes('indies')) {
    capital = 'Amsterdam';
    if (year === 1600) { ruler = 'Maurycy Orański (Stadhouder)'; popK = 1600; enemies = ['Spain']; }
    else if (year === 1650) { ruler = 'Jan de Witt (Wielki Pensjonariusz)'; popK = 1900; }
    else if (year === 1700) { ruler = 'Wilhelm III Orański'; popK = 2100; }
    else if (year === 1914) { ruler = 'Królowa Wilhelmina'; popK = 6200; }
    else { ruler = 'Republika Zjednoczonych Prowincji'; popK = 2000; }
  } else {
    // Dynamic generation based on hash and year for small/tribal entities
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const mod = Math.abs(hash);
    const basePop = 20 + (mod % 280); // 20k to 300k
    const growth = year < 0 ? 0.3 : year < 1500 ? 0.6 : year < 1900 ? 1.0 : 2.5;
    popK = Math.max(15, Math.round(basePop * growth));
    ruler = `Władca (${name})`;
  }

  // Round population to nearest 1,000 (meaning popK is already in thousands, so pop is popK * 1000)
  const fullPop = popK * 1000;
  const popFormatted = fullPop >= 1000000 
    ? `${(fullPop / 1000000).toFixed(1)} mln (~${popK.toLocaleString('pl-PL')} tys.)`
    : `~${popK.toLocaleString('pl-PL')} tys. (${fullPop.toLocaleString('pl-PL')})`;

  return {
    ruler,
    religion,
    population: fullPop,
    populationFormatted: popFormatted,
    capital,
    allies,
    enemies
  };
}

function roundCoords(coords) {
  if (typeof coords[0] === 'number') {
    return [Math.round(coords[0] * 1000) / 1000, Math.round(coords[1] * 1000) / 1000];
  }
  return coords.map(roundCoords);
}

async function processEra(era) {
  console.log(`Processing: ${era.title} (${era.filename})...`);
  const url = `https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/${era.filename}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  const geojson = await res.json();

  let featureId = 1;
  geojson.features = geojson.features.filter(f => f.geometry && f.geometry.coordinates).map(f => {
    const rawProps = f.properties || {};
    const name = rawProps.NAME || rawProps.name || rawProps.COUNTRY || 'Nieznany region';
    const subjecto = rawProps.SUBJECTO || rawProps.subjecto || rawProps.PARTOF || null;

    const enriched = enrichFeature(name, subjecto, era.year);
    f.id = featureId++;
    f.properties = {
      id: f.id,
      ...enriched,
      originalAbbr: rawProps.ABBREVN || null
    };

    if (f.geometry && f.geometry.coordinates) {
      f.geometry.coordinates = roundCoords(f.geometry.coordinates);
    }
    return f;
  });

  const outPath = path.join(OUTPUT_DIR, era.filename);
  fs.writeFileSync(outPath, JSON.stringify(geojson));
  const stat = fs.statSync(outPath);
  console.log(`Saved ${era.filename}: ${Math.round(stat.size / 1024)} KB, ${geojson.features.length} features.`);
}

async function main() {
  console.log(`Starting fetch and enrich for ${ERAS.length} historical eras...`);
  for (const era of ERAS) {
    try {
      await processEra(era);
    } catch (err) {
      console.error(`Error on era ${era.year}:`, err.message);
    }
  }

  // Write index.json
  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(ERAS, null, 2));
  console.log(`Wrote index.json with ${ERAS.length} eras.`);
  console.log('Finished successfully!');
}

main();
