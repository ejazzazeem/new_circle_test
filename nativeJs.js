/**
 * Created by SAhmed on 1/30/2018.
 */
var ismeta = false;
// validates dateinput
function isNumberKey(event, ctrl) {
    var key = window.event ? event.keyCode : event.which;

    ismeta = event.ctrlKey;
    if (ismeta) {
        return;
    }
    if (key === 8 ) { // allowed enter
        return true;
    }
    if (key === 13) {
        if (!isIE()) {
            ctrl.blur();
            return true;
        } else {
            var s = Date.parse(ctrl.value);
            if (isNaN(s)) {
                return false;
            } else {
                return true;
            }
        }

    }
    //         Keyboard number keys  || Numpad number Keys        ||  Tab
    else if ((key >= 48 && key<= 57) || (key >= 96 && key <= 105) || key === 9 || key ===46) {
        var targetValue = ctrl.value;

        if (targetValue.length < 2) {
            if (key === 47) {
                return false;
            }

        } else if (targetValue.length === 2) {
            if (targetValue.indexOf('/') === -1) {
                if (key === 47) {
                    return true;
                } else {
                    ctrl.value = event.target.value + "/";
                }
            } else {
                return false;
            }

        }
        else if (targetValue.length > 2 && targetValue.length < 5) {
            if (key === 47) {
                return false;
            } else {
                return true;
            }
        }
        else if (event.target.value.length === 5) {
            if (key === 47) {
                return true;
            } else {
                ctrl.value = event.target.value + "/";
            }



        } else if (event.target.value.length > 6) {
            if (key === 47) {
                return false;
            }
        }

        return true;
    }

    return false;
}




function isValidDate(dateString) {
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if (year < 1000 || month === 0 || month > 12)
        return false;

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
}


function isSSN(event, ctrl) {
    var key = window.event ? event.keyCode : event.which;
    ismeta = event.ctrlKey;
    if (ismeta) {
        return;
    }
    if (event.keyCode === 8 || event.keyCode === 46 || event.keyCode === 45 ) {
        return true;
    }

    if (event.keyCode ===13) {
        if (!isIE()) {
            ctrl.blur();
        }
        return '^(\d{3}-?\d{2}-?\d{4}|XXX-XX-XXXX)$'.test(ctrl.value());
    }
    //         Keyboard numebr keys  || Numpad number Keys        ||  Tab
    else if ((key >= 48 && key<= 57) || (key >= 96 && key <= 105) || key === 9) {
        var targetValue = document.getElementById("SSN").value;

        if (targetValue.length === 3 && targetValue.indexOf('-') === -1) {
            document.getElementById("SSN").value = event.target.value + "-";
        } else if (event.target.value.length === 6) {
            document.getElementById("SSN").value = event.target.value + "-";
        }

        return true;
    }
    return false;

}

// validates dateinput
function isNumeric(event) {
    var key = window.event ? event.keyCode : event.which;

    if (key === 8) {
        return true;
    }
    else if (key < 47 || (key > 57 )) {
        return false;
    }
    else {

        return true;

    }

}

function isZip(event, ctrl) {
    var key = window.event ? event.keyCode : event.which;
    ismeta = event.ctrlKey;
    if (ismeta) {
        return;
    }
    if (event.keyCode === 8 || event.keyCode === 46 || event.keyCode === 45 ) {
        return true;
    }

    // if (event.keyCode ===13) {
    //     if (!isIE()) {
    //         ctrl.blur();
    //     }
    //     return '^[0-9]{5}(?:-[0-9]{4})?$'.test(ctrl.value());
    // }
    //         Keyboard numebr keys  || Numpad number Keys        ||  Tab
     if ((key >= 48 && key<= 57) || (key >= 96 && key <= 105) || key === 9) {
        var targetValue = document.getElementById("zipC").value;

        if (targetValue.length === 5 && targetValue.indexOf('-') === -1) {
            document.getElementById("zipC").value = event.target.value + "-";
        }

        return true;
    }
    return false;

}

function isIE() {
    return   /*@cc_on!@*/false || !!document.documentMode;
}

