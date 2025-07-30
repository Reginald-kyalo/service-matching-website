/**
 * Comprehensive Service Categories and Listings
 * This file contains the master list of all services and categories
 * used throughout the application for consistency
 */

// Main service categories with display names, descriptions, and color schemes
export const SERVICE_CATEGORIES = {
    plumbing: {
        name: "Plumbing",
        description: "Water systems, pipes, and drainage solutions",
        icon: "fas fa-wrench",
        color: "blue",
        colorClasses: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-700",
            hover: "hover:bg-blue-100",
            button: "bg-blue-600 hover:bg-blue-700",
            badge: "bg-blue-100 text-blue-800"
        }
    },
    electrical: {
        name: "Electrical",
        description: "Wiring, lighting, and electrical installations",
        icon: "fas fa-bolt",
        color: "yellow",
        colorClasses: {
            bg: "bg-yellow-50",
            border: "border-yellow-200",
            text: "text-yellow-700",
            hover: "hover:bg-yellow-100",
            button: "bg-yellow-600 hover:bg-yellow-700",
            badge: "bg-yellow-100 text-yellow-800"
        }
    },
    hvac: {
        name: "HVAC",
        description: "Heating, ventilation, and air conditioning",
        icon: "fas fa-temperature-high",
        color: "orange",
        colorClasses: {
            bg: "bg-orange-50",
            border: "border-orange-200",
            text: "text-orange-700",
            hover: "hover:bg-orange-100",
            button: "bg-orange-600 hover:bg-orange-700",
            badge: "bg-orange-100 text-orange-800"
        }
    },
    carpentry: {
        name: "Carpentry",
        description: "Wood work, furniture, and custom installations",
        icon: "fas fa-hammer",
        color: "amber",
        colorClasses: {
            bg: "bg-amber-50",
            border: "border-amber-200",
            text: "text-amber-700",
            hover: "hover:bg-amber-100",
            button: "bg-amber-600 hover:bg-amber-700",
            badge: "bg-amber-100 text-amber-800"
        }
    },
    painting: {
        name: "Painting",
        description: "Interior and exterior painting services",
        icon: "fas fa-paint-brush",
        color: "green",
        colorClasses: {
            bg: "bg-green-50",
            border: "border-green-200",
            text: "text-green-700",
            hover: "hover:bg-green-100",
            button: "bg-green-600 hover:bg-green-700",
            badge: "bg-green-100 text-green-800"
        }
    },
    cleaning: {
        name: "Cleaning",
        description: "Residential and commercial cleaning services",
        icon: "fas fa-broom",
        color: "teal",
        colorClasses: {
            bg: "bg-teal-50",
            border: "border-teal-200",
            text: "text-teal-700",
            hover: "hover:bg-teal-100",
            button: "bg-teal-600 hover:bg-teal-700",
            badge: "bg-teal-100 text-teal-800"
        }
    },
    appliance_repair: {
        name: "Appliance Repair",
        description: "Repair and maintenance of home appliances",
        icon: "fas fa-tools",
        color: "purple",
        colorClasses: {
            bg: "bg-purple-50",
            border: "border-purple-200",
            text: "text-purple-700",
            hover: "hover:bg-purple-100",
            button: "bg-purple-600 hover:bg-purple-700",
            badge: "bg-purple-100 text-purple-800"
        }
    },
    gardening: {
        name: "Gardening & Landscaping",
        description: "Garden maintenance and landscape design",
        icon: "fas fa-seedling",
        color: "emerald",
        colorClasses: {
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            text: "text-emerald-700",
            hover: "hover:bg-emerald-100",
            button: "bg-emerald-600 hover:bg-emerald-700",
            badge: "bg-emerald-100 text-emerald-800"
        }
    },
    security: {
        name: "Security & Safety",
        description: "Security systems and safety installations",
        icon: "fas fa-shield-alt",
        color: "red",
        colorClasses: {
            bg: "bg-red-50",
            border: "border-red-200",
            text: "text-red-700",
            hover: "hover:bg-red-100",
            button: "bg-red-600 hover:bg-red-700",
            badge: "bg-red-100 text-red-800"
        }
    },
    roofing: {
        name: "Roofing",
        description: "Roof installation, repair, and maintenance",
        icon: "fas fa-home",
        color: "slate",
        colorClasses: {
            bg: "bg-slate-50",
            border: "border-slate-200",
            text: "text-slate-700",
            hover: "hover:bg-slate-100",
            button: "bg-slate-600 hover:bg-slate-700",
            badge: "bg-slate-100 text-slate-800"
        }
    },
    flooring: {
        name: "Flooring",
        description: "Floor installation and refinishing",
        icon: "fas fa-th-large",
        color: "stone",
        colorClasses: {
            bg: "bg-stone-50",
            border: "border-stone-200",
            text: "text-stone-700",
            hover: "hover:bg-stone-100",
            button: "bg-stone-600 hover:bg-stone-700",
            badge: "bg-stone-100 text-stone-800"
        }
    },
    general_handyman: {
        name: "General Handyman",
        description: "Various small repairs and maintenance tasks",
        icon: "fas fa-toolbox",
        color: "gray",
        colorClasses: {
            bg: "bg-gray-50",
            border: "border-gray-200",
            text: "text-gray-700",
            hover: "hover:bg-gray-100",
            button: "bg-gray-600 hover:bg-gray-700",
            badge: "bg-gray-100 text-gray-800"
        }
    },
    // Additional service categories commonly needed in Kenya
    pest_control: {
        name: "Pest Control",
        description: "Eliminate pests and prevent infestations",
        icon: "fas fa-bug",
        color: "red",
        colorClasses: {
            bg: "bg-red-50",
            border: "border-red-200",
            text: "text-red-700",
            hover: "hover:bg-red-100",
            button: "bg-red-600 hover:bg-red-700",
            badge: "bg-red-100 text-red-800"
        }
    },
    moving: {
        name: "Moving & Transport",
        description: "Moving services and transportation",
        icon: "fas fa-truck",
        color: "blue",
        colorClasses: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-700",
            hover: "hover:bg-blue-100",
            button: "bg-blue-600 hover:bg-blue-700",
            badge: "bg-blue-100 text-blue-800"
        }
    },
    automotive: {
        name: "Automotive Services",
        description: "Car repairs and maintenance",
        icon: "fas fa-car",
        color: "orange",
        colorClasses: {
            bg: "bg-orange-50",
            border: "border-orange-200",
            text: "text-orange-700",
            hover: "hover:bg-orange-100",
            button: "bg-orange-600 hover:bg-orange-700",
            badge: "bg-orange-100 text-orange-800"
        }
    },
    wellness: {
        name: "Health & Wellness",
        description: "Personal care and wellness services",
        icon: "fas fa-heart",
        color: "pink",
        colorClasses: {
            bg: "bg-pink-50",
            border: "border-pink-200",
            text: "text-pink-700",
            hover: "hover:bg-pink-100",
            button: "bg-pink-600 hover:bg-pink-700",
            badge: "bg-pink-100 text-pink-800"
        }
    },
    business_services: {
        name: "Business Services",
        description: "Professional and business support services",
        icon: "fas fa-briefcase",
        color: "indigo",
        colorClasses: {
            bg: "bg-indigo-50",
            border: "border-indigo-200",
            text: "text-indigo-700",
            hover: "hover:bg-indigo-100",
            button: "bg-indigo-600 hover:bg-indigo-700",
            badge: "bg-indigo-100 text-indigo-800"
        }
    },
    catering: {
        name: "Catering & Events",
        description: "Food service and event planning",
        icon: "fas fa-utensils",
        color: "yellow",
        colorClasses: {
            bg: "bg-yellow-50",
            border: "border-yellow-200",
            text: "text-yellow-700",
            hover: "hover:bg-yellow-100",
            button: "bg-yellow-600 hover:bg-yellow-700",
            badge: "bg-yellow-100 text-yellow-800"
        }
    },
    tutoring: {
        name: "Education & Tutoring",
        description: "Educational services and tutoring",
        icon: "fas fa-graduation-cap",
        color: "emerald",
        colorClasses: {
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            text: "text-emerald-700",
            hover: "hover:bg-emerald-100",
            button: "bg-emerald-600 hover:bg-emerald-700",
            badge: "bg-emerald-100 text-emerald-800"
        }
    },
    technology: {
        name: "Tech Support",
        description: "Computer and technology services",
        icon: "fas fa-laptop",
        color: "cyan",
        colorClasses: {
            bg: "bg-cyan-50",
            border: "border-cyan-200",
            text: "text-cyan-700",
            hover: "hover:bg-cyan-100",
            button: "bg-cyan-600 hover:bg-cyan-700",
            badge: "bg-cyan-100 text-cyan-800"
        }
    }
};

