class CarsStore {
    constructor() {
        this.cars = [];
        this.car = '';
    }

    setCars(cars) {
        this.cars = cars;
    }

    getCars() {
        return this.cars;
    }

    setCar(car) {
        this.car = car;
    }

    getCar() {
        return this.car;
    }
}

export default CarsStore;