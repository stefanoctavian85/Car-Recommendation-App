const data = [
    {
        question: "Year of production",
        type: 'range',
        min: 1990,
        max: 2025,
    },
    {
        question: "Cylidrincal capacity",
        type: 'range',
        min: 800,
        max: 5000,
    },
    {
        question: "Horsepower",
        type: 'range',
        min: 50,
        max: 700,
    },
    {
        question: "What gearbox do you want?",
        type: 'choice',
        options: ["Manuala", "Automata"],
    },
    {
        question: "Which body type do you prefer?",
        type: 'choice',
        options: ["Compact", "Monovolum", "Sedan", "Sport", "SUV"],
    },
    {
        question: "Select fuel type",
        type: 'choice',
        options: ['Benzina', 'Diesel', 'Hibrid', 'Electric'],
    },
    {
        question: 'What car transmission are you looking for?',
        type: 'choice',
        options: ["Fata", "Spate", "4x4"],
    },
    {
        question: "Car price",
        type: 'range',
        min: 1000,
        max: 350000,
        step: 1000
    },
    {
        question: "Average urban consumption for the car",
        type: 'number',
        min: 3,
        max: 23,
    },
    {
        question: "Average extraurban consumption for the car",
        type: 'number',
        min: 3,
        max: 13,
    },
];

export default data;