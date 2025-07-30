/**
 * Comprehensive Kenya Administrative Divisions
 * Counties > Sub-Counties > Wards > Specific Areas/Estates
 * Enhanced with detailed estate and landmark data
 */

const kenyaAdministrativeData = {
    counties: [
        {
            name: "Nairobi",
            code: "047",
            subCounties: [
                {
                    name: "Westlands",
                    wards: [
                        {
                            name: "Kitisuru",
                            areas: [
                                "Kitisuru Estate", "Runda Estate", "Muthaiga North", "Spring Valley",
                                "Ridgeways Estate", "Gigiri Estate", "UN Headquarters Area",
                                "Village Market Area", "Two Rivers Mall Area", "Rosslyn Estate"
                            ]
                        },
                        {
                            name: "Parklands/Highridge",
                            areas: [
                                "Parklands", "Highridge", "Ngara", "Pangani Estate",
                                "Museum Hill", "State House Area", "Uhuru Park Area",
                                "Central Park", "Ngong Road Forest", "City Stadium Area"
                            ]
                        },
                        {
                            name: "Karura",
                            areas: [
                                "Karura Forest", "Two Rivers", "Kiambu Road", "Limuru Road",
                                "Rosslyn Academy Area", "UN Avenue", "Gigiri Shopping Centre",
                                "Muthaiga Shopping Centre", "Windsor Golf Club Area"
                            ]
                        },
                        {
                            name: "Kangemi",
                            areas: [
                                "Kangemi Market", "Kangemi Estate", "ABC Place", "Waiyaki Way",
                                "Mountain View Estate", "Uthiru", "Kinoo", "Kabete Campus Area"
                            ]
                        },
                        {
                            name: "Mountain View",
                            areas: [
                                "Mountain View Estate", "Lavington", "Dennis Pritt Road",
                                "Lavington Mall Area", "James Gichuru Road", "Lenana Road",
                                "Arboretum Estate", "State House Road"
                            ]
                        }
                    ]
                },
                {
                    name: "Dagoretti North",
                    wards: [
                        {
                            name: "Kilimani",
                            areas: [
                                "Kilimani Estate", "Hurlingham", "Kileleshwa", "Lavington Green",
                                "Galeria Shopping Mall", "Adam's Arcade", "Junction Shopping Mall",
                                "Ralph Bunche Road", "Wood Avenue", "Argwings Kodhek Road"
                            ]
                        },
                        {
                            name: "Kawangware",
                            areas: [
                                "Kawangware 46", "Kawangware 56", "Riruta Satellite",
                                "Kawangware Market", "Stage 46", "Stage 56", "Dagoretti Corner"
                            ]
                        },
                        {
                            name: "Gatina",
                            areas: [
                                "Gatina Estate", "Kawangware Market", "Gatina Shopping Centre",
                                "Gichagi Road", "Kabete Road"
                            ]
                        },
                        {
                            name: "Kileleshwa",
                            areas: [
                                "Kileleshwa Estate", "Ring Road Kileleshwa", "General Mathenge",
                                "Mandera Road", "Kirichwa Road", "Ring Road Kilimani"
                            ]
                        },
                        {
                            name: "Kabiro",
                            areas: [
                                "Kabiro Estate", "Gitanga Road", "Kibagare",
                                "Karen Road", "Langata Road Junction"
                            ]
                        }
                    ]
                },
                {
                    name: "Langata",
                    wards: [
                        {
                            name: "Karen",
                            areas: [
                                "Karen Estate", "Karen Shopping Centre", "Bogani Road", "Dagoretti Corner",
                                "Karen Country Club", "Giraffe Centre Area", "Bomas of Kenya Area",
                                "Karen Blixen Museum Area", "Kazuri Beads Area", "Sheldrick Elephant Orphanage Area"
                            ]
                        },
                        {
                            name: "Nairobi West",
                            areas: [
                                "Nairobi West Estate", "Madaraka Estate", "Nyayo Stadium Area",
                                "Wilson Airport Area", "Langata Road", "Enterprise Road"
                            ]
                        },
                        {
                            name: "South C",
                            areas: [
                                "South C Estate", "Capital Centre", "Bellevue",
                                "Muindi Mbingu Street", "Valley Road", "Chaka Road"
                            ]
                        },
                        {
                            name: "Nyayo Highrise",
                            areas: [
                                "Nyayo Highrise Estate", "Embakasi Village", "Mukuru Slums",
                                "Industrial Area", "Enterprise Road"
                            ]
                        }
                    ]
                },
                {
                    name: "Embakasi East",
                    wards: [
                        {
                            name: "Utawala",
                            areas: [
                                "Utawala Estate", "Eastern Bypass", "Joska Road",
                                "Utawala Shopping Centre", "Mihango", "Kamulu Township"
                            ]
                        },
                        {
                            name: "Mihango",
                            areas: [
                                "Mihango Estate", "Njiru", "Kamulu", "Joska",
                                "Ruai", "Eastern Bypass Mihango"
                            ]
                        },
                        {
                            name: "Upper Savannah",
                            areas: [
                                "Savannah Estate", "Fedha Estate", "Pipeline Estate",
                                "Donholm Estate", "Greenfields Estate"
                            ]
                        },
                        {
                            name: "Lower Savannah",
                            areas: [
                                "Pipeline", "Kware", "Mukuru Kwa Njenga",
                                "Kariobangi South", "Lunga Lunga"
                            ]
                        },
                        {
                            name: "Embakasi",
                            areas: [
                                "Embakasi Village", "Kariobangi Light Industries",
                                "Mukuru Kwa Reuben", "Tassia Estate"
                            ]
                        }
                    ]
                },
                {
                    name: "Embakasi West",
                    wards: [
                        {
                            name: "Umoja I",
                            areas: [
                                "Umoja 1 Estate", "Umoja Inner Core", "Tena Estate",
                                "Lunar Estate", "Mareba Estate"
                            ]
                        },
                        {
                            name: "Umoja II",
                            areas: [
                                "Umoja 2 Estate", "Umoja Innercore", "Mowlem Estate",
                                "Maasai Lodge Estate", "Taj Mall Area"
                            ]
                        },
                        {
                            name: "Mowlem",
                            areas: [
                                "Mowlem Estate", "Buruburu Estate", "Eastleigh Section III",
                                "Kamukunji Estate"
                            ]
                        },
                        {
                            name: "Kariobangi South",
                            areas: [
                                "Kariobangi South Estate", "Light Industries",
                                "Korogocho", "Grogan Estate"
                            ]
                        }
                    ]
                },
                {
                    name: "Embakasi North",
                    wards: [
                        {
                            name: "Kariobangi North",
                            areas: [
                                "Kariobangi North Estate", "Lucky Summer",
                                "Korogocho", "Grogan Estate B"
                            ]
                        },
                        {
                            name: "Dandora Area I",
                            areas: [
                                "Dandora Phase I", "Kariobangi Market",
                                "Moscow Estate", "Baba Dogo"
                            ]
                        },
                        {
                            name: "Dandora Area II",
                            areas: [
                                "Dandora Phase II", "Kariobangi Shopping Centre",
                                "Clay City", "Kariobangi Light Industries"
                            ]
                        },
                        {
                            name: "Dandora Area III",
                            areas: [
                                "Dandora Phase III", "Korogocho Market",
                                "Gitathuru Estate"
                            ]
                        },
                        {
                            name: "Dandora Area IV",
                            areas: [
                                "Dandora Phase IV", "Baba Dogo Estate",
                                "Utalii Estate", "Ruaraka Estate"
                            ]
                        }
                    ]
                },
                {
                    name: "Embakasi Central",
                    wards: [
                        {
                            name: "Kayole North",
                            areas: [
                                "Kayole North Estate", "Kayole Market",
                                "Soweto East", "Mihango Estate"
                            ]
                        },
                        {
                            name: "Kayole Central",
                            areas: [
                                "Kayole Central Estate", "Matopeni",
                                "Spring Valley Estate", "Saika Estate"
                            ]
                        },
                        {
                            name: "Kayole South",
                            areas: [
                                "Kayole South Estate", "Komarock Estate",
                                "Matopeni Shopping Centre"
                            ]
                        },
                        {
                            name: "Komarock",
                            areas: [
                                "Komarock Estate", "Kayole Junction",
                                "Matopeni Estate", "Njiru Shopping Centre"
                            ]
                        },
                        {
                            name: "Matopeni/Spring Valley",
                            areas: [
                                "Spring Valley Estate", "Matopeni Estate",
                                "Saika Estate", "Komarock Shopping Centre"
                            ]
                        }
                    ]
                },
                {
                    name: "Embakasi South",
                    wards: [
                        {
                            name: "Imara Daima",
                            areas: [
                                "Imara Daima Estate", "Mukuru Kwa Njenga",
                                "Pipeline Estate", "Kware"
                            ]
                        },
                        {
                            name: "Kwa Njenga",
                            areas: [
                                "Mukuru Kwa Njenga", "Kwa Njenga Market",
                                "Lunga Lunga Industrial Area"
                            ]
                        },
                        {
                            name: "Kwa Reuben",
                            areas: [
                                "Mukuru Kwa Reuben", "Industrial Area Extension",
                                "Tassia Estate"
                            ]
                        },
                        {
                            name: "Pipeline",
                            areas: [
                                "Pipeline Estate", "Kware Estate",
                                "Lunga Lunga", "Mukuru Slums"
                            ]
                        },
                        {
                            name: "Kware",
                            areas: [
                                "Kware Estate", "Pipeline Junction",
                                "South Industrial Area"
                            ]
                        }
                    ]
                }
                // ...continuing with existing wards...
            ]
        },
        {
            name: "Mombasa",
            code: "001",
            subCounties: [
                {
                    name: "Changamwe",
                    wards: [
                        {
                            name: "Port Reitz",
                            areas: [
                                "Port Reitz Estate", "Changamwe Town", "Kipevu Estate",
                                "Port Reitz Creek", "Changamwe Shopping Centre"
                            ]
                        },
                        {
                            name: "Kipevu",
                            areas: [
                                "Kipevu Estate", "Port of Mombasa Area", "Changamwe Industrial Area",
                                "Miritini Estate"
                            ]
                        },
                        {
                            name: "Airport",
                            areas: [
                                "Moi International Airport Area", "Airport Estate",
                                "Mombasa-Malindi Road", "Miritini"
                            ]
                        },
                        {
                            name: "Changamwe",
                            areas: [
                                "Changamwe Town Centre", "Changamwe Market",
                                "Industrial Area Changamwe", "Port Area"
                            ]
                        },
                        {
                            name: "Chaani",
                            areas: [
                                "Chaani Estate", "Chaani Shopping Centre",
                                "Miritini Junction"
                            ]
                        }
                    ]
                },
                {
                    name: "Nyali",
                    wards: [
                        {
                            name: "Frere Town",
                            areas: [
                                "Frere Town Estate", "Links Road", "Nyali Golf Club Area",
                                "Nyali Shopping Centre", "Nyali Beach Area"
                            ]
                        },
                        {
                            name: "Ziwa la Ng'ombe",
                            areas: [
                                "Ziwa la Ngombe", "Kongowea Market",
                                "Mkomani Estate"
                            ]
                        },
                        {
                            name: "Mkomani",
                            areas: [
                                "Mkomani Estate", "Bamburi Road",
                                "Nyali Bridge Area", "Nyali Cinemax Area"
                            ]
                        },
                        {
                            name: "Kongowea",
                            areas: [
                                "Kongowea Market", "Kongowea Estate",
                                "Mombasa-Malindi Road", "Bamburi Junction"
                            ]
                        },
                        {
                            name: "Kadzandani",
                            areas: [
                                "Kadzandani Estate", "Bombolulu Workshops Area",
                                "Bamburi Beach Area"
                            ]
                        }
                    ]
                },
                {
                    name: "Kisauni",
                    wards: [
                        {
                            name: "Mjambere",
                            areas: [
                                "Mjambere Estate", "Bamburi Estate",
                                "Shanzu Beach Area", "Serena Beach Area"
                            ]
                        },
                        {
                            name: "Junda",
                            areas: [
                                "Junda Estate", "Bamburi Beach",
                                "Pirates Beach Area"
                            ]
                        },
                        {
                            name: "Bamburi",
                            areas: [
                                "Bamburi Estate", "Bamburi Beach Hotels",
                                "Bamburi Cement Area", "Haller Park Area"
                            ]
                        },
                        {
                            name: "Mwakirunge",
                            areas: [
                                "Mwakirunge Estate", "Shanzu Beach",
                                "Whitesands Beach Area"
                            ]
                        },
                        {
                            name: "Mtopanga",
                            areas: [
                                "Mtopanga Estate", "Kikambala Area",
                                "Vipingo Area"
                            ]
                        },
                        {
                            name: "Magogoni",
                            areas: [
                                "Magogoni Estate", "Kisauni Market",
                                "Mombasa-Malindi Highway"
                            ]
                        }
                    ]
                }
                // ...continuing with other sub-counties...
            ]
        },
        {
            name: "Kisumu",
            code: "042",
            subCounties: [
                {
                    name: "Kisumu East",
                    wards: [
                        {
                            name: "Railway",
                            areas: [
                                "Railway Estate", "Kisumu Railway Station Area",
                                "Kisumu Port Area", "Oginga Odinga Street"
                            ]
                        },
                        {
                            name: "Migosi",
                            areas: [
                                "Migosi Estate", "Tom Mboya Estate",
                                "Milimani Estate", "Kisumu Boys Area"
                            ]
                        },
                        {
                            name: "Shaurimoyo Kaloleni",
                            areas: [
                                "Shauri Moyo", "Kaloleni Estate",
                                "Kondele Market", "Kisumu Municipal Market"
                            ]
                        },
                        {
                            name: "Market Milimani",
                            areas: [
                                "Milimani Estate", "Kisumu Central Market",
                                "Kisumu CBD", "Imperial Hotel Area"
                            ]
                        },
                        {
                            name: "Kondele",
                            areas: [
                                "Kondele Market", "Kondele Estate",
                                "Kibuye Market", "Mamboleo"
                            ]
                        },
                        {
                            name: "Nyalenda A",
                            areas: [
                                "Nyalenda A Estate", "Nyalenda Market",
                                "Bandani Estate"
                            ]
                        },
                        {
                            name: "Nyalenda B",
                            areas: [
                                "Nyalenda B Estate", "Manyatta Estate",
                                "Car Wash Area"
                            ]
                        }
                    ]
                }
                // ...continuing with other sub-counties...
            ]
        },
        {
            name: "Mombasa",
            code: "001",
            subCounties: [
                {
                    name: "Mvita",
                    wards: [
                        {
                            name: "Mji wa Kale/Makadara",
                            areas: [
                                "Old Town", "Makadara", "Mji wa Kale", "Fort Jesus Area",
                                "Treasury Square", "Nkrumah Road", "Government Square"
                            ]
                        },
                        {
                            name: "Tudor/Tononoka",
                            areas: [
                                "Tudor", "Tononoka", "Majengo", "Bondeni",
                                "Tudor Creek", "Mbaraki", "Kizingo"
                            ]
                        }
                    ]
                },
                {
                    name: "Changamwe",
                    wards: [
                        {
                            name: "Port Reitz",
                            areas: [
                                "Port Reitz", "Kipevu", "Airport", "Changamwe Town",
                                "Miritini", "Chaani"
                            ]
                        },
                        {
                            name: "Kipevu/Kipevu",
                            areas: [
                                "Kipevu Industrial Area", "Kenya Pipeline", "Oil Refinery Area",
                                "Changamwe Market", "Mikindani"
                            ]
                        }
                    ]
                },
                {
                    name: "Nyali",
                    wards: [
                        {
                            name: "Frere Town",
                            areas: [
                                "Frere Town", "Ziwa la Ngombe", "Kongowea", "Kadzandani",
                                "Mtopanga", "Bombolulu"
                            ]
                        },
                        {
                            name: "Nyali",
                            areas: [
                                "Nyali Estate", "Links Road", "Nyali Beach", "Cinemax Area",
                                "Mombasa Academy", "City Mall", "Nyali Centre"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            name: "Kiambu",
            code: "022",
            subCounties: [
                {
                    name: "Thika Town",
                    wards: [
                        {
                            name: "Hospital",
                            areas: [
                                "Thika Town", "Hospital Area", "Section 7", "Makongeni",
                                "Kiandutu", "Thika Road", "Blue Post Hotel Area"
                            ]
                        },
                        {
                            name: "Township",
                            areas: [
                                "Thika Township", "Municipal Stadium", "Uhuru Park",
                                "Jamhuri Estate", "Section 6", "Section 8"
                            ]
                        }
                    ]
                },
                {
                    name: "Ruiru",
                    wards: [
                        {
                            name: "Biashara",
                            areas: [
                                "Ruiru Town", "Bypass", "Membley Estate", "Toll Station",
                                "Ruiru Market", "Railway Station"
                            ]
                        },
                        {
                            name: "Gatongora",
                            areas: [
                                "Gatongora", "Kahawa Sukari", "Kahawa West", "Membley",
                                "Githurai 44", "Githurai 45"
                            ]
                        }
                    ]
                },
                {
                    name: "Kiambu",
                    wards: [
                        {
                            name: "Township",
                            areas: [
                                "Kiambu Town", "Municipal Market", "Kiambu Road",
                                "Tea Research Foundation", "Kiambu Institute"
                            ]
                        },
                        {
                            name: "Ting'ang'a",
                            areas: [
                                "Tinganga", "Ndumberi", "Riabai", "Gitothua",
                                "Komothai", "Muchatha"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            name: "Nakuru",
            code: "020",
            subCounties: [
                {
                    name: "Nakuru Town East",
                    wards: [
                        {
                            name: "Biashara",
                            areas: [
                                "Town Centre", "Nakuru CBD", "Stadium Area", "Railways",
                                "Nakuru Market", "Central Police Station Area"
                            ]
                        },
                        {
                            name: "Shaabab",
                            areas: [
                                "Section 58", "London", "Shabab Estate", "Flamingo Estate",
                                "Lake View Estate", "Free Area"
                            ]
                        }
                    ]
                },
                {
                    name: "Nakuru Town West",
                    wards: [
                        {
                            name: "Kapkures",
                            areas: [
                                "Kapkures", "Section 45", "Lanet", "Ngata",
                                "Bondeni", "Kaptembwa"
                            ]
                        },
                        {
                            name: "Rhonda",
                            areas: [
                                "Rhonda Estate", "Section 7", "Race Course Area",
                                "Milimani Estate", "Hill School Area"
                            ]
                        }
                    ]
                },
                {
                    name: "Bahati",
                    wards: [
                        {
                            name: "Bahati",
                            areas: [
                                "Bahati Town", "Kiamaina", "Dundori", "Kabatini",
                                "Lanet Umoja", "Menengai Crater Area"
                            ]
                        },
                        {
                            name: "Lanet/Umoja",
                            areas: [
                                "Lanet Barracks", "Umoja Estate", "KDF Lanet",
                                "Menengai Forest", "Crater Lake Area"
                            ]
                        }
                    ]
                }
            ]
        }
        // Add more counties with enhanced detail...
    ]
};

// Additional utility functions for enhanced location features
const locationUtils = {
    /**
     * Get all areas for a specific ward
     */
    getAreasForWard: function(countyName, subCountyName, wardName) {
        const county = this.getCounty(countyName);
        if (!county) return [];
        
        const subCounty = county.subCounties.find(sc => sc.name === subCountyName);
        if (!subCounty) return [];
        
        const ward = subCounty.wards.find(w => w.name === wardName);
        return ward ? ward.areas : [];
    },
    
    /**
     * Get county by name
     */
    getCounty: function(name) {
        return kenyaAdministrativeData.counties.find(c => c.name === name);
    },
    
    /**
     * Search for areas containing a keyword
     */
    searchAreas: function(keyword) {
        const results = [];
        kenyaAdministrativeData.counties.forEach(county => {
            county.subCounties.forEach(subCounty => {
                subCounty.wards.forEach(ward => {
                    if (ward.areas) {
                        ward.areas.forEach(area => {
                            if (area.toLowerCase().includes(keyword.toLowerCase())) {
                                results.push({
                                    area: area,
                                    ward: ward.name,
                                    subCounty: subCounty.name,
                                    county: county.name
                                });
                            }
                        });
                    }
                });
            });
        });
        return results;
    }
};

// Create a simplified structure for the frontend forms
const kenyaLocations = {};

// Convert the administrative data to the format expected by the frontend
kenyaAdministrativeData.counties.forEach(county => {
    kenyaLocations[county.name] = {};
    
    county.subCounties.forEach(subCounty => {
        kenyaLocations[county.name][subCounty.name] = [];
        
        subCounty.wards.forEach(ward => {
            kenyaLocations[county.name][subCounty.name].push(ward.name);
        });
    });
});

// Also create a simpler structure for quick access
const kenyanCounties = kenyaAdministrativeData.counties.map(county => county.name);

// Export for easy access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { kenyaLocations, kenyaAdministrativeData, kenyanCounties };
}