// Comprehensive service listings organized by category
export const SERVICES = {
    plumbing: [
        {
            id: "plumbing_001",
            name: "Pipe Installation",
            description: "Install new water supply or drainage pipes",
            category: "plumbing",
            typical_rate: 2500,
            urgency_keywords: ["leak", "burst", "flooding", "no water"]
        },
        {
            id: "plumbing_002", 
            name: "Leak Repair",
            description: "Fix leaking pipes, faucets, or fixtures",
            category: "plumbing",
            typical_rate: 1500,
            urgency_keywords: ["leak", "dripping", "water damage"]
        },
        {
            id: "plumbing_003",
            name: "Toilet Repair/Installation",
            description: "Fix or install toilets and related plumbing",
            category: "plumbing",
            typical_rate: 2000,
            urgency_keywords: ["toilet blocked", "toilet broken", "bathroom flooded"]
        },
        {
            id: "plumbing_004",
            name: "Drain Cleaning",
            description: "Clear blocked drains and sewage lines",
            category: "plumbing",
            typical_rate: 1800,
            urgency_keywords: ["blocked", "clogged", "overflow", "backup"]
        },
        {
            id: "plumbing_005",
            name: "Water Heater Service",
            description: "Install, repair, or maintain water heaters",
            category: "plumbing",
            typical_rate: 3500,
            urgency_keywords: ["no hot water", "cold shower", "heater broken"]
        },
        {
            id: "plumbing_006",
            name: "Faucet Installation",
            description: "Install or replace kitchen and bathroom faucets",
            category: "plumbing",
            typical_rate: 1200,
            urgency_keywords: ["no water", "faucet broken"]
        }
    ],
    electrical: [
        {
            id: "electrical_001",
            name: "Wiring Installation",
            description: "Install electrical wiring for new constructions or renovations",
            category: "electrical",
            typical_rate: 3000,
            urgency_keywords: ["no power", "electrical fire", "sparks", "shock"]
        },
        {
            id: "electrical_002",
            name: "Outlet Installation",
            description: "Install new electrical outlets and switches",
            category: "electrical",
            typical_rate: 800,
            urgency_keywords: ["no power", "outlet not working"]
        },
        {
            id: "electrical_003",
            name: "Light Fixture Installation",
            description: "Install ceiling lights, chandeliers, and other fixtures",
            category: "electrical",
            typical_rate: 1500,
            urgency_keywords: ["no lights", "darkness", "bulb won't work"]
        },
        {
            id: "electrical_004",
            name: "Circuit Breaker Repair",
            description: "Fix or replace circuit breakers and electrical panels",
            category: "electrical",
            typical_rate: 4000,
            urgency_keywords: ["power outage", "breaker tripping", "no electricity"]
        },
        {
            id: "electrical_005",
            name: "Emergency Electrical Repair",
            description: "Urgent electrical issues and safety concerns",
            category: "electrical",
            typical_rate: 5000,
            urgency_keywords: ["electrical emergency", "sparks", "burning smell", "shock"]
        },
        {
            id: "electrical_006",
            name: "Security System Wiring",
            description: "Install wiring for security cameras and alarm systems",
            category: "electrical",
            typical_rate: 2500,
            urgency_keywords: ["security breach", "alarm not working"]
        }
    ],
    hvac: [
        {
            id: "hvac_001",
            name: "Air Conditioning Installation",
            description: "Install new AC units and cooling systems",
            category: "hvac",
            typical_rate: 15000,
            urgency_keywords: ["no cooling", "hot", "overheating"]
        },
        {
            id: "hvac_002",
            name: "AC Repair & Maintenance",
            description: "Repair and service air conditioning units",
            category: "hvac",
            typical_rate: 3500,
            urgency_keywords: ["ac not working", "not cooling", "hot air"]
        },
        {
            id: "hvac_003",
            name: "Ventilation System Installation",
            description: "Install exhaust fans and ventilation systems",
            category: "hvac",
            typical_rate: 4500,
            urgency_keywords: ["poor ventilation", "stuffy", "condensation"]
        },
        {
            id: "hvac_004",
            name: "Duct Cleaning & Repair",
            description: "Clean and repair air ducts and vents",
            category: "hvac",
            typical_rate: 2500,
            urgency_keywords: ["poor air quality", "dust", "allergies"]
        },
        {
            id: "hvac_005",
            name: "Heating System Service",
            description: "Install and repair heating systems",
            category: "hvac",
            typical_rate: 8000,
            urgency_keywords: ["no heat", "cold", "heater broken"]
        }
    ],
    carpentry: [
        {
            id: "carpentry_001",
            name: "Custom Furniture Building",
            description: "Build custom cabinets, shelves, and furniture",
            category: "carpentry",
            typical_rate: 8000,
            urgency_keywords: ["broken furniture", "storage needed"]
        },
        {
            id: "carpentry_002",
            name: "Door Installation",
            description: "Install interior and exterior doors",
            category: "carpentry",
            typical_rate: 3500,
            urgency_keywords: ["door broken", "security issue", "won't close"]
        },
        {
            id: "carpentry_003",
            name: "Window Installation",
            description: "Install and repair windows and frames",
            category: "carpentry",
            typical_rate: 4500,
            urgency_keywords: ["broken window", "draft", "security risk"]
        },
        {
            id: "carpentry_004",
            name: "Deck Construction",
            description: "Build outdoor decks and patios",
            category: "carpentry",
            typical_rate: 25000,
            urgency_keywords: ["deck collapsed", "unsafe structure"]
        },
        {
            id: "carpentry_005",
            name: "Kitchen Cabinet Installation",
            description: "Install kitchen cabinets and countertops",
            category: "carpentry",
            typical_rate: 12000,
            urgency_keywords: ["cabinet broken", "kitchen renovation"]
        },
        {
            id: "carpentry_006",
            name: "Trim and Molding",
            description: "Install decorative trim and molding",
            category: "carpentry",
            typical_rate: 2500,
            urgency_keywords: ["damaged trim", "finishing touches"]
        }
    ],
    painting: [
        {
            id: "painting_001",
            name: "Interior Painting",
            description: "Paint interior walls, ceilings, and trim",
            category: "painting",
            typical_rate: 5000,
            urgency_keywords: ["damaged wall", "stains", "peeling paint"]
        },
        {
            id: "painting_002",
            name: "Exterior Painting",
            description: "Paint building exteriors and outdoor structures",
            category: "painting",
            typical_rate: 8000,
            urgency_keywords: ["weather damage", "fading", "protection needed"]
        },
        {
            id: "painting_003",
            name: "Wallpaper Installation",
            description: "Install and remove wallpaper",
            category: "painting",
            typical_rate: 3500,
            urgency_keywords: ["damaged wallpaper", "peeling", "renovation"]
        },
        {
            id: "painting_004",
            name: "Surface Preparation",
            description: "Prepare surfaces for painting including sanding and priming",
            category: "painting",
            typical_rate: 2000,
            urgency_keywords: ["rough surface", "old paint", "preparation"]
        },
        {
            id: "painting_005",
            name: "Decorative Painting",
            description: "Specialty painting techniques and finishes",
            category: "painting",
            typical_rate: 4500,
            urgency_keywords: ["special finish", "artistic touch"]
        }
    ],
    cleaning: [
        {
            id: "cleaning_001",
            name: "Deep House Cleaning",
            description: "Comprehensive cleaning of entire home",
            category: "cleaning",
            typical_rate: 3500,
            urgency_keywords: ["dirty", "messy", "unhygienic", "guests coming"]
        },
        {
            id: "cleaning_002",
            name: "Carpet Cleaning",
            description: "Professional carpet and upholstery cleaning",
            category: "cleaning",
            typical_rate: 2500,
            urgency_keywords: ["stains", "odor", "dirty carpet"]
        },
        {
            id: "cleaning_003",
            name: "Window Cleaning",
            description: "Clean interior and exterior windows",
            category: "cleaning",
            typical_rate: 1500,
            urgency_keywords: ["dirty windows", "poor visibility"]
        },
        {
            id: "cleaning_004",
            name: "Post-Construction Cleanup",
            description: "Clean up after construction or renovation work",
            category: "cleaning",
            typical_rate: 4500,
            urgency_keywords: ["construction mess", "dust", "debris"]
        },
        {
            id: "cleaning_005",
            name: "Pressure Washing",
            description: "Pressure wash driveways, walls, and outdoor surfaces",
            category: "cleaning",
            typical_rate: 2000,
            urgency_keywords: ["mold", "dirt buildup", "stains"]
        }
    ],
    appliance_repair: [
        {
            id: "appliance_001",
            name: "Refrigerator Repair",
            description: "Fix refrigerators and freezers",
            category: "appliance_repair",
            typical_rate: 3000,
            urgency_keywords: ["not cooling", "spoiled food", "leaking", "broken fridge"]
        },
        {
            id: "appliance_002",
            name: "Washing Machine Repair",
            description: "Repair washing machines and dryers",
            category: "appliance_repair",
            typical_rate: 2500,
            urgency_keywords: ["not washing", "leaking", "won't spin", "no clean clothes"]
        },
        {
            id: "appliance_003",
            name: "Oven/Stove Repair",
            description: "Fix ovens, stoves, and cooking appliances",
            category: "appliance_repair",
            typical_rate: 2800,
            urgency_keywords: ["not heating", "gas leak", "can't cook", "oven broken"]
        },
        {
            id: "appliance_004",
            name: "Dishwasher Repair",
            description: "Repair and maintain dishwashers",
            category: "appliance_repair",
            typical_rate: 2200,
            urgency_keywords: ["not cleaning", "leaking", "won't drain"]
        },
        {
            id: "appliance_005",
            name: "Microwave Repair",
            description: "Fix microwaves and small appliances",
            category: "appliance_repair",
            typical_rate: 1500,
            urgency_keywords: ["not heating", "sparks", "broken microwave"]
        }
    ],
    gardening: [
        {
            id: "gardening_001",
            name: "Garden Design & Landscaping",
            description: "Design and create beautiful garden layouts",
            category: "gardening",
            typical_rate: 8000,
            urgency_keywords: ["overgrown", "poor curb appeal", "landscape needed"]
        },
        {
            id: "gardening_002",
            name: "Lawn Maintenance",
            description: "Regular lawn mowing and care",
            category: "gardening",
            typical_rate: 1500,
            urgency_keywords: ["overgrown grass", "messy yard", "needs cutting"]
        },
        {
            id: "gardening_003",
            name: "Tree Trimming & Removal",
            description: "Prune and remove trees safely",
            category: "gardening",
            typical_rate: 5000,
            urgency_keywords: ["dangerous tree", "storm damage", "blocking view"]
        },
        {
            id: "gardening_004",
            name: "Irrigation System Installation",
            description: "Install sprinkler and watering systems",
            category: "gardening",
            typical_rate: 6500,
            urgency_keywords: ["dry plants", "watering difficulty", "drought"]
        },
        {
            id: "gardening_005",
            name: "Pest Control for Gardens",
            description: "Control pests and diseases in gardens",
            category: "gardening",
            typical_rate: 2000,
            urgency_keywords: ["insects", "plant disease", "pest infestation"]
        }
    ],
    security: [
        {
            id: "security_001",
            name: "Security Camera Installation",
            description: "Install CCTV and surveillance systems",
            category: "security",
            typical_rate: 8000,
            urgency_keywords: ["theft", "break-in", "security concern", "unsafe"]
        },
        {
            id: "security_002",
            name: "Alarm System Installation",
            description: "Install burglar and fire alarm systems",
            category: "security",
            typical_rate: 6500,
            urgency_keywords: ["security threat", "break-in", "safety concern"]
        },
        {
            id: "security_003",
            name: "Lock Installation & Repair",
            description: "Install and repair door and window locks",
            category: "security",
            typical_rate: 2500,
            urgency_keywords: ["locked out", "broken lock", "security risk"]
        },
        {
            id: "security_004",
            name: "Gate & Fence Installation",
            description: "Install security gates and perimeter fencing",
            category: "security",
            typical_rate: 12000,
            urgency_keywords: ["no security", "open access", "perimeter breach"]
        },
        {
            id: "security_005",
            name: "Safe Installation",
            description: "Install safes and secure storage solutions",
            category: "security",
            typical_rate: 4500,
            urgency_keywords: ["valuables", "document security", "theft protection"]
        }
    ],
    roofing: [
        {
            id: "roofing_001",
            name: "Roof Repair",
            description: "Fix leaks and damaged roofing materials",
            category: "roofing",
            typical_rate: 5500,
            urgency_keywords: ["leak", "water damage", "rain coming in", "ceiling wet"]
        },
        {
            id: "roofing_002",
            name: "Roof Installation",
            description: "Install new roofing systems",
            category: "roofing",
            typical_rate: 35000,
            urgency_keywords: ["no roof", "major damage", "replacement needed"]
        },
        {
            id: "roofing_003",
            name: "Gutter Installation",
            description: "Install and repair gutters and downspouts",
            category: "roofing",
            typical_rate: 4500,
            urgency_keywords: ["water damage", "overflow", "foundation risk"]
        },
        {
            id: "roofing_004",
            name: "Roof Inspection",
            description: "Comprehensive roof condition assessment",
            category: "roofing",
            typical_rate: 1500,
            urgency_keywords: ["storm damage", "insurance claim", "buying house"]
        },
        {
            id: "roofing_005",
            name: "Skylight Installation",
            description: "Install skylights and roof windows",
            category: "roofing",
            typical_rate: 8000,
            urgency_keywords: ["dark room", "natural light needed"]
        }
    ],
    flooring: [
        {
            id: "flooring_001",
            name: "Hardwood Floor Installation",
            description: "Install and finish hardwood flooring",
            category: "flooring",
            typical_rate: 12000,
            urgency_keywords: ["damaged floor", "renovation", "unsafe walking"]
        },
        {
            id: "flooring_002",
            name: "Tile Installation",
            description: "Install ceramic, marble, and stone tiles",
            category: "flooring",
            typical_rate: 8500,
            urgency_keywords: ["broken tiles", "water damage", "slippery floor"]
        },
        {
            id: "flooring_003",
            name: "Carpet Installation",
            description: "Install carpeting and padding",
            category: "flooring",
            typical_rate: 6000,
            urgency_keywords: ["worn carpet", "cold floor", "noise issues"]
        },
        {
            id: "flooring_004",
            name: "Floor Refinishing",
            description: "Sand and refinish existing wood floors",
            category: "flooring",
            typical_rate: 7500,
            urgency_keywords: ["scratched floor", "dull finish", "wear damage"]
        },
        {
            id: "flooring_005",
            name: "Vinyl/Laminate Installation",
            description: "Install vinyl and laminate flooring",
            category: "flooring",
            typical_rate: 5500,
            urgency_keywords: ["budget renovation", "water resistant needed"]
        }
    ],
    general_handyman: [
        {
            id: "handyman_001",
            name: "General Home Repairs",
            description: "Various small repairs and maintenance tasks",
            category: "general_handyman",
            typical_rate: 2000,
            urgency_keywords: ["small repair", "maintenance", "quick fix"]
        },
        {
            id: "handyman_002",
            name: "Furniture Assembly",
            description: "Assemble furniture and equipment",
            category: "general_handyman",
            typical_rate: 1500,
            urgency_keywords: ["assembly needed", "furniture delivery", "setup required"]
        },
        {
            id: "handyman_003",
            name: "Picture Hanging & Mounting",
            description: "Hang pictures, mirrors, and mount TVs",
            category: "general_handyman",
            typical_rate: 1000,
            urgency_keywords: ["tv mounting", "wall hanging", "decoration"]
        },
        {
            id: "handyman_004",
            name: "Caulking & Sealing",
            description: "Seal gaps around windows, doors, and bathrooms",
            category: "general_handyman",
            typical_rate: 1200,
            urgency_keywords: ["draft", "water leak", "air gap", "energy loss"]
        },
        {
            id: "handyman_005",
            name: "Home Maintenance Check",
            description: "General home inspection and preventive maintenance",
            category: "general_handyman",
            typical_rate: 2500,
            urgency_keywords: ["maintenance due", "inspection needed", "prevention"]
        }
    ],
    pest_control: [
        {
            id: "pest_001",
            name: "Cockroach Extermination",
            description: "Professional cockroach removal and prevention",
            category: "pest_control",
            typical_rate: 3000,
            urgency_keywords: ["cockroaches", "roaches", "infestation", "hygiene"]
        },
        {
            id: "pest_002",
            name: "Termite Treatment",
            description: "Termite inspection and treatment services",
            category: "pest_control",
            typical_rate: 8000,
            urgency_keywords: ["termites", "wood damage", "structural damage"]
        },
        {
            id: "pest_003",
            name: "Rodent Control",
            description: "Mice and rat removal services",
            category: "pest_control",
            typical_rate: 2500,
            urgency_keywords: ["mice", "rats", "rodents", "droppings"]
        },
        {
            id: "pest_004",
            name: "Bedbugs Treatment",
            description: "Professional bedbug elimination",
            category: "pest_control",
            typical_rate: 4500,
            urgency_keywords: ["bedbugs", "bites", "sleep", "mattress"]
        },
        {
            id: "pest_005",
            name: "General Fumigation",
            description: "Comprehensive pest control fumigation",
            category: "pest_control",
            typical_rate: 6000,
            urgency_keywords: ["fumigation", "all pests", "comprehensive"]
        }
    ],
    moving: [
        {
            id: "moving_001",
            name: "House Moving",
            description: "Complete household moving services",
            category: "moving",
            typical_rate: 15000,
            urgency_keywords: ["relocation", "moving house", "urgent move"]
        },
        {
            id: "moving_002",
            name: "Office Relocation",
            description: "Commercial and office moving services",
            category: "moving",
            typical_rate: 25000,
            urgency_keywords: ["office move", "business relocation"]
        },
        {
            id: "moving_003",
            name: "Furniture Transport",
            description: "Transport large furniture and appliances",
            category: "moving",
            typical_rate: 3500,
            urgency_keywords: ["furniture delivery", "appliance transport"]
        },
        {
            id: "moving_004",
            name: "Packing Services",
            description: "Professional packing and unpacking",
            category: "moving",
            typical_rate: 5000,
            urgency_keywords: ["packing help", "fragile items"]
        }
    ],
    automotive: [
        {
            id: "auto_001",
            name: "Car Repair",
            description: "General automotive repairs and maintenance",
            category: "automotive",
            typical_rate: 8000,
            urgency_keywords: ["car broken", "engine trouble", "mechanical"]
        },
        {
            id: "auto_002",
            name: "Battery Service",
            description: "Car battery replacement and charging",
            category: "automotive",
            typical_rate: 1500,
            urgency_keywords: ["dead battery", "won't start", "battery"]
        },
        {
            id: "auto_003",
            name: "Tire Service",
            description: "Tire repair, replacement, and balancing",
            category: "automotive",
            typical_rate: 2500,
            urgency_keywords: ["flat tire", "puncture", "tire burst"]
        },
        {
            id: "auto_004",
            name: "Car Wash & Detailing",
            description: "Professional car cleaning services",
            category: "automotive",
            typical_rate: 1200,
            urgency_keywords: ["dirty car", "car wash", "detailing"]
        }
    ],
    wellness: [
        {
            id: "wellness_001",
            name: "Massage Therapy",
            description: "Professional massage and therapy services",
            category: "wellness",
            typical_rate: 3000,
            urgency_keywords: ["stress", "pain", "relaxation", "therapy"]
        },
        {
            id: "wellness_002",
            name: "Personal Training",
            description: "Fitness coaching and personal training",
            category: "wellness",
            typical_rate: 2500,
            urgency_keywords: ["fitness", "weight loss", "exercise"]
        },
        {
            id: "wellness_003",
            name: "Hair & Beauty Services",
            description: "Professional hair and beauty treatments",
            category: "wellness",
            typical_rate: 2000,
            urgency_keywords: ["haircut", "beauty", "styling"]
        }
    ],
    business_services: [
        {
            id: "business_001",
            name: "Accounting Services",
            description: "Bookkeeping and tax preparation",
            category: "business_services",
            typical_rate: 5000,
            urgency_keywords: ["taxes", "accounting", "bookkeeping"]
        },
        {
            id: "business_002",
            name: "Legal Services",
            description: "Legal consultation and document preparation",
            category: "business_services",
            typical_rate: 8000,
            urgency_keywords: ["legal advice", "contract", "lawsuit"]
        },
        {
            id: "business_003",
            name: "Marketing Services",
            description: "Digital marketing and advertising",
            category: "business_services",
            typical_rate: 6000,
            urgency_keywords: ["marketing", "advertising", "promotion"]
        }
    ],
    catering: [
        {
            id: "catering_001",
            name: "Event Catering",
            description: "Food service for events and parties",
            category: "catering",
            typical_rate: 12000,
            urgency_keywords: ["party", "event", "wedding", "catering"]
        },
        {
            id: "catering_002",
            name: "Personal Chef",
            description: "Private cooking and meal preparation",
            category: "catering",
            typical_rate: 4000,
            urgency_keywords: ["private chef", "home cooking", "meals"]
        },
        {
            id: "catering_003",
            name: "Event Planning",
            description: "Complete event planning and coordination",
            category: "catering",
            typical_rate: 15000,
            urgency_keywords: ["event planning", "party planning", "coordination"]
        }
    ],
    tutoring: [
        {
            id: "tutoring_001",
            name: "Academic Tutoring",
            description: "Subject-specific tutoring for students",
            category: "tutoring",
            typical_rate: 1500,
            urgency_keywords: ["homework help", "exam preparation", "tutoring"]
        },
        {
            id: "tutoring_002",
            name: "Language Teaching",
            description: "Foreign language instruction",
            category: "tutoring",
            typical_rate: 2000,
            urgency_keywords: ["learn language", "english lessons", "swahili"]
        },
        {
            id: "tutoring_003",
            name: "Skills Training",
            description: "Professional and technical skills training",
            category: "tutoring",
            typical_rate: 3000,
            urgency_keywords: ["skills training", "certification", "course"]
        }
    ],
    technology: [
        {
            id: "tech_001",
            name: "Computer Repair",
            description: "PC and laptop repair services",
            category: "technology",
            typical_rate: 3500,
            urgency_keywords: ["computer broken", "laptop repair", "blue screen"]
        },
        {
            id: "tech_002",
            name: "Phone Repair",
            description: "Smartphone and tablet repair",
            category: "technology",
            typical_rate: 2500,
            urgency_keywords: ["phone broken", "cracked screen", "water damage"]
        },
        {
            id: "tech_003",
            name: "Network Setup",
            description: "WiFi and network installation",
            category: "technology",
            typical_rate: 4000,
            urgency_keywords: ["no internet", "wifi setup", "network"]
        },
        {
            id: "tech_004",
            name: "Data Recovery",
            description: "Recover lost files and data",
            category: "technology",
            typical_rate: 5000,
            urgency_keywords: ["lost data", "file recovery", "hard drive crash"]
        }
    ]
};

