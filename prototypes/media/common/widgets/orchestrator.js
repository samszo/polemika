/*****************************
 * Aims to manage asynchonous script callbacks. When a javascript component need to wait for the end of the initialisation of another, you can sync a callback to start after another one piece of code ends.
 * @author BROTTIER Erwan - erwan.brottier@amo-it.com - https://www.amo-it.com 
 * @version 1.2
 * @date December 12, 2016
 * @category framework
 * @copyright (c) Erwan Brottier
 * @license CC Attribution-Share Alike 3.0 - http://creativecommons.org/licenses/by-sa/3.0/
 */
$.orchestrator = {
	debug : false,
	log : function() {
		if ($.orchestrator.debug && arguments.length > 0)  {			
			console.log("orchestrator >> "+arguments[0]);
			for (var i = 1; i < arguments.length; i++) {				
				console.log(arguments[i]);
			}
		}
	},
    locks : {},
    reset : function() {
        var lockNamesToKill = [];
    	for (var lockName in $.orchestrator.locks) {
        	if (!$.orchestrator.locks[lockName].immortal) {
        		lockNamesToKill.push(lockName);        		
        	}
        }
    	for (var i = 0; i < lockNamesToKill.length; i++) {
    		var lockNameToKill = lockNamesToKill[i];
    		delete $.orchestrator.locks[lockNameToKill];
    	}
    },
    resetLock : function(lockName) {
    	delete $.orchestrator.locks[lockName];
    },
    // parameters :
    //  - name  : [OPT] the name of the lock to create. if undefined or null, the function return null
    getLock : function(name) {
        if (name in $.orchestrator.locks) {
        	return $.orchestrator.locks[name].lock;
        } else
            return null;
    },
    // parameters :
    //  - name  : [OPT] the name of the lock to create.
    //  - immortal : [OPT] wether the lock is cleaned by reset method (false by default if name is provided, otherwise true)
    createLock : function(name, immortal) {
        var lock = $.Deferred();
        if (typeof name != 'undefined') {
            if (name in $.orchestrator.locks) {
    			var message = "lock "+name+" already exist";
        		console.log("!> "+message);
        		throw message;
            } else if (typeof immortal === 'undefined') {
        		immortal = false;
        	}
        	$.orchestrator.locks[name] = {
        		lock : lock,
        		immortal : immortal
        	};
        }
        return lock;
    },
    // parameters :
    //  - name  : [OPT] the name of the lock to get or create                
    //  - immortal : [OPT] wether the lock is cleaned by reset method (false by default if name is provided, otherwise true)
    gotLock : function(name, immortal) {                     
    	$.orchestrator.log("gotLock", name, immortal);
    	if (typeof name != 'undefined') {
            var lock = $.orchestrator.getLock(name);
            if (lock != null) {
            	if (typeof immortal !== 'undefined' && immortal == true) {
            		$.orchestrator.locks[name]["immortal"] = true;
            	}
            	return lock;
            }
            else
                return $.orchestrator.createLock(name, immortal);
        } else
            return $.orchestrator.createLock();
    },
    _getLockFrom : function(lockDef, result) {
        if (typeof lockDef === 'string')
            result.push($.orchestrator.gotLock(lockDef));
        else if (lockDef instanceof Array) {
            for (var i = 0; i < lockDef.length; i++) {                            
                $.orchestrator._getLockFrom(lockDef[i], result);
            }
        } else
            result.push(lockDef);
    },
    // parameters :
    //  - lockDefs : lock or array of lock (specified by name (String) or by a Deferred object)
    //  -   doneCallback : function 
    //  -   failCallback : function
    //  -   alwaysCallback : function
    sync : function(lockDefs, doneCallback, failCallback) {
        // get the locks
        var theLocks = [];
        $.orchestrator._getLockFrom(lockDefs, theLocks); 
        if (theLocks.length == 0)
            throw "no locks definitions found [$.orchestrator.sync]"
        // bind callbacks
        $.when.apply($,theLocks).then(doneCallback, failCallback);
    }
}