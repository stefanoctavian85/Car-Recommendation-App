class CarsStore {
    constructor() {
        this.cars = [];
    }

    setCars(cars) {
        this.cars = cars;
    }

    getCars() {
        return this.cars;
    }
}

export default CarsStore;