// Helper functions to work with the service data
export const ServiceUtils = {
    // Get all services as a flat array
    getAllServices() {
        const allServices = [];
        Object.keys(SERVICES).forEach(category => {
            allServices.push(...SERVICES[category]);
        });
        return allServices;
    },

    // Get services by category
    getServicesByCategory(categoryKey) {
        return SERVICES[categoryKey] || [];
    },

    // Get category information
    getCategoryInfo(categoryKey) {
        return SERVICE_CATEGORIES[categoryKey] || null;
    },

    // Get all category keys
    getCategoryKeys() {
        return Object.keys(SERVICE_CATEGORIES);
    },

    // Search services by name or description
    searchServices(searchTerm) {
        const allServices = this.getAllServices();
        const term = searchTerm.toLowerCase();
        return allServices.filter(service => 
            service.name.toLowerCase().includes(term) ||
            service.description.toLowerCase().includes(term)
        );
    },

    // Find services by urgency keywords
    findUrgentServices(problemDescription) {
        const allServices = this.getAllServices();
        const description = problemDescription.toLowerCase();
        
        return allServices.filter(service => 
            service.urgency_keywords.some(keyword => 
                description.includes(keyword.toLowerCase())
            )
        );
    },

    // Get color classes for a category
    getCategoryColors(categoryKey) {
        const category = SERVICE_CATEGORIES[categoryKey];
        return category ? category.colorClasses : SERVICE_CATEGORIES.general_handyman.colorClasses;
    },

    // Format service data for API responses
    formatForAPI() {
        return {
            categories: Object.keys(SERVICE_CATEGORIES).reduce((acc, key) => {
                acc[key] = SERVICE_CATEGORIES[key].name;
                return acc;
            }, {}),
            services: this.getAllServices()
        };
    }
};

// Export default for easy importing
export default {
    SERVICE_CATEGORIES,
    SERVICES,
    ServiceUtils
};
