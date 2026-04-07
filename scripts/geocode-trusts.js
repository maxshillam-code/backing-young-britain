/**
 * One-off script to geocode NHS mental health trust providers.
 * Uses NHS ODS API to get postcodes, then postcodes.io for lat/lng.
 *
 * Usage: node scripts/geocode-trusts.js
 * Output: data/mh-trusts.json
 */

const fs = require('fs');
const path = require('path');

const INPUT = [
  {"Provider Code":"RXV","Provider Name":"GREATER MANCHESTER MENTAL HEALTH NHS FOUNDATION TRUST","Referrals Received":"58,615","Entered Treatment":"29,785","Finished Course":"13,815"},
  {"Provider Code":"RMY","Provider Name":"NORFOLK AND SUFFOLK NHS FOUNDATION TRUST","Referrals Received":"64,470","Entered Treatment":"46,030","Finished Course":"24,555"},
  {"Provider Code":"E0W9O","Provider Name":"NHS KENT AND MEDWAY TALKING THERAPIES: VITA HEALTH GROUP AND WE ARE WITH YOU","Referrals Received":"47,895","Entered Treatment":"33,150","Finished Course":"12,335"},
  {"Provider Code":"RRE","Provider Name":"MIDLANDS PARTNERSHIP UNIVERSITY NHS FOUNDATION TRUST","Referrals Received":"58,400","Entered Treatment":"36,855","Finished Course":"24,250"},
  {"Provider Code":"RY6","Provider Name":"LEEDS COMMUNITY HEALTHCARE NHS TRUST","Referrals Received":"37,500","Entered Treatment":"32,490","Finished Course":"6,350"},
  {"Provider Code":"RW501","Provider Name":"LANCASHIRE & SOUTH CUMBRIA NHS FOUNDATION TRUST HQ","Referrals Received":"44,420","Entered Treatment":"27,980","Finished Course":"14,620"},
  {"Provider Code":"RW4","Provider Name":"MERSEY CARE NHS FOUNDATION TRUST","Referrals Received":"39,925","Entered Treatment":"30,215","Finished Course":"12,865"},
  {"Provider Code":"AMC05","Provider Name":"SELF HELP SERVICES (MANCHESTER)","Referrals Received":"28,495","Entered Treatment":"12,755","Finished Course":"2,505"},
  {"Provider Code":"RT2","Provider Name":"PENNINE CARE NHS FOUNDATION TRUST","Referrals Received":"31,745","Entered Treatment":"15,685","Finished Course":"8,590"},
  {"Provider Code":"RW1","Provider Name":"HAMPSHIRE AND ISLE OF WIGHT HEALTHCARE NHS FOUNDATION TRUST","Referrals Received":"36,400","Entered Treatment":"24,065","Finished Course":"13,685"},
  {"Provider Code":"RWRD7","Provider Name":"WAVERLEY ROAD","Referrals Received":"33,295","Entered Treatment":"23,405","Finished Course":"11,030"},
  {"Provider Code":"TAJ","Provider Name":"BLACK COUNTRY HEALTHCARE NHS FOUNDATION TRUST","Referrals Received":"32,080","Entered Treatment":"22,145","Finished Course":"11,990"},
  {"Provider Code":"G6V2S","Provider Name":"NORTH LONDON NHS FOUNDATION TRUST","Referrals Received":"23,270","Entered Treatment":"14,355","Finished Course":"3,215"},
  {"Provider Code":"RYG","Provider Name":"COVENTRY AND WARWICKSHIRE PARTNERSHIP NHS TRUST","Referrals Received":"29,365","Entered Treatment":"19,335","Finished Course":"10,460"},
  {"Provider Code":"RWV","Provider Name":"DEVON PARTNERSHIP NHS TRUST","Referrals Received":"28,785","Entered Treatment":"19,755","Finished Course":"10,765"},
  {"Provider Code":"S5F7C","Provider Name":"NHS TALKING THERAPIES NOTTINGHAMSHIRE","Referrals Received":"36,585","Entered Treatment":"26,190","Finished Course":"18,660"},
  {"Provider Code":"RAT","Provider Name":"NORTH EAST LONDON NHS FOUNDATION TRUST","Referrals Received":"30,435","Entered Treatment":"21,045","Finished Course":"12,810"},
  {"Provider Code":"P6W4I","Provider Name":"VITAMINDS: LLR","Referrals Received":"26,385","Entered Treatment":"17,570","Finished Course":"9,435"},
  {"Provider Code":"RXE","Provider Name":"ROTHERHAM DONCASTER AND SOUTH HUMBER NHS FOUNDATION TRUST","Referrals Received":"23,970","Entered Treatment":"15,650","Finished Course":"7,425"},
  {"Provider Code":"RWX","Provider Name":"BERKSHIRE HEALTHCARE NHS FOUNDATION TRUST","Referrals Received":"27,205","Entered Treatment":"17,405","Finished Course":"10,795"},
  {"Provider Code":"R1L","Provider Name":"ESSEX PARTNERSHIP UNIVERSITY NHS FOUNDATION TRUST","Referrals Received":"24,805","Entered Treatment":"16,830","Finished Course":"8,900"},
  {"Provider Code":"RXT","Provider Name":"BIRMINGHAM AND SOLIHULL MENTAL HEALTH NHS FOUNDATION TRUST","Referrals Received":"22,595","Entered Treatment":"14,480","Finished Course":"7,185"},
  {"Provider Code":"NWC07","Provider Name":"VITA HEALTH GROUP: VITAMINDS BRISTOL, NORTH SOMERSET & SOUTH GLOUCESTERSHIRE","Referrals Received":"25,155","Entered Treatment":"17,020","Finished Course":"10,020"},
  {"Provider Code":"NKI","Provider Name":"TURNING POINT","Referrals Received":"22,325","Entered Treatment":"15,465","Finished Course":"7,280"},
  {"Provider Code":"RX2","Provider Name":"SUSSEX PARTNERSHIP NHS FOUNDATION TRUST","Referrals Received":"24,805","Entered Treatment":"16,840","Finished Course":"9,775"},
  {"Provider Code":"R1A","Provider Name":"HEREFORDSHIRE AND WORCESTERSHIRE HEALTH AND CARE NHS TRUST","Referrals Received":"17,870","Entered Treatment":"10,815","Finished Course":"4,860"},
  {"Provider Code":"RX301","Provider Name":"TEES, ESK, WEAR VALLEY NHS TRUST (DURHAM)","Referrals Received":"21,400","Entered Treatment":"13,350","Finished Course":"8,905"},
  {"Provider Code":"RDR","Provider Name":"SUSSEX COMMUNITY NHS FOUNDATION TRUST","Referrals Received":"19,900","Entered Treatment":"13,795","Finished Course":"8,090"},
  {"Provider Code":"RP1","Provider Name":"NORTHAMPTONSHIRE HEALTHCARE NHS FOUNDATION TRUST","Referrals Received":"18,710","Entered Treatment":"13,440","Finished Course":"6,940"},
  {"Provider Code":"RT119","Provider Name":"CAMBRIDGESHIRE AND PETERBOROUGH MENTAL HEALTH PARTNERSHIP TR HQ","Referrals Received":"21,955","Entered Treatment":"17,600","Finished Course":"10,250"},
  {"Provider Code":"RP7","Provider Name":"LINCOLNSHIRE PARTNERSHIP NHS FOUNDATION TRUST","Referrals Received":"21,810","Entered Treatment":"14,300","Finished Course":"10,150"},
  {"Provider Code":"TAH","Provider Name":"SHEFFIELD HEALTH & SOCIAL CARE NHS FOUNDATION TRUST","Referrals Received":"18,355","Entered Treatment":"13,630","Finished Course":"6,805"},
  {"Provider Code":"NJG","Provider Name":"ALLIANCE PSYCHOLOGY SERVICES LTD","Referrals Received":"17,395","Entered Treatment":"11,770","Finished Course":"6,110"},
  {"Provider Code":"RDY","Provider Name":"DORSET HEALTHCARE UNIVERSITY NHS FOUNDATION TRUST","Referrals Received":"23,085","Entered Treatment":"17,080","Finished Course":"12,025"},
  {"Provider Code":"RV3CH","Provider Name":"ICCS","Referrals Received":"14,755","Entered Treatment":"7,950","Finished Course":"3,930"},
  {"Provider Code":"NCM","Provider Name":"SIX DEGREES SOCIAL ENTERPRISE CIC","Referrals Received":"12,530","Entered Treatment":"6,315","Finished Course":"1,850"},
  {"Provider Code":"RJ8","Provider Name":"CORNWALL PARTNERSHIP NHS FOUNDATION TRUST","Referrals Received":"15,395","Entered Treatment":"10,135","Finished Course":"5,420"},
  {"Provider Code":"TAD","Provider Name":"BRADFORD DISTRICT CARE NHS FOUNDATION TRUST","Referrals Received":"15,930","Entered Treatment":"10,830","Finished Course":"6,190"},
  {"Provider Code":"RXG10","Provider Name":"FIELDHEAD HOSPITAL","Referrals Received":"13,180","Entered Treatment":"9,660","Finished Course":"3,525"},
  {"Provider Code":"RQX","Provider Name":"HOMERTON HEALTHCARE NHS FOUNDATION TRUST","Referrals Received":"13,910","Entered Treatment":"8,095","Finished Course":"4,290"},
  {"Provider Code":"RH5","Provider Name":"SOMERSET NHS FOUNDATION TRUST","Referrals Received":"14,725","Entered Treatment":"9,770","Finished Course":"5,235"},
  {"Provider Code":"ALR01","Provider Name":"LIVING WELL CONSORTIUM (HERBERT ROAD)","Referrals Received":"16,250","Entered Treatment":"10,205","Finished Course":"7,170"},
  {"Provider Code":"RVN","Provider Name":"AVON AND WILTSHIRE MENTAL HEALTH PARTNERSHIP NHS TRUST","Referrals Received":"14,150","Entered Treatment":"10,630","Finished Course":"5,255"},
  {"Provider Code":"RTQ","Provider Name":"GLOUCESTERSHIRE HEALTH AND CARE NHS FOUNDATION TRUST","Referrals Received":"15,760","Entered Treatment":"10,965","Finished Course":"6,965"},
  {"Provider Code":"RV5CG","Provider Name":"SOUTHWARK PSYCHOLOGICAL THERAPIES SERVICES (SOUTHWARK IAPT)","Referrals Received":"12,970","Entered Treatment":"8,595","Finished Course":"4,295"},
  {"Provider Code":"RNUDT","Provider Name":"NHS OXFORDSHIRE TALKING THERAPIES","Referrals Received":"16,475","Entered Treatment":"12,955","Finished Course":"7,805"},
  {"Provider Code":"RV5CK","Provider Name":"LAMBETH PSYCHOLOGICAL THERAPIES SERVICE (LAMBETH IAPT)","Referrals Received":"15,500","Entered Treatment":"9,945","Finished Course":"6,910"},
  {"Provider Code":"RV5CJ","Provider Name":"CROYDON PSYCHOLOGICAL THERAPIES SERVICE (CROYDON IAPT)","Referrals Received":"13,860","Entered Treatment":"9,780","Finished Course":"5,860"},
  {"Provider Code":"RV3L8","Provider Name":"TAKE TIME TO TALK","Referrals Received":"10,700","Entered Treatment":"7,085","Finished Course":"2,730"},
  {"Provider Code":"RWK79","Provider Name":"NEWHAM TALKING THERAPIES","Referrals Received":"12,815","Entered Treatment":"7,395","Finished Course":"4,875"},
  {"Provider Code":"RWK4D","Provider Name":"BEDFORDSHIRE TALKING THERAPIES","Referrals Received":"12,980","Entered Treatment":"8,720","Finished Course":"5,065"},
  {"Provider Code":"RWK53","Provider Name":"TOWER HAMLETS TALKING THERAPIES","Referrals Received":"11,725","Entered Treatment":"6,260","Finished Course":"3,835"},
  {"Provider Code":"RWRG3","Provider Name":"HERTFORDSHIRE PARTNERSHIP FOUNDATION TRUST (TEKHNICON HOUSE)","Referrals Received":"11,555","Entered Treatment":"8,075","Finished Course":"4,055"},
  {"Provider Code":"NLS","Provider Name":"TRENT PTS","Referrals Received":"15,840","Entered Treatment":"9,475","Finished Course":"8,730"},
  {"Provider Code":"RKE","Provider Name":"WHITTINGTON HEALTH NHS TRUST","Referrals Received":"10,815","Entered Treatment":"7,275","Finished Course":"3,875"},
  {"Provider Code":"RKL07","Provider Name":"EALING TALKING THERAPIES","Referrals Received":"11,130","Entered Treatment":"7,380","Finished Course":"4,480"},
  {"Provider Code":"NDC17","Provider Name":"NHS WIRRAL TALKING THERAPIES","Referrals Received":"11,735","Entered Treatment":"8,240","Finished Course":"5,125"},
  {"Provider Code":"NDC10","Provider Name":"EVERYTURN SERVICES LTD - DERBYSHIRE","Referrals Received":"8,555","Entered Treatment":"4,355","Finished Course":"2,030"},
  {"Provider Code":"RKL42","Provider Name":"HOUNSLOW TALKING THERAPIES","Referrals Received":"9,765","Entered Treatment":"5,415","Finished Course":"3,250"},
  {"Provider Code":"RV3HC","Provider Name":"IAPT SERVICES","Referrals Received":"10,020","Entered Treatment":"5,545","Finished Course":"3,505"},
  {"Provider Code":"RQY12","Provider Name":"WANDSWORTH IAPT","Referrals Received":"11,605","Entered Treatment":"8,645","Finished Course":"5,095"},
  {"Provider Code":"RKL14","Provider Name":"HAMMERSMITH & FULHAM TALKING THERAPIES","Referrals Received":"9,825","Entered Treatment":"5,575","Finished Course":"3,410"},
  {"Provider Code":"RX4K3","Provider Name":"GRANGE PARK CLINIC MONKMOUTH HOSPITAL SUNDERLAND LOCALITY","Referrals Received":"8,620","Entered Treatment":"6,680","Finished Course":"2,470"},
  {"Provider Code":"RNUDV","Provider Name":"NHS BUCKINGHAMSHIRE TALKING THERAPIES","Referrals Received":"13,730","Entered Treatment":"10,830","Finished Course":"7,680"},
  {"Provider Code":"RPG","Provider Name":"OXLEAS NHS FOUNDATION TRUST","Referrals Received":"9,575","Entered Treatment":"5,960","Finished Course":"3,575"},
  {"Provider Code":"RV5CH","Provider Name":"LEWISHAM PSYCHOLOGICAL THERAPIES SERVICE (LEWISHAM IAPT)","Referrals Received":"10,620","Entered Treatment":"7,400","Finished Course":"4,730"},
  {"Provider Code":"RXX1Y","Provider Name":"MIND MATTERS SURREY NHS","Referrals Received":"13,930","Entered Treatment":"10,880","Finished Course":"8,060"},
  {"Provider Code":"C2J4D","Provider Name":"VITA HEALTH GROUP: NEWCASTLE IAPT","Referrals Received":"9,005","Entered Treatment":"5,665","Finished Course":"3,165"},
  {"Provider Code":"RXA29","Provider Name":"DENTON HOUSE","Referrals Received":"8,600","Entered Treatment":"6,015","Finished Course":"3,025"},
  {"Provider Code":"NNF","Provider Name":"CITY HEALTH CARE PARTNERSHIP CIC","Referrals Received":"10,510","Entered Treatment":"5,835","Finished Course":"5,000"},
  {"Provider Code":"RXA52","Provider Name":"1829 BUILDING","Referrals Received":"8,265","Entered Treatment":"4,900","Finished Course":"2,905"},
  {"Provider Code":"W5N3Z","Provider Name":"TALKING MATTERS SEFTON","Referrals Received":"7,935","Entered Treatment":"5,745","Finished Course":"2,595"},
  {"Provider Code":"RX40C","Provider Name":"FIRST STEP IAPT","Referrals Received":"8,635","Entered Treatment":"4,815","Finished Course":"3,600"},
  {"Provider Code":"AMC04","Provider Name":"NHS HEYWOOD, MIDDLETON AND ROCHDALE TALKING THERAPIES","Referrals Received":"7,040","Entered Treatment":"3,480","Finished Course":"2,025"},
  {"Provider Code":"NWC08","Provider Name":"VITA HEALTH GROUP: VITAMINDS WEST ESSEX","Referrals Received":"7,375","Entered Treatment":"5,010","Finished Course":"2,370"},
  {"Provider Code":"NQV","Provider Name":"BROMLEY HEALTHCARE","Referrals Received":"7,430","Entered Treatment":"5,020","Finished Course":"2,455"},
  {"Provider Code":"RV3DG","Provider Name":"WESTMINSTER WELLBEING SERVICE","Referrals Received":"8,170","Entered Treatment":"5,020","Finished Course":"3,220"},
  {"Provider Code":"RX34F","Provider Name":"BOOTHAM PARK HOSPITAL - ADMIN","Referrals Received":"8,990","Entered Treatment":"6,425","Finished Course":"4,100"},
  {"Provider Code":"RXL","Provider Name":"BLACKPOOL TEACHING HOSPITALS NHS FOUNDATION TRUST","Referrals Received":"7,860","Entered Treatment":"5,920","Finished Course":"2,995"},
  {"Provider Code":"AME01","Provider Name":"MIND IN BEXLEY (HQ)","Referrals Received":"6,520","Entered Treatment":"3,960","Finished Course":"1,720"},
  {"Provider Code":"RX3YE","Provider Name":"THE BRIARY UNIT","Referrals Received":"10,435","Entered Treatment":"7,630","Finished Course":"5,650"},
  {"Provider Code":"NR5","Provider Name":"LIVEWELL SOUTHWEST","Referrals Received":"7,790","Entered Treatment":"5,220","Finished Course":"3,055"},
  {"Provider Code":"RV3AR","Provider Name":"MILL HOUSE","Referrals Received":"8,870","Entered Treatment":"6,225","Finished Course":"4,250"},
  {"Provider Code":"RV9","Provider Name":"HUMBER TEACHING NHS FOUNDATION TRUST","Referrals Received":"8,780","Entered Treatment":"5,835","Finished Course":"4,185"},
  {"Provider Code":"NWC05","Provider Name":"VITA HEALTH GROUP: VITA MINDS BASILDON & BRENTWOOD","Referrals Received":"7,585","Entered Treatment":"5,350","Finished Course":"3,120"},
  {"Provider Code":"R0B","Provider Name":"SOUTH TYNESIDE AND SUNDERLAND NHS FOUNDATION TRUST","Referrals Received":"10,665","Entered Treatment":"8,270","Finished Course":"6,200"},
  {"Provider Code":"RXG82","Provider Name":"KENDRAY HOSPITAL","Referrals Received":"7,730","Entered Treatment":"5,680","Finished Course":"3,305"},
  {"Provider Code":"RV383","Provider Name":"NORTHWICK PARK HOSPITAL","Referrals Received":"7,220","Entered Treatment":"4,945","Finished Course":"2,840"},
  {"Provider Code":"NO204","Provider Name":"NHS NORTHUMBERLAND TALKING THERAPIES","Referrals Received":"7,690","Entered Treatment":"6,005","Finished Course":"3,365"},
  {"Provider Code":"RQYMI","Provider Name":"MERTON IAPT","Referrals Received":"6,805","Entered Treatment":"5,115","Finished Course":"2,495"},
  {"Provider Code":"RDYDL","Provider Name":"PSYCHOLOGICAL THERAPIES SOUTHHAMPTON OFFICE","Referrals Received":"9,100","Entered Treatment":"7,090","Finished Course":"4,835"},
  {"Provider Code":"TAF87","Provider Name":"ISLINGTON IAPT","Referrals Received":"5,620","Entered Treatment":"3,440","Finished Course":"1,430"},
  {"Provider Code":"M4P2I","Provider Name":"KINGSTON TALKING THERAPIES","Referrals Received":"5,615","Entered Treatment":"5,015","Finished Course":"1,455"},
  {"Provider Code":"NQL","Provider Name":"NAVIGO HEALTH AND SOCIAL CARE CIC","Referrals Received":"5,970","Entered Treatment":"3,995","Finished Course":"1,835"},
  {"Provider Code":"T6G0K","Provider Name":"SELF HELP SERVICES (STOCKPORT)","Referrals Received":"4,390","Entered Treatment":"2,765","Finished Course":"670"},
  {"Provider Code":"TAF88","Provider Name":"CAMDEN IAPT","Referrals Received":"5,155","Entered Treatment":"3,130","Finished Course":"1,480"},
  {"Provider Code":"RQYPR","Provider Name":"SUTTON IAPT","Referrals Received":"6,165","Entered Treatment":"4,275","Finished Course":"2,500"},
  {"Provider Code":"NO202","Provider Name":"WARRINGTON PSYCHOLOGICAL SERVICE","Referrals Received":"5,550","Entered Treatment":"4,170","Finished Course":"1,905"},
  {"Provider Code":"NWC12","Provider Name":"VITA HEALTH GROUP: VITAMINDS CALDERDALE","Referrals Received":"5,755","Entered Treatment":"3,795","Finished Course":"2,115"},
  {"Provider Code":"ALR02","Provider Name":"BMHC-FTB","Referrals Received":"7,245","Entered Treatment":"4,845","Finished Course":"3,685"},
  {"Provider Code":"RRPJ3","Provider Name":"NHS BARNET TALKING THERAPIES","Referrals Received":"5,455","Entered Treatment":"4,100","Finished Course":"1,935"},
  {"Provider Code":"RQY58","Provider Name":"ST JOHN'S HEALTH CENTRE","Referrals Received":"6,070","Entered Treatment":"4,975","Finished Course":"2,690"},
  {"Provider Code":"RRPJ4","Provider Name":"NHS ENFIELD TALKING THERAPIES","Referrals Received":"4,885","Entered Treatment":"3,645","Finished Course":"1,690"},
  {"Provider Code":"NNE","Provider Name":"DORKING HEALTHCARE LIMITED (DHC)","Referrals Received":"10,870","Entered Treatment":"8,710","Finished Course":"7,740"},
  {"Provider Code":"AM601","Provider Name":"IESO DIGITAL HEALTH","Referrals Received":"6,725","Entered Treatment":"4,085","Finished Course":"3,685"},
  {"Provider Code":"RTF61","Provider Name":"WALLSEND HEALTH CENTRE","Referrals Received":"5,590","Entered Treatment":"4,355","Finished Course":"2,790"},
  {"Provider Code":"AKR01","Provider Name":"LANCASHIRE WOMEN (ELTT)","Referrals Received":"4,090","Entered Treatment":"2,520","Finished Course":"1,320"},
  {"Provider Code":"RXM","Provider Name":"DERBYSHIRE HEALTHCARE NHS FOUNDATION TRUST","Referrals Received":"8,365","Entered Treatment":"6,145","Finished Course":"5,705"},
  {"Provider Code":"NWC11","Provider Name":"VITA HEALTH GROUP: VITAMINDS DERBY","Referrals Received":"3,545","Entered Treatment":"1,555","Finished Course":"920"},
  {"Provider Code":"NCH","Provider Name":"TALKPLUS","Referrals Received":"6,140","Entered Treatment":"4,800","Finished Course":"3,615"},
  {"Provider Code":"AMC03","Provider Name":"NHS EAST CHESHIRE TALKING THERAPIES","Referrals Received":"4,215","Entered Treatment":"2,770","Finished Course":"1,905"},
  {"Provider Code":"G7X5M","Provider Name":"WE ARE WITH YOU IN SURREY","Referrals Received":"2,820","Entered Treatment":"1,980","Finished Course":"1,095"},
  {"Provider Code":"NDC05","Provider Name":"EVERYTURN SERVICES LTD TALKING THERAPIES (PETERBOROUGH)","Referrals Received":"3,190","Entered Treatment":"2,260","Finished Course":"1,515"},
  {"Provider Code":"AML01","Provider Name":"1POINT (NORTH WEST)","Referrals Received":"3,660","Entered Treatment":"2,675","Finished Course":"2,240"},
  {"Provider Code":"8JJ53","Provider Name":"TAMESIDE, OLDHAM AND GLOSSOP MIND","Referrals Received":"1,560","Entered Treatment":"465","Finished Course":"155"},
  {"Provider Code":"R1C","Provider Name":"SOLENT NHS TRUST","Referrals Received":"2,935","Entered Treatment":"1,210","Finished Course":"1,565"},
  {"Provider Code":"NO401","Provider Name":"HERTS MIND NETWORK (HEMEL HEMPSTEAD)","Referrals Received":"1,265","Entered Treatment":"665","Finished Course":"50"},
  {"Provider Code":"RT1AB","Provider Name":"CAMBRIDGE AND PETERBOROUGH VOLUNTARY ORGANISATIONS","Referrals Received":"1,390","Entered Treatment":"845","Finished Course":"480"},
  {"Provider Code":"ANV01","Provider Name":"CENTRE FOR PSYCHOLOGY","Referrals Received":"2,335","Entered Treatment":"2,100","Finished Course":"1,465"},
  {"Provider Code":"ARY01","Provider Name":"THE VILLAGE PRACTICE (THORNTON)","Referrals Received":"1,100","Entered Treatment":"880","Finished Course":"320"},
  {"Provider Code":"AMJ","Provider Name":"LEA VALE MEDICAL GROUP (HQ)","Referrals Received":"2,385","Entered Treatment":"1,710","Finished Course":"1,645"},
  {"Provider Code":"NGR01","Provider Name":"THE COUNSELLING FOUNDATION HQ","Referrals Received":"2,080","Entered Treatment":"1,470","Finished Course":"1,415"},
  {"Provider Code":"NMQ","Provider Name":"MAKING SPACE","Referrals Received":"880","Entered Treatment":"630","Finished Course":"230"},
  {"Provider Code":"8EJ83","Provider Name":"RENNIE GROVE PEACE HOSPICE CARE (PEACE HOSPICE - HQ)","Referrals Received":"1,200","Entered Treatment":"765","Finished Course":"650"},
  {"Provider Code":"8JX60","Provider Name":"MIND IN ENFIELD","Referrals Received":"865","Entered Treatment":"665","Finished Course":"325"},
  {"Provider Code":"DAX02","Provider Name":"MIND IN MID HERTS - HATFIELD ROAD","Referrals Received":"745","Entered Treatment":"300","Finished Course":"205"},
  {"Provider Code":"DWY","Provider Name":"COMMUNITY BARNET","Referrals Received":"570","Entered Treatment":"520","Finished Course":"65"},
  {"Provider Code":"8KJ43","Provider Name":"PURE INNOVATIONS LIMITED","Referrals Received":"575","Entered Treatment":"310","Finished Course":"140"},
  {"Provider Code":"DA6","Provider Name":"BEACON COUNSELLING","Referrals Received":"510","Entered Treatment":"255","Finished Course":"100"},
  {"Provider Code":"DH0","Provider Name":"MIND IN THE CITY, HACKNEY AND WALTHAM FOREST","Referrals Received":"505","Entered Treatment":"415","Finished Course":"120"},
  {"Provider Code":"DHA","Provider Name":"BIKUR CHOLIM LTD","Referrals Received":"495","Entered Treatment":"495","Finished Course":"150"},
  {"Provider Code":"AM7","Provider Name":"SIGN HEALTH (HQ)","Referrals Received":"650","Entered Treatment":"425","Finished Course":"315"},
  {"Provider Code":"H7L3O","Provider Name":"GADDUM CENTRE","Referrals Received":"470","Entered Treatment":"320","Finished Course":"180"},
  {"Provider Code":"DA201","Provider Name":"WE ARE SURVIVORS (SALFORD)","Referrals Received":"380","Entered Treatment":"200","Finished Course":"130"},
  {"Provider Code":"Z2E3K","Provider Name":"SUNDERLAND MIND","Referrals Received":"735","Entered Treatment":"600","Finished Course":"570"},
  {"Provider Code":"GDA01","Provider Name":"MIND IN BARNET (NORTH FINCHLEY)","Referrals Received":"275","Entered Treatment":"290","Finished Course":"120"},
  {"Provider Code":"8HX13","Provider Name":"AFRICAN AND CARIBBEAN MENTAL HEALTH SERVICES","Referrals Received":"215","Entered Treatment":"165","Finished Course":"110"},
  {"Provider Code":"DH8","Provider Name":"DERMAN","Referrals Received":"395","Entered Treatment":"395","Finished Course":"355"},
  {"Provider Code":"DA1","Provider Name":"FREEFLOW COUNSELLING SERVICE","Referrals Received":"335","Entered Treatment":"330","Finished Course":"300"},
  {"Provider Code":"K7Y6R","Provider Name":"FAMILY REFUGEE SUPPORT PROJECT","Referrals Received":"75","Entered Treatment":"50","Finished Course":"50"},
  {"Provider Code":"RRF","Provider Name":"WRIGHTINGTON, WIGAN AND LEIGH NHS FOUNDATION TRUST","Referrals Received":"515"},
  {"Provider Code":"RW5ME","Provider Name":"CAMERON HOUSE","Finished Course":"95"},
  {"Provider Code":"DRL","Provider Name":"42ND STREET","Referrals Received":"70","Entered Treatment":"120","Finished Course":"80"},
  {"Provider Code":"8J724","Provider Name":"LGBT FOUNDATION","Referrals Received":"30","Entered Treatment":"85","Finished Course":"55"},
  {"Provider Code":"R1F","Provider Name":"ISLE OF WIGHT NHS TRUST","Referrals Received":"30","Entered Treatment":"35","Finished Course":"125"},
  {"Provider Code":"NMG","Provider Name":"CONNECT HEALTH LIMITED","Referrals Received":"60","Entered Treatment":"130","Finished Course":"200"},
  {"Provider Code":"RYK","Provider Name":"DUDLEY INTEGRATED HEALTH AND CARE NHS TRUST","Referrals Received":"1,355","Entered Treatment":"935","Finished Course":"1,550"}
];

