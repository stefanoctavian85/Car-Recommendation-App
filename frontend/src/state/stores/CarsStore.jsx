class CarsStore {
    constructor() {
        this.car = '';
        this.searchParams = {};
        this.reservation = {};
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

    setReservation(reservation) {
        this.reservation = reservation;
    }

    getReservation() {
        return this.reservation;
    }
}

export default CarsStore;