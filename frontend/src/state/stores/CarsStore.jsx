class CarsStore {
    constructor() {
        this.car = '';
        this.searchParams = {};
    }

    setCar(car) {
        this.car = car;
    }

    getCar() {
        return this.car;
    }

    setSearchParams(searchParams) {
        this.searchParams = searchParams;
    }

    getSearchParams() {
        return this.searchParams;
    }
}

export default CarsStore;