// Fallback postcodes for providers where ODS lookup may fail
// (sub-sites, small orgs, non-standard codes)
const FALLBACK_POSTCODES = {
  'E0W9O': 'ME14 1KH',    // Kent & Medway — Maidstone
  'G6V2S': 'N15 3TH',     // North London FT — Tottenham
  'S5F7C': 'NG1 6AA',     // Nottinghamshire Talking Therapies
  'P6W4I': 'LE1 5WW',     // VitaMinds Leicester
  'RWRD7': 'B10 0JL',     // Waverley Road, Birmingham
  'AMC05': 'M1 3HZ',      // Self Help Services Manchester
  'RW501': 'PR5 6AW',     // Lancashire & South Cumbria HQ
  'RV3CH': 'NW1 0PE',     // ICCS — Camden
  'RV5CG': 'SE5 8AZ',     // Southwark IAPT
  'RV5CK': 'SE11 5HS',    // Lambeth IAPT
  'RV5CJ': 'CR0 1ER',     // Croydon IAPT
  'RV5CH': 'SE13 6LH',    // Lewisham IAPT
  'RV3L8': 'UB3 4DQ',     // Take Time to Talk — Hillingdon
  'RWK79': 'E15 1EN',     // Newham Talking Therapies
  'RWK4D': 'LU1 2PJ',     // Bedfordshire Talking Therapies
  'RWK53': 'E1 1BB',      // Tower Hamlets
  'RWRG3': 'AL10 8YE',    // Hertfordshire — Hatfield
  'RKL07': 'W5 2BP',      // Ealing
  'RKL42': 'TW3 3EL',     // Hounslow
  'RKL14': 'W6 8RF',      // Hammersmith & Fulham
  'RV3HC': 'HA1 3UJ',     // IAPT Services — Harrow
  'RQY12': 'SW18 2PU',    // Wandsworth IAPT
  'RQYMI': 'SM4 5DX',     // Merton IAPT
  'RQYPR': 'SM1 1EA',     // Sutton IAPT
  'RQY58': 'SW11 1JN',    // St John's Health Centre Battersea
  'RV3DG': 'W2 1RJ',      // Westminster Wellbeing
  'RV383': 'HA1 3UJ',     // Northwick Park Hospital
  'RV3AR': 'TW8 8DS',     // Mill House — Brentford
  'RNUDT': 'OX4 4XN',     // Oxford Talking Therapies
  'RNUDV': 'HP21 8AL',    // Buckinghamshire Talking Therapies
  'RX301': 'DH1 5RD',     // TEWV Durham
  'RX34F': 'YO30 7BY',    // Bootham Park Hospital York
  'RX3YE': 'YO31 8HE',    // The Briary Unit York
  'RX40C': 'SR1 3AP',     // First Step IAPT Sunderland
  'RX4K3': 'SR2 7DN',     // Grange Park Clinic Sunderland
  'RXA29': 'NE15 7PD',    // Denton House Newcastle
  'RXA52': 'NE61 2NP',    // 1829 Building Morpeth
  'RXG10': 'WF1 3SP',     // Fieldhead Hospital Wakefield
  'RXG82': 'S70 4DP',     // Kendray Hospital Barnsley
  'RXX1Y': 'KT18 7EG',    // Mind Matters Surrey — Epsom
  'RT119': 'CB21 5EF',    // Cambs & Peterborough HQ
  'RTF61': 'NE28 7PB',    // Wallsend Health Centre
  'RDYDL': 'SO14 0YG',    // Southampton Psych Therapies
  'RRPJ3': 'EN5 4ND',     // Barnet Talking Therapies
  'RRPJ4': 'EN1 1YQ',     // Enfield Talking Therapies
  'NDC17': 'CH41 4BJ',    // Wirral Talking Therapies
  'NDC10': 'DE1 2PH',     // Everyturn Derbyshire
  'NDC05': 'PE1 1DA',     // Everyturn Peterborough
  'NWC07': 'BS1 3NX',     // VitaMinds Bristol
  'NWC05': 'SS14 1DL',    // VitaMinds Basildon
  'NWC08': 'CM20 1QR',    // VitaMinds West Essex
  'NWC11': 'DE1 2PH',     // VitaMinds Derby
  'NWC12': 'HX1 1UB',     // VitaMinds Calderdale
  'C2J4D': 'NE1 4LP',     // Vita Newcastle IAPT
  'W5N3Z': 'L20 3NJ',     // Talking Matters Sefton
  'NO204': 'NE61 2EF',    // Northumberland Talking Therapies
  'NO202': 'WA1 1QH',     // Warrington Psychological Service
  'NO401': 'HP1 1HL',     // Herts Mind Network Hemel Hempstead
  'AMC04': 'OL16 1JH',    // Rochdale Talking Therapies
  'AMC03': 'SK11 6JL',    // East Cheshire Talking Therapies
  'AME01': 'DA5 1AA',     // Mind in Bexley
  'ALR01': 'B18 7QH',     // Living Well Consortium Birmingham
  'ALR02': 'B18 7QH',     // BMHC-FTB Birmingham
  'AKR01': 'PR1 2HE',     // Lancashire Women
  'AM601': 'CB3 0RE',     // ieso Digital Health — Cambridge
  'AML01': 'WA7 1NT',     // 1Point North West — Runcorn
  'ANV01': 'NW4 3JL',     // Centre for Psychology — Hendon
  'ARY01': 'FY5 4HZ',     // Village Practice Thornton
  'M4P2I': 'KT1 1EU',     // Kingston Talking Therapies
  'T6G0K': 'SK1 1RY',     // Self Help Stockport
  'TAF87': 'N7 8JG',      // Islington IAPT
  'TAF88': 'NW1 2LJ',     // Camden IAPT
  'NLS': 'NG1 5DU',       // Trent PTS
  'NCM': 'M5 4WB',        // Six Degrees Salford
  'NKI': 'SE1 0LL',       // Turning Point
  'NJG': 'DL1 1ST',       // Alliance Psychology — Darlington
  'NCH': 'GU14 7QL',      // TalkPlus — Farnborough
  'NQV': 'BR2 9HT',       // Bromley Healthcare
  'NNF': 'HU3 2PH',       // City Health Care Partnership Hull
  'NNE': 'RH4 1QH',       // Dorking Healthcare
  'NQL': 'DN31 1HB',      // Navigo Grimsby
  'NR5': 'PL6 5FP',       // Livewell Southwest Plymouth
  'NMQ': 'WN1 1XX',       // Making Space — Wigan
  'NMG': 'NE15 8NY',      // Connect Health — Newcastle
  'NGR01': 'RH1 1NB',     // Counselling Foundation — Redhill
  'RW5ME': 'PR5 6AW',     // Cameron House — Lancashire
  'DRL': 'M1 2EQ',        // 42nd Street Manchester
  '8J724': 'M1 1JD',      // LGBT Foundation Manchester
  '8JJ53': 'OL6 6BW',     // Tameside, Oldham and Glossop Mind
  '8JX60': 'EN1 4JA',     // Mind in Enfield
  '8KJ43': 'SK6 1ND',     // Pure Innovations — Stockport
  '8EJ83': 'WD17 2EG',    // Rennie Grove Peace Hospice — Watford
  '8HX13': 'SW9 8EE',     // African & Caribbean MH Services — Brixton
  'DA6': 'L8 0SY',        // Beacon Counselling — Liverpool
  'DA1': 'OL1 1LQ',       // Freeflow Counselling — Oldham
  'DA201': 'M3 7JR',      // We Are Survivors — Salford
  'DAX02': 'AL1 3JE',     // Mind in Mid Herts — St Albans
  'DH0': 'E8 3DY',        // Mind in Hackney
  'DH8': 'N4 2HF',        // Derman — London
  'DHA': 'N16 6AA',       // Bikur Cholim — Stamford Hill
  'DWY': 'N12 0DR',       // Community Barnet
  'AM7': 'SE1 6BD',       // Sign Health
  'H7L3O': 'M3 3BQ',      // Gaddum Centre — Manchester
  'GDA01': 'N12 0DR',     // Mind in Barnet
  'K7Y6R': 'M8 8BH',      // Family Refugee Support — Manchester
  'Z2E3K': 'SR1 1PB',     // Sunderland Mind
  'AMJ': 'LU4 0JF',       // Lea Vale Medical Group — Luton
  'RRF': 'WN1 2NN',       // Wrightington Wigan & Leigh
  'R1F': 'PO30 5TG',      // Isle of Wight NHS Trust
};

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function getPostcodeFromODS(code) {
  // Try the ODS API first
  const data = await fetchJSON(`https://directory.spineservices.nhs.uk/ORD/2-0-0/organisations/${encodeURIComponent(code)}`);
  if (data && data.Organisation && data.Organisation.GeoLoc && data.Organisation.GeoLoc.Location) {
    return data.Organisation.GeoLoc.Location.PostCode || null;
  }
  return null;
}

