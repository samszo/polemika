class Geo {
    
    constructor() {
        this.enabled = false;
        if ("geolocation" in navigator) {
            this.enabled = true;
        }    
    }
    getPosition(callback) {
        if (this.enabled) {
            navigator.geolocation.getCurrentPosition(function(position) {
                callback(position.coords);
            });
        } else
            callback(null);
    }
}