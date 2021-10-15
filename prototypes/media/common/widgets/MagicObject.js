/* if true, all log are enabled */
$.loggingAll = false;
class MagicObject {

    constructor() {
        /* override this attribute with true value in subclass to enable logs */
        this.loggingMode = false;
    }
    log() {
        if ($.loggingAll)
            console.log(this.constructor.name+">", ...arguments);
        else if (this.loggingMode == true)
            console.log(this.constructor.name+">", ...arguments);
    }
}