async function bulkGeocode(postcodes) {
  const res = await fetch('https://api.postcodes.io/postcodes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postcodes })
  });
  if (!res.ok) return {};
  const data = await res.json();
  const map = {};
  for (const r of data.result) {
    if (r.result) {
      map[r.query] = { lat: r.result.latitude, lng: r.result.longitude };
    }
  }
  return map;
}

async function main() {
  console.log(`Processing ${INPUT.length} providers...`);

  // Step 1: Get postcodes for all providers
  const postcodeMap = {};
  let odsHits = 0, fallbackHits = 0, misses = 0;

  for (const provider of INPUT) {
    const code = provider['Provider Code'];

    // Check fallback first (more reliable for sub-sites)
    if (FALLBACK_POSTCODES[code]) {
      postcodeMap[code] = FALLBACK_POSTCODES[code];
      fallbackHits++;
      continue;
    }

    // Try ODS API
    const pc = await getPostcodeFromODS(code);
    if (pc) {
      postcodeMap[code] = pc;
      odsHits++;
    } else {
      console.warn(`  No postcode found for ${code}: ${provider['Provider Name']}`);
      misses++;
    }

    // Rate limit
    await delay(150);
  }

  console.log(`\nPostcodes: ${odsHits} from ODS, ${fallbackHits} from fallbacks, ${misses} missing`);

  // Step 2: Bulk geocode all postcodes
  const allPostcodes = [...new Set(Object.values(postcodeMap))];
  const coordMap = {};

  // Process in batches of 100
  for (let i = 0; i < allPostcodes.length; i += 100) {
    const batch = allPostcodes.slice(i, i + 100);
    const results = await bulkGeocode(batch);
    Object.assign(coordMap, results);
    console.log(`  Geocoded batch ${Math.floor(i/100) + 1}: ${Object.keys(results).length}/${batch.length} resolved`);
    await delay(500);
  }

  // Step 3: Build output
  const output = [];
  let geocoded = 0;

  for (const provider of INPUT) {
    const code = provider['Provider Code'];
    const pc = postcodeMap[code];
    const coords = pc ? coordMap[pc] : null;

    const entry = { ...provider };
    if (coords) {
      entry.Latitude = String(coords.lat);
      entry.Longitude = String(coords.lng);
      geocoded++;
    } else {
      console.warn(`  No coordinates for ${code}: ${provider['Provider Name']}`);
    }
    output.push(entry);
  }

  console.log(`\nGeocoded ${geocoded}/${INPUT.length} providers`);

  // Write output
  const outPath = path.join(__dirname, '..', 'data', 'mh-trusts.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Written to ${outPath}`);
}

main().catch(console.error);
