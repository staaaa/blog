const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../public/data/history');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 46 Comprehensive historical eras from Antiquity to Modern Day
const ERAS = [
  {
    year: -1000,
    filename: 'world_bc1000.geojson',
    title: '1000 p.n.e. – Epoka Żelaza & Królestwo Dawida',
    epoch: 'Starożytność',
    desc: 'Rozkwit zjednoczonego królestwa Izraela (Dawid i Salomon), fenicka ekspansja handlowa w basenie Morza Śródziemnego, Nowe Państwo w Egipcie, dynastia Zhou w Chinach.'
  },
  {
    year: -700,
    filename: 'world_bc700.geojson',
    title: '700 p.n.e. – Imperium Asyryjskie & Narodziny Rzymu',
    epoch: 'Starożytność',
    desc: 'Imperium Nowoasyryjskie dominuje na Bliskim Wschodzie (Sennacheryb). W Italii początki Rzymu (753 p.n.e.), w Grecji powstają pierwsze polis i poematy Homera.'
  },
  {
    year: -500,
    filename: 'world_bc500.geojson',
    title: '500 p.n.e. – Starożytność Klasyczna & Persja',
    epoch: 'Starożytność',
    desc: 'Złoty wiek Aten, powstanie Republiki Rzymskiej, Imperium Achemenidów (Persja) panuje od Egiptu po Indus, w Chinach epoka Stu Szkół Myśli (Konfucjusz).'
  },
  {
    year: -400,
    filename: 'world_bc400.geojson',
    title: '400 p.n.e. – Wojna Peloponeska & Złoty Wiek Grecji',
    epoch: 'Starożytność',
    desc: 'Koniec wojny peloponeskiej między Atenami i Spartą. Sokrates i Platon kładą podwaliny zachodniej filozofii. W Chinach trwa epoka Walczących Królestw.'
  },
  {
    year: -323,
    filename: 'world_bc323.geojson',
    title: '323 p.n.e. – Śmierć Aleksandra Wielkiego & Hellenizm',
    epoch: 'Starożytność',
    desc: 'Aleksander Macedoński podbija Persję i dociera do Indii. Po jego śmierci imperium dzielą diadochowie (Ptolemeusze w Egipcie, Seleucydzi w Azji).'
  },
  {
    year: -300,
    filename: 'world_bc300.geojson',
    title: '300 p.n.e. – Imperium Maurjów & Wzrost Rzymu',
    epoch: 'Starożytność',
    desc: 'Cesarz Aśoka i imperium Maurjów w Indiach, Republika Rzymska podbija Półwysep Apeniński (wojny samnickie), wielka Biblioteka Aleksandryjska.'
  },
  {
    year: -200,
    filename: 'world_bc200.geojson',
    title: '200 p.n.e. – Wojny Punickie & Zjednoczenie Chin',
    epoch: 'Starożytność',
    desc: 'Rzym pokonuje Kartaginę Hannibala w II wojnie punickiej (Scypion Afrykański). W Chinach dynastia Han utrwala zjednoczone imperium po upadku Qin.'
  },
  {
    year: -100,
    filename: 'world_bc100.geojson',
    title: '100 p.n.e. – Schyłek Republiki Rzymskiej & Cezar',
    epoch: 'Starożytność',
    desc: 'Narodziny Juliusza Cezara, reformy wojskowe Mariusza, kryzys republiki rzymskiej. Rozkwit Jedwabnego Szlaku łączącego Chiny dynastii Han z Europą.'
  },
  {
    year: -1,
    filename: 'world_bc1.geojson',
    title: '1 p.n.e. – Pax Romana & Dynastia Han',
    epoch: 'Starożytność',
    desc: 'Oktawian August włada Cesarstwem Rzymskim otaczającym Morze Śródziemne. Na Wschodzie chińska Dynastia Han przeżywa szczyt potęgi Jedwabnego Szlaku.'
  },
  {
    year: 100,
    filename: 'world_100.geojson',
    title: '100 n.e. – Szczyt Cesarstwa Rzymskiego (Trajan)',
    epoch: 'Starożytność',
    desc: 'Cesarstwo Rzymskie osiąga maksymalny zasięg terytorialny pod rządami Trajana (podbój Dacji, Mezopotamii, limes germański). Apogeum pokoju rzymskiego.'
  },
  {
    year: 200,
    filename: 'world_200.geojson',
    title: '200 n.e. – Dynastia Sewerów & Trzy Królestwa',
    epoch: 'Starożytność',
    desc: 'Septymiusz Sewer rządzi Rzymem. W Chinach upadek dynastii Han po powstaniu Żółtych Turbanów i początek legendarnej epoki Trzech Królestw (Wei, Shu, Wu).'
  },
  {
    year: 300,
    filename: 'world_300.geojson',
    title: '300 n.e. – Tetrarchia Dioklecjana',
    epoch: 'Późna Starożytność',
    desc: 'Dioklecjan stabilizuje imperium wprowadzając tetrarchię. Wkrótce Konstantyn Wielki legalizuje chrześcijaństwo (Edykt Mediolański 313).'
  },
  {
    year: 400,
    filename: 'world_400.geojson',
    title: '400 n.e. – Wędrówka Ludów & Podział Cesarstwa',
    epoch: 'Późna Starożytność',
    desc: 'Ostateczny podział imperium na Cesarstwo Zachodnie i Wschodnie (395). Masowe migracje Gotów, Wandalów i Hunów pod wodzą Attyli wstrząsają Europą.'
  },
  {
    year: 500,
    filename: 'world_500.geojson',
    title: '500 n.e. – Upadek Zachodniego Rzymu',
    epoch: 'Wczesne Średniowiecze',
    desc: 'Po upadku Cesarstwa Zachodniorzymskiego rodzą się królestwa barbarzyńskie (Ostrogoci, Wizygoci, Frankowie Chlodwiga). Konstantynopol (Bizancjum) trwa jako potęga.'
  },
  {
    year: 600,
    filename: 'world_600.geojson',
    title: '600 n.e. – Przeddzień Islamu & Bizancjum Herakliusza',
    epoch: 'Wczesne Średniowiecze',
    desc: 'Wyczerpująca wojna między Bizancjum a perskim imperium Sasanidów. Słowianie zasiedlają Europę Środkową i Bałkany. W Mekce działa prorok Mahomet.'
  },
  {
    year: 700,
    filename: 'world_700.geojson',
    title: '700 n.e. – Kalifat Umajjadów & Podbój Hiszpanii',
    epoch: 'Wczesne Średniowiecze',
    desc: 'Gwałtowna ekspansja muzułmańska: Umajjadzi podbijają Afrykę Północną i Półwysep Iberyjski (Al-Andalus). W Chinach złoty wiek dynastii Tang.'
  },
  {
    year: 800,
    filename: 'world_800.geojson',
    title: '800 n.e. – Koronacja Karola Wielkiego',
    epoch: 'Średniowiecze',
    desc: 'Karol Wielki koronowany w Rzymie na cesarza odnowionego Cesarstwa Zachodniego. W Bagdadzie złoty wiek Haruna ar-Raszida, początki Rusi Kijowskiej.'
  },
  {
    year: 900,
    filename: 'world_900.geojson',
    title: '900 n.e. – Najazdy Wikingów & Państwo Polan',
    epoch: 'Średniowiecze',
    desc: 'Ekspansja wikingów w Anglii, Francji i na Rusi. Upadek Państwa Wielkomorawskiego. Plemiona Polan jednoczą ziemie nad Wartą pod wodzą pierwszych Piastów.'
  },
  {
    year: 1000,
    filename: 'world_1000.geojson',
    title: '1000 n.e. – Milenium & Chrobry',
    epoch: 'Średniowiecze',
    desc: 'Zjazd Gnieźnieński – Polska Bolesława Chrobrego rośnie w siłę. Cesarstwo Ottonów w Europie, kalifaty muzułmańskie, rozkwit Rusi Kijowskiej i Songów w Chinach.'
  },
  {
    year: 1100,
    filename: 'world_1100.geojson',
    title: '1100 n.e. – I Wyprawa Krzyżowa',
    epoch: 'Średniowiecze',
    desc: 'Rycerstwo europejskie zdobywa Jerozolimę (1099) i zakłada państwa krzyżowe na Bliskim Wschodzie. W Polsce panuje Władysław Herman i Bolesław Krzywousty.'
  },
  {
    year: 1200,
    filename: 'world_1200.geojson',
    title: '1200 n.e. – Przeddzień Inwazji Mongołów & IV Krucjata',
    epoch: 'Średniowiecze',
    desc: 'Czwarta krucjata zdobywa i łupi Konstantynopol. Czyngis-chan jednoczy plemiona Wielkiego Stepu. Polska w okresie rozbicia dzielnicowego.'
  },
  {
    year: 1279,
    filename: 'world_1279.geojson',
    title: '1279 n.e. – Imperium Mongolskie & Yuan',
    epoch: 'Pełne Średniowiecze',
    desc: 'Kubłaj-chan zakłada dynastię Yuan po podboju Songów. Pax Mongolica łączy Azję i Europę Wschodnią. Polska w rozbiciu dzielnicowym odbudowuje się po najazdach.'
  },
  {
    year: 1300,
    filename: 'world_1300.geojson',
    title: '1300 n.e. – Zjednoczenie Polski & Łokietek',
    epoch: 'Późne Średniowiecze',
    desc: 'Władysław Łokietek jednoczy rozdarte dzielnice Polski. Niewola awiniońska papieży, Osman I zakłada Imperium Osmańskie w Anatolii.'
  },
  {
    year: 1400,
    filename: 'world_1400.geojson',
    title: '1400 n.e. – Unia Polsko-Litewska & Przeddzień Grunwaldu',
    epoch: 'Późne Średniowiecze',
    desc: 'Panowanie Władysława Jagiełły i Jadwigi. Konfrontacja z Zakonem Krzyżackim, Imperium Osmańskie rośnie na Bałkanach, podboje Tamerlana w Azji.'
  },
  {
    year: 1492,
    filename: 'world_1492.geojson',
    title: '1492 n.e. – Odkrycie Ameryki & Renesans',
    epoch: 'Wczesna Nowożytność',
    desc: 'Krzysztof Kolumb dociera do Nowego Świata. Koniec Rekonkwisty w Hiszpanii. Rzeczpospolita Jagiellonów staje się mocarstwem Europy Środkowo-Wschodniej.'
  },
  {
    year: 1500,
    filename: 'world_1500.geojson',
    title: '1500 n.e. – Początek Nowożytności & Wielkie Odkrycia',
    epoch: 'Nowożytność',
    desc: 'Wyprawy Vasco da Gamy do Indii i Cabrala do Brazylii. Wojny włoskie, rozkwit dojrzałego renesansu (Leonardo da Vinci, Michał Anioł). Jagiellonowie na 3 tronach.'
  },
  {
    year: 1530,
    filename: 'world_1530.geojson',
    title: '1530 n.e. – Reformacja & Sulejman Wspaniały',
    epoch: 'Nowożytność',
    desc: 'Rozłam w Kościele zachodnim (Luter), Karol V rządzi imperium Habsburgów, Złoty wiek Zygmunta I Starego w Polsce (hołd pruski 1525). Osmanowie pod Wiedniem (1529).'
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
    title: '1650 n.e. – Pokój Westfalski & Powstanie Chmielnickiego',
    epoch: 'Nowożytność',
    desc: 'Koniec Wojny Trzydziestoletniej, wybuch powstania Chmielnickiego na Ukrainie, w przededniu szwedzkiego Potopu. Rozkwit monarchii absolutnej we Francji.'
  },
  {
    year: 1700,
    filename: 'world_1700.geojson',
    title: '1700 n.e. – Wielka Wojna Północna',
    epoch: 'Oświecenie',
    desc: 'Piotr I Wielki buduje potęgę Rosji, starcie ze Szwecją Karola XII. Wojna o sukcesję hiszpańską w Europie Zachodniej. Kryzys Rzeczypospolitej czasów saskich.'
  },
  {
    year: 1715,
    filename: 'world_1715.geojson',
    title: '1715 n.e. – Schyłek Króla Słońce & Pokój w Utrechcie',
    epoch: 'Oświecenie',
    desc: 'Śmierć Ludwika XIV we Francji. Traktat w Utrechcie umacnia Wielką Brytanię. Wzrost militaryzmu Prus pod Fryderykiem Wilhelmem I. Sejm Niemy w Polsce (1717).'
  },
  {
    year: 1783,
    filename: 'world_1783.geojson',
    title: '1783 n.e. – Niepodległość USA & Epoka Rozbiorów',
    epoch: 'Oświecenie',
    desc: 'Traktat paryski uznaje niepodległość Stanów Zjednoczonych. Polska po I rozbiorze (1772) dąży do reform, które zakończą się Konstytucją 3 Maja.'
  },
  {
    year: 1800,
    filename: 'world_1800.geojson',
    title: '1800 n.e. – Epoka Napoleońska',
    epoch: 'Wiek XIX',
    desc: 'Napoleon Bonaparte pierwszym konsulem po zamachu stanu. Zwycięstwo pod Marengo, Legiony Polskie we Włoszech generała Dąbrowskiego, upadek I Rzeczypospolitej.'
  },
  {
    year: 1815,
    filename: 'world_1815.geojson',
    title: '1815 n.e. – Kongres Wiedeński & Upadek Napoleona',
    epoch: 'Wiek XIX',
    desc: 'Bitwa pod Waterloo i upadek cesarstwa Napoleona. Święte Przymierze ustala ład w Europie, powstaje zależne od Rosji Królestwo Polskie (Kongresowe).'
  },
  {
    year: 1878,
    filename: 'world_1878.geojson',
    title: '1878 n.e. – Kongres Berliński & Wyzwolenie Bałkanów',
    epoch: 'Wiek XIX',
    desc: 'Bismarck gospodarzem kongresu po wojnie rosyjsko-tureckiej. Niepodległość Serbii, Czarnogóry i Rumunii, autonomia Bułgarii. Zjednoczone Cesarstwo Niemieckie.'
  },
  {
    year: 1880,
    filename: 'world_1880.geojson',
    title: '1880 n.e. – Epoka Wiktoriańska & Kolonializm',
    epoch: 'Wiek XIX',
    desc: 'Rewolucja przemysłowa w pełni, Imperium Brytyjskie włada morzami, rozpoczyna się wyścig o Afrykę (Scramble for Africa). Autonomia Galicyjska w zaborze austriackim.'
  },
  {
    year: 1900,
    filename: 'world_1900.geojson',
    title: '1900 n.e. – Belle Époque & Nowy Wiek',
    epoch: 'Wiek XX',
    desc: 'Wystawa światowa w Paryżu, powstanie bokserów w Chinach, wojna burska. Początek ery elektryczności, kinematografu i rodzącego się nowoczesnego nacjonalizmu.'
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
    title: '1920 n.e. – Odrodzona Polska & Bitwa Warszawska',
    epoch: 'Dwudziestolecie',
    desc: 'Polska odzyskuje niepodległość i powstrzymuje Armię Czerwoną w Bitwie Warszawskiej (Cud nad Wisłą). Nowa mapa Europy z traktatu wersalskiego.'
  },
  {
    year: 1930,
    filename: 'world_1930.geojson',
    title: '1930 n.e. – Wielki Kryzys & Cień Faszyzmu',
    epoch: 'Dwudziestolecie',
    desc: 'Światowy kryzys gospodarczy po krachu na Wall Street. Narastanie ruchów totalitarnych w Niemczech (NSDAP) i ZSRR (stalinizm). Rządy sanacji w Polsce.'
  },
  {
    year: 1938,
    filename: 'world_1938.geojson',
    title: '1938 n.e. – Przeddzień II Wojny Światowej',
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
    year: 1960,
    filename: 'world_1960.geojson',
    title: '1960 n.e. – Rok Afryki & Apogeum Zimnej Wojny',
    epoch: 'Współczesność',
    desc: '17 państw afrykańskich ogłasza niepodległość. Wyścig zbrojeń i podbój kosmosu (Sputnik, Apollo), budowa Muru Berlińskiego, kryzys kubański.'
  },
  {
    year: 1994,
    filename: 'world_1994.geojson',
    title: '1994 n.e. – Rozpad ZSRR & Nowy Ład Światowy',
    epoch: 'Współczesność',
    desc: 'Koniec Zimnej Wojny i upadek Związku Radzieckiego. Odrodzona III Rzeczpospolita i państwa postkomunistyczne na drodze do integracji europejskiej i NATO.'
  },
  {
    year: 2000,
    filename: 'world_2000.geojson',
    title: '2000 n.e. – Nowe Milenium & Globalizacja',
    epoch: 'Współczesność',
    desc: 'Świat po upadku ZSRR, rozszerzenie NATO (Polska 1999), integracja w ramach Unii Europejskiej, rewolucja internetowa i początek XXI wieku.'
  },
  {
    year: 2010,
    filename: 'world_2010.geojson',
    title: '2010 n.e. – Świat Współczesny',
    epoch: 'Współczesność',
    desc: 'Cyfrowa rewolucja smartfonów, Polska w strefie Schengen i sercu Unii Europejskiej, multipolarny układ sił na arenie międzynarodowej.'
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
  'Crimean Khanate': '#4ea05d',
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
  'Spain': '#e6b800',
  'Castile': '#e6b800',
  'Aragon': '#cf3f3f',
  'Portugal': '#357a38',

  // Central Europe & HRE
  'Holy Roman Empire': '#8291a5',
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

function generateEU4HashColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  const s = 45 + (Math.abs(hash >> 3) % 30);
  const l = 40 + (Math.abs(hash >> 6) % 25);
  return hslToHex(h, s, l);
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function getEU4CountryColor(name) {
  if (!name) return '#6c7a89';
  if (EU4_COLORS[name]) return EU4_COLORS[name];

  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(EU4_COLORS)) {
    if (lower === key.toLowerCase() || lower.includes(key.toLowerCase())) {
      return color;
    }
  }
  return generateEU4HashColor(name);
}

function normalizeCountryName(rawName) {
  if (!rawName) return 'Nieznane terytorium';
  const clean = String(rawName).trim();
  
  if (/^poland/i.test(clean) || clean === 'Poland-Lithuania' || clean === 'Polish-Lithuanian Commonwealth') {
    return 'Poland';
  }
  if (/^russia/i.test(clean) || clean === 'Russian Empire') return 'Russian Empire';
  if (/^muscovy/i.test(clean)) return 'Muscovy';
  if (/^france/i.test(clean)) return 'France';
  if (/^england/i.test(clean)) return 'England';
  if (/^great britain/i.test(clean) || clean === 'United Kingdom') return 'Great Britain';
  if (/^ottoman/i.test(clean)) return 'Ottoman Empire';
  if (/^spain/i.test(clean) || clean === 'Castile') return 'Spain';
  if (/^portugal/i.test(clean)) return 'Portugal';
  if (/^austria/i.test(clean)) return 'Austria';
  if (/^prussia/i.test(clean)) return 'Prussia';
  if (/^sweden/i.test(clean)) return 'Sweden';
  if (/^denmark/i.test(clean)) return 'Denmark';
  if (/^netherlands/i.test(clean) || clean === 'Dutch Republic') return 'Netherlands';
  if (/^byzant/i.test(clean)) return 'Byzantine Empire';
  if (/^roman empire/i.test(clean)) return 'Roman Empire';
  if (/^united states/i.test(clean) || clean === 'U.S.A.' || clean === 'USA') return 'United States';
  if (/^china/i.test(clean)) return 'China';
  if (/^japan/i.test(clean)) return 'Japan';
  
  return clean;
}

function enrichFeature(name, subjecto, year) {
  const normName = normalizeCountryName(name);
  let isSubject = false;
  let overlord = null;
  let status = 'Niepodległe państwo';

  if (subjecto && typeof subjecto === 'string' && subjecto.trim().length > 0 && subjecto.toLowerCase() !== 'independent' && subjecto.toLowerCase() !== 'none' && subjecto.toLowerCase() !== 'null') {
    isSubject = true;
    overlord = normalizeCountryName(subjecto);
    status = `Kraj zależny / Wasal (${overlord})`;
  } else if (normName.includes('Mamluk') && year >= 1517) {
    isSubject = true;
    overlord = 'Ottoman Empire';
    status = 'Ejalet Osmański (Mamelucy)';
  } else if (normName.includes('Crimean Khanate') && year >= 1475 && year <= 1774) {
    isSubject = true;
    overlord = 'Ottoman Empire';
    status = 'Chanat Krymski – Wasal Porty Osmańskiej';
  } else if (normName.includes('Prussia') && year >= 1525 && year < 1657) {
    isSubject = true;
    overlord = 'Poland';
    status = 'Prusy Książęce – Lennik Rzeczypospolitej';
  } else if (normName.includes('Courland') && year >= 1561 && year < 1795) {
    isSubject = true;
    overlord = 'Poland';
    status = 'Księstwo Kurlandii – Wasal Rzeczypospolitej';
  } else if (normName.includes('Moldavia') && year >= 1538 && year < 1859) {
    isSubject = true;
    overlord = 'Ottoman Empire';
    status = 'Hospodarstwo Mołdawskie – Wasal Osmanów';
  } else if (normName.includes('Wallachia') && year >= 1417 && year < 1859) {
    isSubject = true;
    overlord = 'Ottoman Empire';
    status = 'Hospodarstwo Wołoskie – Wasal Osmanów';
  } else if (normName.includes('Transylvania') && year >= 1570 && year < 1699) {
    isSubject = true;
    overlord = 'Ottoman Empire';
    status = 'Księstwo Siedmiogrodu – Wasal Osmanów';
  } else if (year >= 1882 && year < 1922 && (normName.includes('Egypt') || normName.includes('Sudan'))) {
    isSubject = true;
    overlord = 'Great Britain';
    status = 'Protektorat Brytyjski (Egipt)';
  } else if (year === 1880 && normName.includes('Poland')) {
    isSubject = true;
    overlord = 'Russian Empire';
    status = 'Zabór rosyjski (Kraj Przywiślański)';
  } else if (year === 1815 && normName.includes('Kingdom of Poland')) {
    isSubject = true;
    overlord = 'Russian Empire';
    status = 'Królestwo Polskie w unii z Rosją';
  } else if (year >= 1858 && year < 1947 && (normName.includes('India') || normName.includes('Bengal') || normName.includes('Mughal') && year >= 1857)) {
    isSubject = true;
    overlord = 'Great Britain';
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

  const countryColor = getEU4CountryColor(normName);
  const overlordColor = overlord ? getEU4CountryColor(overlord) : countryColor;
  const fillColor = isSubject ? overlordColor : countryColor;

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
  let popK = 1500;
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
    capital = year >= 1596 ? 'Warszawa' : (year >= 1038 ? 'Kraków' : 'Gniezno / Poznań');
    if (year <= -1) {
      ruler = 'Kultury łużyckie / przeworskie';
      popK = 350;
    } else if (year < 966) {
      ruler = 'Plemiona słowiańskie (Polanie, Wiślanie)';
      popK = 600;
    } else if (year === 1000) {
      ruler = 'Bolesław I Chrobry (Piast)';
      popK = 1200;
      allies = ['Holy Roman Empire', 'Hungary'];
    } else if (year === 1100) {
      ruler = 'Władysław I Herman / Bolesław III Krzywousty';
      popK = 1500;
      allies = ['Hungary'];
      enemies = ['Holy Roman Empire', 'Bohemia'];
    } else if (year === 1200) {
      ruler = 'Mieszko III Stary / Leszek Biały (Rozbicie Dzielnicowe)';
      popK = 1800;
    } else if (year === 1279) {
      ruler = 'Bolesław V Wstydliwy / Leszek Czarny';
      popK = 2100;
    } else if (year === 1300) {
      ruler = 'Władysław I Łokietek';
      popK = 2500;
      allies = ['Hungary'];
      enemies = ['Teutonic Order', 'Bohemia'];
    } else if (year === 1400) {
      ruler = 'Władysław II Jagiełło & św. Jadwiga Andegaweńska';
      popK = 3800;
      allies = ['Lithuania'];
      enemies = ['Teutonic Order'];
    } else if (year === 1492 || year === 1500) {
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
      enemies = ['Sweden', 'Zaporozhian Cossacks', 'Russia'];
    } else if (year === 1700 || year === 1715) {
      ruler = 'August II Mocny (Wettin)';
      popK = 11500;
      allies = ['Russia', 'Denmark'];
      enemies = ['Sweden'];
    } else if (year === 1783) {
      ruler = 'Stanisław August Poniatowski';
      popK = 8500;
    } else if (year === 1800) {
      ruler = 'Rząd na Emigracji (Tadeusz Kościuszko / gen. J.H. Dąbrowski)';
      popK = 9000;
    } else if (year === 1815) {
      ruler = 'Car Aleksander I (Król Polski) / gen. Józef Zajączek';
      popK = 9800;
    } else if (year === 1878 || year === 1880) {
      ruler = 'Ziemie pod zaborami (Autonomia Galicyjska / Kraj Przywiślański)';
      popK = 18000;
    } else if (year === 1900 || year === 1914) {
      ruler = 'Legiony Polskie / Józef Piłsudski / Roman Dmowski';
      popK = 24000;
    } else if (year === 1920) {
      ruler = 'Józef Piłsudski (Naczelnik) / Wincenty Witos (Premier)';
      popK = 27000;
      allies = ['France', 'Great Britain', 'Romania'];
      enemies = ['Soviet Union'];
    } else if (year === 1930) {
      ruler = 'Ignacy Mościcki (Prezydent) / Józef Piłsudski';
      popK = 32000;
      allies = ['France', 'Romania'];
    } else if (year === 1938) {
      ruler = 'Ignacy Mościcki / marsz. Edward Rydz-Śmigły';
      popK = 35100;
      allies = ['France', 'Great Britain', 'Romania'];
      enemies = ['Germany'];
    } else if (year === 1945) {
      ruler = 'Rząd Tymczasowy (Bolesław Bierut / Edward Osóbka-Morawski)';
      popK = 23900;
      allies = ['Soviet Union'];
    } else if (year === 1960) {
      ruler = 'Władysław Gomułka (I Sekretarz KC PZPR)';
      popK = 29700;
      allies = ['Soviet Union'];
    } else if (year === 1994) {
      ruler = 'Lech Wałęsa (Prezydent RP) / Waldemar Pawlak';
      popK = 38500;
    } else if (year === 2000) {
      ruler = 'Aleksander Kwaśniewski (Prezydent RP) / Jerzy Buzek';
      popK = 38650;
      allies = ['United States', 'Great Britain', 'France', 'Germany'];
    } else if (year === 2010) {
      ruler = 'Bronisław Komorowski (Prezydent RP) / Donald Tusk';
      popK = 38530;
      allies = ['United States', 'Great Britain', 'France', 'Germany'];
    } else {
      ruler = 'Król / Władca Polski';
      popK = 5000;
    }
  } else if (/\b(roman empire|western roman|rome)\b/i.test(ln) && !ln.includes('holy roman')) {
    capital = year >= 330 ? 'Konstantynopol / Mediolan / Rawenna' : 'Rzym';
    if (year <= -500) { ruler = 'Republika Rzymska (Konsulowie)'; popK = 2000; }
    else if (year <= -100) { ruler = 'Konsulowie (Mariusz / Sulla / Senat)'; popK = 15000; }
    else if (year === -1) { ruler = 'Oktawian August (Pierwszy Cesarz)'; popK = 45000; }
    else if (year === 100) { ruler = 'Cesarz Trajan (Optimus Princeps)'; popK = 56000; }
    else if (year === 200) { ruler = 'Septymiusz Sewer'; popK = 52000; }
    else if (year === 300) { ruler = 'Dioklecjan & Maksymian'; popK = 48000; }
    else if (year === 400) { ruler = 'Honoriusz (Zachód) & Arkadiusz (Wschód)'; popK = 38000; }
    else { ruler = 'Cesarz Rzymski'; popK = 35000; }
  } else if (ln.includes('france') || ln.includes('frank')) {
    capital = 'Paryż';
    if (year === 500) { ruler = 'Chlodwig I (Merowing)'; popK = 4500; }
    else if (year === 800) { ruler = 'Karol Wielki (Cesarz Franków)'; popK = 12000; }
    else if (year === 1000) { ruler = 'Robert II Pobożny (Kapetyng)'; popK = 6500; }
    else if (year === 1400) { ruler = 'Karol VI Szalony'; popK = 11000; enemies = ['England']; }
    else if (year === 1492 || year === 1500) { ruler = 'Karol VIII / Ludwik XII'; popK = 15000; }
    else if (year === 1530) { ruler = 'Franciszek I Walezjusz'; popK = 16000; enemies = ['Spain', 'Holy Roman Empire']; }
    else if (year === 1600) { ruler = 'Henryk IV Burbon'; popK = 18500; }
    else if (year === 1650) { ruler = 'Ludwik XIV & kard. Mazarin'; popK = 19500; enemies = ['Spain']; }
    else if (year === 1700 || year === 1715) { ruler = 'Ludwik XIV (Król Słońce)'; popK = 21500; allies = ['Spain']; enemies = ['Great Britain', 'Austria', 'Netherlands']; }
    else if (year === 1783) { ruler = 'Ludwik XVI Burbon'; popK = 26000; allies = ['United States', 'Spain']; enemies = ['Great Britain']; }
    else if (year === 1800) { ruler = 'Napoleon Bonaparte (Pierwszy Konsul)'; popK = 28000; enemies = ['Great Britain', 'Austria', 'Russian Empire']; }
    else if (year === 1815) { ruler = 'Ludwik XVIII Burbon'; popK = 29500; }
    else if (year === 1878 || year === 1880) { ruler = 'Jules Grévy (III Republika)'; popK = 37000; }
    else if (year === 1900 || year === 1914) { ruler = 'Raymond Poincaré (Prezydent)'; popK = 39600; allies = ['Great Britain', 'Russian Empire']; enemies = ['German Empire', 'Austria-Hungary']; }
    else if (year === 1920 || year === 1930 || year === 1938) { ruler = 'Albert Lebrun (III Republika)'; popK = 41500; allies = ['Great Britain', 'Poland']; }
    else if (year === 1945) { ruler = 'gen. Charles de Gaulle'; popK = 40500; allies = ['United States', 'Great Britain', 'Soviet Union']; enemies = ['Germany', 'Japan']; }
    else if (year === 1960) { ruler = 'Charles de Gaulle (V Republika)'; popK = 45700; allies = ['United States', 'Great Britain', 'Germany']; }
    else if (year === 2000) { ruler = 'Jacques Chirac'; popK = 59000; allies = ['Germany', 'Great Britain', 'United States', 'Poland']; }
    else if (year === 2010) { ruler = 'Nicolas Sarkozy'; popK = 65000; allies = ['NATO', 'European Union']; }
    else { ruler = 'Król / Prezydent Francji'; popK = 15000; }
  } else if (ln.includes('england') || ln.includes('great britain') || ln.includes('united kingdom')) {
    capital = 'Londyn';
    if (year === 1000) { ruler = 'Ethelred II Bezradny'; popK = 1800; }
    else if (year === 1400) { ruler = 'Henryk IV Lancaster'; popK = 2800; enemies = ['France']; }
    else if (year === 1492 || year === 1500) { ruler = 'Henryk VII Tudor'; popK = 3800; }
    else if (year === 1530) { ruler = 'Henryk VIII Tudor'; popK = 4200; }
    else if (year === 1600) { ruler = 'Elżbieta I Tudor'; popK = 5200; enemies = ['Spain']; }
    else if (year === 1650) { ruler = 'Oliver Cromwell (Lord Protektor)'; popK = 5500; }
    else if (year === 1700) { ruler = 'Wilhelm III Orański'; popK = 6500; allies = ['Netherlands', 'Austria']; enemies = ['France', 'Spain']; }
    else if (year === 1715) { ruler = 'Jerzy I Hanowerski'; popK = 7200; }
    else if (year === 1783) { ruler = 'Jerzy III Hanowerski'; popK = 9500; enemies = ['United States', 'France', 'Spain']; }
    else if (year === 1800 || year === 1815) { ruler = 'Jerzy III / książę Regent (Jerzy IV)'; popK = 13000; allies = ['Russian Empire', 'Austria', 'Prussia']; enemies = ['France']; }
    else if (year === 1878 || year === 1880) { ruler = 'Królowa Wiktoria (Cesarzowa Indii) / Gladstone'; popK = 35000; }
    else if (year === 1900 || year === 1914) { ruler = 'Jerzy V / H. H. Asquith'; popK = 45000; allies = ['France', 'Russian Empire']; enemies = ['German Empire', 'Austria-Hungary', 'Ottoman Empire']; }
    else if (year === 1920 || year === 1930 || year === 1938) { ruler = 'Jerzy VI / Neville Chamberlain'; popK = 47500; allies = ['France', 'Poland']; }
    else if (year === 1945) { ruler = 'Winston Churchill / Clement Attlee'; popK = 49000; allies = ['United States', 'Soviet Union', 'France']; enemies = ['Germany', 'Japan']; }
    else if (year === 1960) { ruler = 'Elżbieta II / Harold Macmillan'; popK = 52400; allies = ['United States', 'NATO']; }
    else if (year === 2000) { ruler = 'Elżbieta II / Tony Blair'; popK = 58900; allies = ['United States', 'NATO', 'European Union']; }
    else if (year === 2010) { ruler = 'Elżbieta II / David Cameron'; popK = 62800; allies = ['United States', 'NATO']; }
    else { ruler = 'Monarcha Brytyjski'; popK = 10000; }
  } else if (ln.includes('spain') || ln.includes('castile')) {
    capital = 'Madryt';
    if (year === 1492) { ruler = 'Izabela Kastylijska & Ferdynand Aragoński'; popK = 7500; }
    else if (year === 1500) { ruler = 'Królowie Katoliccy'; popK = 8000; }
    else if (year === 1530) { ruler = 'Karol V Habsburg'; popK = 9000; allies = ['Holy Roman Empire', 'Austria']; enemies = ['France', 'Ottoman Empire']; }
    else if (year === 1600) { ruler = 'Filip III Habsburg'; popK = 8500; allies = ['Austria']; enemies = ['England', 'Netherlands']; }
    else if (year === 1650) { ruler = 'Filip IV Habsburg'; popK = 7500; enemies = ['France', 'Portugal']; }
    else if (year === 1700 || year === 1715) { ruler = 'Filip V Burbon'; popK = 7500; allies = ['France']; enemies = ['Great Britain', 'Austria']; }
    else if (year === 1800 || year === 1815) { ruler = 'Karol IV / Ferdynand VII Burbon'; popK = 11000; }
    else if (year === 1938) { ruler = 'gen. Francisco Franco / II Republika'; popK = 25500; }
    else if (year === 2000) { ruler = 'Jan Karol I / José María Aznar'; popK = 40500; allies = ['European Union', 'NATO']; }
    else { ruler = 'Król Hiszpanii'; popK = 10000; }
  } else if (/\b(russia|muscovy)\b/i.test(ln) && !ln.includes('prussia')) {
    capital = (year >= 1712 && year < 1918) ? 'Petersburg' : 'Moskwa';
    if (year === 1400) { ruler = 'Wasyl I Rurykowicz'; popK = 3500; allies = ['Lithuania']; }
    else if (year === 1492 || year === 1500) { ruler = 'Iwan III Wielki'; popK = 6000; enemies = ['Lithuania', 'Golden Horde']; }
    else if (year === 1530) { ruler = 'Wasyl III Rurykowicz'; popK = 7500; }
    else if (year === 1600) { ruler = 'Borys Godunow (Wielka Smuta)'; popK = 11000; enemies = ['Poland-Lithuania']; }
    else if (year === 1650) { ruler = 'Aleksy I Michajłowicz (Romanow)'; popK = 12500; enemies = ['Poland-Lithuania']; }
    else if (year === 1700 || year === 1715) { ruler = 'Piotr I Wielki'; popK = 15000; allies = ['Poland-Lithuania', 'Denmark']; enemies = ['Sweden', 'Ottoman Empire']; }
    else if (year === 1783) { ruler = 'Katarzyna II Wielka'; popK = 28000; allies = ['Austria', 'Prussia']; enemies = ['Ottoman Empire']; }
    else if (year === 1800 || year === 1815) { ruler = 'Car Aleksander I Romanow'; popK = 40000; allies = ['Great Britain', 'Austria', 'Prussia']; enemies = ['France']; }
    else if (year === 1878 || year === 1880) { ruler = 'Car Aleksander II (Wyzwoliciel)'; popK = 95000; }
    else if (year === 1900 || year === 1914) { ruler = 'Car Mikołaj II Romanow'; popK = 160000; allies = ['France', 'Great Britain', 'Serbia']; enemies = ['German Empire', 'Austria-Hungary', 'Ottoman Empire']; }
    else if (year === 1920) { ruler = 'Włodzimierz Lenin'; popK = 135000; enemies = ['Poland']; }
    else if (year === 1930 || year === 1938) { ruler = 'Józef Stalin'; popK = 168000; }
    else if (year === 1945) { ruler = 'Józef Stalin'; popK = 170000; allies = ['United States', 'Great Britain']; enemies = ['Germany', 'Japan']; }
    else if (year === 1960) { ruler = 'Nikita Chruszczow'; popK = 214000; allies = ['Warsaw Pact']; }
    else if (year === 1994) { ruler = 'Borys Jelcyn'; popK = 148000; }
    else if (year === 2000 || year === 2010) { ruler = 'Władimir Putin'; popK = 143000; }
    else { ruler = 'Car / Przywódca Rosji'; popK = 25000; }
  } else if (ln.includes('ottoman') || ln.includes('turk')) {
    capital = year >= 1453 ? 'Stambuł (Konstantynopol)' : 'Bursa / Adrianopol';
    if (year === 1400) { ruler = 'Bajazyd I Błyskawica'; popK = 4000; enemies = ['Byzantine Empire']; }
    else if (year === 1492 || year === 1500) { ruler = 'Bajazyd II'; popK = 11000; }
    else if (year === 1530) { ruler = 'Sulejman I Wspaniały (Prawodawca)'; popK = 19000; allies = ['France']; enemies = ['Holy Roman Empire', 'Austria', 'Spain', 'Safavid Empire']; }
    else if (year === 1600) { ruler = 'Mehmed III'; popK = 24000; enemies = ['Austria', 'Safavid Empire']; }
    else if (year === 1650) { ruler = 'Mehmed IV & wezyr Köprülü'; popK = 26000; enemies = ['Venice']; }
    else if (year === 1700 || year === 1715) { ruler = 'Mustafa II / Ahmed III'; popK = 25000; enemies = ['Austria', 'Russia', 'Venice', 'Poland-Lithuania']; }
    else if (year === 1783) { ruler = 'Abdulhamid I'; popK = 24000; enemies = ['Russia']; }
    else if (year === 1878 || year === 1880) { ruler = 'Abdulhamid II'; popK = 26000; }
    else if (year === 1914) { ruler = 'Mehmed V & Młodoturcy (Enwer Pasza)'; popK = 21000; allies = ['German Empire', 'Austria-Hungary']; enemies = ['Great Britain', 'France', 'Russian Empire']; }
    else if (year >= 1923) { ruler = 'Mustafa Kemal Atatürk / Prezydent Turcji'; popK = 25000; }
    else { ruler = 'Sułtan Osmański'; popK = 15000; }
  } else if (/\b(united states|u\.s\.a)\b/i.test(ln)) {
    capital = 'Waszyngton';
    if (year === 1783) { ruler = 'Jerzy Waszyngton / Kongres Kontynentalny'; popK = 3200; allies = ['France']; enemies = ['Great Britain']; }
    else if (year === 1800) { ruler = 'John Adams / Thomas Jefferson'; popK = 5300; }
    else if (year === 1815) { ruler = 'James Madison'; popK = 8400; enemies = ['Great Britain']; }
    else if (year === 1878 || year === 1880) { ruler = 'Rutherford B. Hayes'; popK = 50200; }
    else if (year === 1900) { ruler = 'William McKinley'; popK = 76200; }
    else if (year === 1914) { ruler = 'Woodrow Wilson'; popK = 99100; }
    else if (year === 1920) { ruler = 'Woodrow Wilson'; popK = 106000; }
    else if (year === 1930) { ruler = 'Herbert Hoover'; popK = 123200; }
    else if (year === 1938) { ruler = 'Franklin D. Roosevelt'; popK = 130000; }
    else if (year === 1945) { ruler = 'Harry S. Truman / F.D. Roosevelt'; popK = 139900; allies = ['Great Britain', 'Soviet Union', 'France']; enemies = ['Germany', 'Japan']; }
    else if (year === 1960) { ruler = 'Dwight D. Eisenhower'; popK = 180700; allies = ['NATO']; }
    else if (year === 1994) { ruler = 'Bill Clinton'; popK = 263100; allies = ['NATO']; }
    else if (year === 2000) { ruler = 'Bill Clinton'; popK = 282000; allies = ['Great Britain', 'France', 'Germany', 'Poland', 'Japan']; }
    else if (year === 2010) { ruler = 'Barack Obama'; popK = 309300; allies = ['NATO']; }
    else { ruler = 'Prezydent USA'; popK = 50000; }
  } else if (/\b(china|chinese|ming|qing)\b/i.test(ln) && !ln.includes('chinantla') && !ln.includes('mingin') && !ln.includes('cochin')) {
    capital = 'Pekin';
    if (year === -200 || year === -100 || year === -1) { ruler = 'Cesarz Dynastii Han'; popK = 50000; }
    else if (year === 700 || year === 800) { ruler = 'Cesarz Dynastii Tang'; popK = 60000; }
    else if (year === 1000 || year === 1100) { ruler = 'Cesarz Dynastii Song'; popK = 80000; }
    else if (year === 1279) { ruler = 'Kubłaj-chan (Dynastia Yuan)'; popK = 70000; }
    else if (year === 1400) { ruler = 'Cesarz Yongle (Dynastia Ming)'; popK = 85000; }
    else if (year === 1492 || year === 1500) { ruler = 'Cesarz Hongzhi (Dynastia Ming)'; popK = 110000; }
    else if (year === 1600) { ruler = 'Cesarz Wanli (Dynastia Ming)'; popK = 150000; }
    else if (year === 1700 || year === 1715) { ruler = 'Cesarz Kangxi (Dynastia Qing)'; popK = 200000; }
    else if (year === 1783) { ruler = 'Cesarz Qianlong (Dynastia Qing)'; popK = 300000; }
    else if (year === 1900 || year === 1914) { ruler = 'Cesarzowa Cixi / Yuan Shikai'; popK = 430000; }
    else if (year === 1938 || year === 1945) { ruler = 'Czang Kaj-szek / Mao Zedong'; popK = 500000; enemies = ['Japan']; }
    else if (year === 1960) { ruler = 'Mao Zedong'; popK = 667000; }
    else if (year === 2000) { ruler = 'Jiang Zemin'; popK = 1260000; }
    else if (year === 2010) { ruler = 'Hu Jintao'; popK = 1337000; }
    else { ruler = 'Syn Niebios (Cesarz Chin)'; popK = 80000; }
  } else if (ln.includes('holy roman')) {
    capital = 'Frankfurt / Wiedeń';
    if (year === 1492) { ruler = 'Maksymilian I Habsburg'; popK = 15000; }
    else if (year === 1600) { ruler = 'Rudolf II Habsburg'; popK = 20000; }
    else { ruler = 'Cesarz Rzymsko-Niemiecki'; popK = 16000; }
  } else if (ln.includes('japan')) {
    capital = year >= 1868 ? 'Tokio' : 'Kioto';
    if (year === 1600) { ruler = 'Tokugawa Ieyasu (Szogunat Edo)'; popK = 18000; }
    else if (year === 1914) { ruler = 'Cesarz Taishō'; popK = 52000; allies = ['Great Britain', 'France', 'Russian Empire']; enemies = ['German Empire']; }
    else if (year === 1938 || year === 1945) { ruler = 'Cesarz Hirohito (Shōwa) / gen. Hideki Tōjō'; popK = 72000; allies = ['Germany', 'Italy']; enemies = ['United States', 'Great Britain', 'China', 'Soviet Union']; }
    else if (year === 2000) { ruler = 'Cesarz Akihito / Keizō Obuchi'; popK = 126800; allies = ['United States']; }
    else if (year === 2010) { ruler = 'Cesarz Akihito / Naoto Kan'; popK = 128000; allies = ['United States']; }
    else { ruler = 'Cesarz / Szogun'; popK = 12000; }
  } else if (/\b(mughal|delhi sultanate)\b/i.test(ln)) {
    capital = 'Delhi / Agra';
    if (year === 1600) { ruler = 'Akbar Wielki'; popK = 110000; }
    else if (year === 1700) { ruler = 'Aurangzeb'; popK = 150000; }
    else { ruler = 'Wielki Mogoł'; popK = 80000; }
  } else if (/\b(safavid|persia|iran)\b/i.test(ln)) {
    capital = 'Isfahan / Teheran';
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
    if (year === 1492 || year === 1500) { ruler = 'Manuel I Szczęśliwy'; popK = 1500; }
    else if (year === 1530) { ruler = 'Jan III Pobożny'; popK = 1800; }
    else if (year === 1700) { ruler = 'Piotr II Spokojny'; popK = 2200; }
    else if (year === 1914) { ruler = 'Manuel II / I Republika'; popK = 5900; }
    else { ruler = 'Monarchia Portugalska'; popK = 2000; }
  } else if (/\b(sweden)\b/i.test(ln)) {
    capital = 'Sztokholm';
    if (year === 1600) { ruler = 'Karol IX Waza'; popK = 1200; enemies = ['Poland']; }
    else if (year === 1650) { ruler = 'Królowa Krystyna Waza'; popK = 1500; }
    else if (year === 1700 || year === 1715) { ruler = 'Karol XII Waza'; popK = 1800; enemies = ['Russia', 'Poland', 'Denmark']; }
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
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const mod = Math.abs(hash);
    const basePop = 20 + (mod % 280);
    const growth = year < 0 ? 0.3 : year < 1500 ? 0.6 : year < 1900 ? 1.0 : 2.5;
    popK = Math.max(15, Math.round(basePop * growth));
    ruler = `Władca (${name})`;
  }

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
  const outPath = path.join(OUTPUT_DIR, era.filename);
  let geojson;

  if (fs.existsSync(outPath)) {
    console.log(`Loading existing file for re-enrichment: ${era.filename}`);
    geojson = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  } else {
    console.log(`Downloading fresh: ${era.title} (${era.filename})...`);
    const url = `https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/${era.filename}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }
    geojson = await res.json();
  }

  let featureId = 1;
  geojson.features = (geojson.features || []).filter(f => f.geometry && f.geometry.coordinates).map(f => {
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

  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(ERAS, null, 2));
  console.log(`Wrote index.json with ${ERAS.length} eras.`);
  console.log('Finished successfully!');
}

main();
