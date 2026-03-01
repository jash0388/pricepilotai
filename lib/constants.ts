export const CITY_MAP: Record<string, { airport: string; station: string }> = {
    mumbai: { airport: 'BOM', station: 'CSTM' },
    delhi: { airport: 'DEL', station: 'NDLS' },
    bangalore: { airport: 'BLR', station: 'SBC' },
    bengaluru: { airport: 'BLR', station: 'SBC' },
    hyderabad: { airport: 'HYD', station: 'SC' },
    chennai: { airport: 'MAA', station: 'MAS' },
    kolkata: { airport: 'CCU', station: 'HWH' },
    goa: { airport: 'GOI', station: 'MAO' },
    pune: { airport: 'PNQ', station: 'PUNE' },
    jaipur: { airport: 'JAI', station: 'JP' },
    tirupati: { airport: 'TIR', station: 'TPTY' },
    ahmedabad: { airport: 'AMD', station: 'ADI' },
    lucknow: { airport: 'LKO', station: 'LKO' },
    varanasi: { airport: 'VNS', station: 'BSB' },
    kochi: { airport: 'COK', station: 'ERS' },
    indore: { airport: 'IDR', station: 'INDB' },
    nagpur: { airport: 'NAG', station: 'NGP' },
    vizag: { airport: 'VTZ', station: 'VSKP' },
    coimbatore: { airport: 'CJB', station: 'CBE' },
    mangalore: { airport: 'IXE', station: 'MAQ' },
    mysore: { airport: 'MYQ', station: 'MYS' },
    bhopal: { airport: 'BHO', station: 'BPL' },
    patna: { airport: 'PAT', station: 'PNBE' },
    chandigarh: { airport: 'IXC', station: 'CDG' },
    surat: { airport: 'STV', station: 'ST' },
    agra: { airport: 'AGR', station: 'AGC' },
    vijayawada: { airport: 'VGA', station: 'BZA' },
    madurai: { airport: 'IXM', station: 'MDU' },
}

// Aliases: common shortcuts, abbreviations, and misspellings → canonical city name
export const CITY_ALIASES: Record<string, string> = {
    // Mumbai
    mum: 'mumbai', bom: 'mumbai', bombay: 'mumbai', mumb: 'mumbai',
    // Delhi
    del: 'delhi', ndls: 'delhi', newdelhi: 'delhi', dilli: 'delhi', dli: 'delhi',
    // Bangalore
    blr: 'bangalore', bang: 'bangalore', banglore: 'bangalore', bengaluru: 'bengaluru', bng: 'bangalore', namma: 'bangalore',
    // Hyderabad
    hyd: 'hyderabad', hyderbad: 'hyderabad', hydb: 'hyderabad', sec: 'hyderabad', secunderabad: 'hyderabad',
    // Chennai
    chn: 'chennai', madras: 'chennai', mas: 'chennai', chen: 'chennai',
    // Kolkata
    kol: 'kolkata', ccl: 'kolkata', calcutta: 'kolkata', cal: 'kolkata', hwh: 'kolkata',
    // Goa
    panaji: 'goa', panjim: 'goa', margao: 'goa', vasco: 'goa',
    // Pune
    pnq: 'pune', puna: 'pune',
    // Jaipur
    jai: 'jaipur', jp: 'jaipur', jaip: 'jaipur',
    // Tirupati
    tiru: 'tirupati', tirumala: 'tirupati', tpty: 'tirupati', tirupathi: 'tirupati', tirpati: 'tirupati',
    // Ahmedabad
    amd: 'ahmedabad', amdavad: 'ahmedabad', ahm: 'ahmedabad',
    // Lucknow
    lko: 'lucknow', lkw: 'lucknow', luck: 'lucknow',
    // Varanasi
    vns: 'varanasi', benaras: 'varanasi', kashi: 'varanasi',
    // Kochi
    cochin: 'kochi', cok: 'kochi',
    // Vizag
    vskp: 'vizag', vishakhapatnam: 'vizag', visakhapatnam: 'vizag',
    // Coimbatore
    cbe: 'coimbatore', kovai: 'coimbatore',
    // Mangalore
    mlr: 'mangalore', mangaluru: 'mangalore',
    // Mysore
    mys: 'mysore', mysuru: 'mysore',
    // Others
    bpl: 'bhopal', bho: 'bhopal',
    pat: 'patna', ptn: 'patna',
    chd: 'chandigarh',
    srt: 'surat',
    vjw: 'vijayawada', vjd: 'vijayawada', bezwada: 'vijayawada',
    mdu: 'madurai',
    ind: 'indore',
    ngp: 'nagpur',
}

export const PRODUCT_CARDS = [
    { id: 'iphone 15', name: 'iPhone 15', category: 'Smartphone', emoji: '📱' },
    { id: 'samsung galaxy s24', name: 'Samsung Galaxy S24', category: 'Smartphone', emoji: '📱' },
    { id: 'macbook air m2', name: 'MacBook Air M2', category: 'Laptop', emoji: '💻' },
    { id: 'airpods pro 2', name: 'AirPods Pro 2', category: 'Audio', emoji: '🎧' },
    { id: 'sony wh-1000xm5', name: 'Sony WH-1000XM5', category: 'Audio', emoji: '🎧' },
    { id: 'ipad air m2', name: 'iPad Air M2', category: 'Tablet', emoji: '📱' },
    { id: 'playstation 5', name: 'PlayStation 5', category: 'Gaming', emoji: '🎮' },
    { id: 'dyson v15 detect', name: 'Dyson V15 Detect', category: 'Appliance', emoji: '🧹' },
]

export const PRODUCT_CATEGORIES = ['All', 'Smartphones', 'Laptops', 'Audio', 'Gaming', 'Appliances']

export const TRUSTED_STORES = ['amazon', 'flipkart', 'myntra', 'samsung', 'apple', 'reliance digital', 'croma', 'tata cliq', 'ajio', 'jiomart']
