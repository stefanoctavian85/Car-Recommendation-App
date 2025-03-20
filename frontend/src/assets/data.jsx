const data = [
    {
        question: "Anul productiei",
        type: 'range',
        min: 1900,
        max: 2025,
    },
    {
        question: "Selectati tipul de combustibil preferat",
        type: 'choice',
        options: ["Benzina", "Diesel", "Hibrid"],
    },
    {
        question: "Capacitate cilindrica",
        type: 'range',
        min: 875,
        max: 5461,
    },
    {
        question: "Putere",
        type: 'range',
        min: 55,
        max: 727,
    },
    {
        question: "Ce tip de caroserie preferati?",
        type: 'choice',
        options: ["Compact", "Monovolum", "Sedan", "Sport", "SUV"],
    },
    {
        question: "Selectati cutia de viteze dorita",
        type: 'choice',
        options: ["Manuala", "Automata"],
    },
    {
        question: "Ce tip de transmisie preferati?",
        type: 'choice',
        options: ["Fata", "Spate", "4x4"],
    },
    {
        question: "Nr. de KM",
        type: 'range',
        min: 0,
        max: 1000000,
    },
    {
        question: "Bugetul mediu pentru masina",
        type: 'range',
        min: 1000,
        max: 336000,
        step: 1000
    },
    {
        question: "Consum urban mediu",
        type: 'number',
        min: 3,
        max: 23,
    },
    {
        question: "Consum extraurban mediu",
        type: 'number',
        min: 3,
        max: 13,
    },
];

export default data;