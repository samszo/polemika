class Geo {
    
    constructor() {
        this.enabled = false;
        if ("geolocation" in navigator 
			&& (
				window.location.href.startsWith("http://127.0.0.1:5000") 
				|| window.location.href.startsWith("https")
			)) {
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